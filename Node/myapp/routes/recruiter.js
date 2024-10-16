var express = require('express');
var router = express.Router();
var jobSheetModel = require('../model/jobSheet.js');
var jobOfferModel = require('../model/jobOffer.js');
var jobTypeModel = require('../model/jobType.js');
var statusModel = require('../model/status.js');
var usersModel = require('../model/users.js');
var applicationModel = require('../model/application.js');
var pieceModel = require('../model/piece.js');
var organisationModel = require('../model/organisation.js');

/* Create a middleware that will check if the user is logged in */
function isLoggedIn(req, res, next) {
  if (req.session.loggedin) {
    if (req.session.role == "Candidate") {
      res.redirect('/candidate');
    } else {
      next();
    }
  } else {
    res.redirect('/login?redirect=recruiter');
  }
}

router.get('/', isLoggedIn, async function (req, res, next) {

  const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);
  const [orgName] = await Promise.all([organisationModel.readName(org)]);
  const [userData] = await Promise.all([usersModel.readById(req.session.user)]);

  let [jobSheetData, jobTypeData, jobOfferData, statusData, joinRequestsData] = await Promise.all([
    jobSheetModel.readallOrg(org),
    jobTypeModel.readall(),
    jobOfferModel.readallOrg(org),
    statusModel.readall(),
    usersModel.getJoinRequests(org),
  ]);

  // Depending on admin, change results
  if (req.session.role == "Admin") {
    [jobSheetData, jobOfferData, joinRequestsData] = await Promise.all([
      jobSheetModel.readall(),
      jobOfferModel.readall(),
      usersModel.getAllJoinRequests()
    ]);
  }

  res.render('recruiter', {
    title: 'Page Recruteur',
    jobSheets: jobSheetData,
    jobTypes: jobTypeData,
    jobOffers: jobOfferData,
    status: statusData,
    joinRequests: joinRequestsData,
    userRole: req.session.role,
    orgName: orgName,
    userlname: userData.lname,
    userfname: userData.fname,
  });
});


/* POST Get Application Data */
router.post('/getApplicationsData', isLoggedIn, async function (req, res, next) {
  const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);

  // Check if the user can access this application
  const [jobOfferData] = await Promise.all([jobOfferModel.read(req.body.jobOfferNumber)]);
  const [jobSheetData] = await Promise.all([jobSheetModel.read(jobOfferData.jobSheet)]);
  results_json = []

  if (jobSheetData.organisation === org || req.session.role == "Admin") {
    let [applicationData] = await Promise.all([
      applicationModel.readFromJobOffer(req.body.jobOfferNumber),
    ]);
    applicationData = JSON.parse(JSON.stringify(applicationData))

    for (let [index, application] of applicationData.entries()) {
      result_json = {}
      result_json['id'] = application['id']

      // Pieces
      const pieces = JSON.parse(JSON.stringify(await pieceModel.readallApp(application.id)));
      result_json['pieces'] = []
      for (let piece of pieces) {
        result_json['pieces'].push(piece['name'])
      }

      // User Info
      const userData = JSON.parse(JSON.stringify(await usersModel.readById(application.user)));
      result_json['lname'] = userData['lname']
      result_json['fname'] = userData['fname']

      // Add to main results dict
      results_json.push(result_json)
    }

    res.status(200).send({
      applicationData: results_json
    });

  } else {
    res.status(401).send('Access Forbidden');
  }

});

/* GET Application Document */
router.get('/getApplicationsDocument/:applicationId/:filename', isLoggedIn, async function (req, res, next) {
  const applicationId = req.params.applicationId;
  const filename = req.params.filename;

  const [fileData] = await Promise.all([pieceModel.readFromName(applicationId, filename)])

  // Step 3: Set appropriate headers for the file response
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');

  // Step 4: Send the file data as the response
  res.send(fileData);
});

/* POST add Offer */
router.post('/addOffer', isLoggedIn, async function (req, res, next) {
  const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);
  let jobSheetId = parseInt(req.body.jobSheetSelect);
  if (jobSheetId == -1) {
    // L'utilisateur souhaite creer une nouvelle fiche de poste
    const jobTitle = req.body.jobTitle;

    let jobStatusId = parseInt(req.body.statusSelect);
    if (jobStatusId == -1) {
      const newStatus = req.body.newStatus;
      [jobStatusId] = await Promise.all(statusModel.create(newStatus));
    }

    const jobManager = req.body.jobManager;

    let jobTypeId = parseInt(req.body.jobTypeSelect);
    console.log(jobTypeId)
    if (jobTypeId == -1) {
      const newJobType = req.body.newJobType;
      [jobTypeId] = await Promise.all(jobTypeModel.create(newJobType));
    }
    console.log(jobTypeId)

    const jobLocation = req.body.jobLocation;
    const jobRythme = req.body.jobRythme;
    const jobSalary = req.body.jobSalary;
    const jobDescription = req.body.jobDescription;
    [jobSheetId] = await Promise.all([jobSheetModel.create(org, jobTitle, jobStatusId, jobManager, jobTypeId, jobLocation, jobRythme, jobSalary, jobDescription)]);
  }

  const endDate = req.body.endDate;
  let requestedDocuments = JSON.stringify(req.body.requestedDocuments);
  if (requestedDocuments == undefined) {
    requestedDocuments = JSON.stringify([]);
  }
  const state = "publiée" //"non publiée" [en cours d’édition], "publiée", "expirée"

  console.log(jobSheetId, state, endDate, requestedDocuments)
  await Promise.all([
    jobOfferModel.create(jobSheetId, state, endDate, requestedDocuments)
  ]);
  res.status(200).send('La fiche a été ajoutée avec succès !');
});

/* POST add Sheet */
router.post('/addSheet', isLoggedIn, async function (req, res, next) {
  const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);
  console.log("Création fiche de poste")

  let jobStatusId = req.body.statusSelect;
  if (jobStatusId == -1) {
    const newStatus = req.body.newStatus;
    [jobStatusId] = await Promise.all([
      statusModel.create(newStatus)
    ])
  }

  let jobTypeId = parseInt(req.body.jobTypeSelect);
  if (jobTypeId == -1) {
    const newJobType = req.body.newJobType;
    [jobTypeId] = await Promise.all([
      jobTypeModel.create(newJobType)
    ])
  }

  const jobTitle = req.body.jobTitle;
  const jobManager = req.body.jobManager;
  const jobLocation = req.body.jobLocation;
  const jobRythme = req.body.jobRythme;
  const jobSalary = req.body.jobSalary;
  const jobDescription = req.body.jobDescription;

  await Promise.all([
    jobSheetModel.create(org, jobTitle, jobStatusId, jobManager, jobTypeId, jobLocation, jobRythme, jobSalary, jobDescription)
  ]);
  res.status(200).send('La fiche a été ajoutée avec succès !');
});


/* POST modify Offer */
router.post('/updateJobOffer', isLoggedIn, async function (req, res, next) {
  const jobOfferNumber = req.body.jobOfferNumber;
  const jobSheetId = parseInt(req.body.updateJobSheetSelect);
  const endDate = req.body.updateJobOfferEndDate;
  const requestedDocuments = JSON.stringify(req.body.updateJobOfferRequestedDocuments);

  await Promise.all([
    jobOfferModel.commonUpdate(jobOfferNumber, jobSheetId, endDate, requestedDocuments)
  ]);
  res.status(200).send('L\'offre a été modifiée avec succès !');


});

/* POST modify Sheet */
router.post('/updateJobSheet', isLoggedIn, async function (req, res, next) {
  console.log("Modification fiche de poste")
  const jobSheetId = req.body.id;
  const jobTitle = req.body.jobTitle;
  let jobStatusId = req.body.statusSelect;

  if (jobStatusId == -1) {
    console.log("HEEEE")
    const newStatus = req.body.newStatus;
    jobStatusId = await Promise.all([
      statusModel.create(newStatus)
    ]);
  }

  const jobManager = req.body.jobManager;
  let jobTypeId = parseInt(req.body.jobTypeSelect);

  if (jobTypeId == -1) {
    const newJobType = req.body.newJobType;
    jobTypeId = await Promise.all([
      jobTypeModel.create(newJobType)
    ]);
  }

  const jobLocation = req.body.jobLocation;
  const jobRythme = req.body.jobRythme;
  const jobSalary = req.body.jobSalary;
  const jobDescription = req.body.jobDescription;

  await Promise.all([
    jobSheetModel.update(jobSheetId, jobTitle, jobStatusId, jobManager, jobTypeId, jobLocation, jobRythme, jobSalary, jobDescription)
  ]);
  res.status(200).send('La fiche a été modifiée avec succès !');
});


/* POST delete Offer */
router.post('/deleteJobOffer', isLoggedIn, async function (req, res, next) {
  const jobOfferNumber = req.body.jobOfferNumber;
  console.log("Suppression offre d'emploi")

  await Promise.all([
    jobOfferModel.fDelete(jobOfferNumber)
  ]);
  res.status(200).send('OK');
});

/* POST delete Sheet */
router.post('/deleteJobSheet', async function (req, res, next) {
  const jobSheetId = req.body.jobSheetId;

  await Promise.all([
    jobSheetModel.fDelete(jobSheetId)
  ]);
  res.status(200).send('La fiche a été supprimée avec succès !');

});

/* POST deny join Request */
router.post('/denyJoinRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.denyJoinRequest(userId)
  ]);
  res.status(200).send('OK');

});

/* POST accept join Request */
router.post('/acceptJoinRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.acceptJoinRequest(userId)
  ]);
  res.status(200).send('OK');

});

module.exports = router;
