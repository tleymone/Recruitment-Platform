var express = require('express');
var router = express.Router();
var usersModel = require('../model/users.js');
var jobOfferModel = require('../model/jobOffer.js');
var jobSheetModel = require('../model/jobSheet.js');
var jobTypeModel = require('../model/jobType.js');
var statusModel = require('../model/status.js');
var organisationModel = require('../model/organisation.js');
var typeOrgModel = require('../model/typeOrg.js');
var applicationModel = require('../model/application.js');
var pieceModel = require('../model/piece.js');
var indexRoutes = require('./index.js');
var multer = require('multer');

const upload = multer(); // Create an instance of multer

/* Create a middleware that will check if the user is logged in */
function isLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
}

/* GET candidate page.. */
router.get('/', isLoggedIn, async function (req, res, next) {

    const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);

    const [jobOfferData, statusData, jobSheetData, jobTypeData, organisationData, typeOrgData, applicationData, userData] = await Promise.all([
        jobOfferModel.readall(),
        statusModel.readall(),
        jobSheetModel.readall(),
        jobTypeModel.readall(),
        organisationModel.readall(),
        typeOrgModel.readall(),
        applicationModel.readallUser(req.session.user),
        usersModel.readById(req.session.user)
    ]);

    if (org != null) {
        [orgName] = await Promise.all([organisationModel.readName(org)]);
    } else {
        orgName = null;
    }

    const pieces = [];

    if (applicationData != undefined) {
        for (application of applicationData) {
            const [piecesData] = await Promise.all([pieceModel.readallApp(application.id)]);
            for (let piece of piecesData) {
                pieces.push(piece)
            }

        }
    }

    res.render('candidate', {
        title: 'Liste des offres d\'emploi',
        jobOffers: jobOfferData,
        jobSheets: jobSheetData,
        jobTypes: jobTypeData,
        organisations: organisationData,
        typeOrgs: typeOrgData,
        applications: applicationData,
        piecesList: pieces,
        status: statusData,
        userRole: req.session.role,
        orgName: orgName,
        userData: userData,
    });
});


router.post('/apply', isLoggedIn, upload.any(), function (req, res, next) {
    const user = req.session.user;
    const jobOffer = parseInt(req.body.jobOffer);
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const mysqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    applicationModel.create(user, jobOffer, mysqlDate, function (ApplicationId) {
        for (var i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const data = file.buffer;
            pieceModel.create(ApplicationId, file.fieldname + "." + file.originalname.split('.').pop(), file.buffer, function (PieceId) {
                //console.log(PieceId);
            });

        }
    });

    res.redirect('/candidate');
});

router.post('/updateApplication', isLoggedIn, upload.any(), function (req, res, next) {
    const user = req.session.user;
    const application = req.body.applicationId;
    for (var i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // save file to delete it later
        var pieceId = 0;

        pieceModel.readFromAppAndName(application, file.fieldname, function (pieces) {
            if (pieces.length > 0) {
                pieceId = pieces[0].id;
            }
            

            pieceModel.create(application, file.fieldname + "." + file.originalname.split('.').pop(), file.buffer, function (PieceId) {
                //console.log("Piece ajouté ", PieceId);
            });
    
            if (pieceId != 0) {
                pieceModel.delete(pieceId, function (affectedRows) {});
            }
        });        
    }
    
    res.redirect('/candidate');
});

/* POST delete Offer */
router.post('/deleteApplication', isLoggedIn, function (req, res, next) {
    const ApplicationId = parseInt(req.body.applicationId);
  
    applicationModel.fDelete(ApplicationId, function (affectedRows) {
        console.log('ID de la table Application supprimé: ' + affectedRows);
        res.status(200).send('L\'application a été supprimée avec succès !');
    });
  });

router.post('/assignRecruiter', isLoggedIn, async function (req, res, next) {
    // Récupérer les données envoyées dans la requête
    const user = req.session.user;
    
    var orgSiren = parseInt(req.body.selectedOrg);    
    // Si l'utilisateur a sélectionné une organisation existante
    if (orgSiren == -1) {
        const newOrgName = req.body.newOrgName;
        const newOrgAddress = req.body.newOrgAddress;
        var newOrgTypeId = parseInt(req.body.selectedOrgType);
        if (newOrgTypeId == -1) {
            const newOrgType = req.body.newOrgType;
            newOrgTypeId = await typeOrgModel.create(newOrgType);
            //console.log('ID inséré dans la table TypeOrganisation : ' + newOrgTypeId);
        }

        // Création de l'organisation
        orgSiren = req.body.newOrgSiren;
        const insertId = await organisationModel.create(orgSiren, newOrgName, newOrgTypeId, newOrgAddress);
        //console.log('ID inséré dans la table Organisation : ' + insertId);
    }
    // Ajout de la demande pour devenir recruteur
    usersModel.assignOrg(user, orgSiren, function (affectedRows) {
        //console.log('ID inséré dans la table Recruiter : ' + affectedRows);
    }
    );
    res.status(200).send('Votre demande a été envoyée avec succès !');
});

module.exports = router;