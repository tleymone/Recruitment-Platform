var express = require('express');
var router = express.Router();
var jobSheetModel = require('../model/jobSheet.js');
var jobOfferModel = require('../model/jobOffer.js');
var jobTypeModel = require('../model/jobType.js');
var statusModel = require('../model/status.js');
var usersModel = require('../model/users.js');
var organisationModel = require('../model/organisation.js');
var roleModel = require('../model/role.js');
const users = require('../model/users.js');

/* Create a middleware that will check if the user is logged in */
function isLoggedIn(req, res, next) {
  if (req.session.loggedin) {
    if (req.session.role != "Admin") {
      res.redirect('/');
    } else {
      next();
    }
  } else {
    res.redirect('/login?redirect=admin');
  }
}

router.get('/', isLoggedIn, async function (req, res, next) {

  const [org] = await Promise.all([usersModel.getOrganisation(req.session.user)]);
  const [orgName] = await Promise.all([organisationModel.readName(org)]);
  const [userData] = await Promise.all([usersModel.readById(req.session.user)]);

  const [statusData, rolesData, orgData, createRequestsData, usersData] = await Promise.all([
    statusModel.readall(),
    roleModel.readall(),
    organisationModel.readall(),
    usersModel.getCreateRequests(),
    usersModel.readWithOrg(),
  ]);

  res.render('admin', {
    title: 'Page Admin',
    status: statusData,
    roles: rolesData,
    orgs: orgData,
    createRequests: createRequestsData,
    usersData: usersData,
    userRole: req.session.role,
    orgName: orgName,
    userlname: userData.lname,
    userfname: userData.fname,
    userId: req.session.user,
  });
});


/* POST delete User */
router.post('/deleteUser', isLoggedIn, async function (req, res, next) {
  await Promise.all([
    usersModel.fDelete(req.body.userId),
  ]);
  res.status(200).send('L\'offre a été modifiée avec succès !');
});

/* POST deny join Request */
router.post('/denyJoinRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.denyJoinRequest(userId),
  ]);

  res.status(200).send('OK');
});

/* POST accept join Request */
router.post('/acceptJoinRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.promoteRecruiter(userId),
    usersModel.acceptJoinRequest(userId),
  ]);

  console.log('User has been accepted: ' + affectedRows);
  res.status(200).send('OK');
});

/* POST deny join Request */
router.post('/denyCreateRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.denyJoinRequest(userId),

  ]);
  res.status(200).send('OK');
});

/* POST accept join Request */
router.post('/acceptCreateRequest', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.promoteRecruiter(userId),
    usersModel.acceptJoinRequest(userId),
  ]);

  res.status(200).send('OK');

});

/* POST promote admin */
router.post('/promoteAdmin', isLoggedIn, async function (req, res, next) {
  const userId = req.body.userId;

  await Promise.all([
    usersModel.promoteAdmin(userId),
  ]);
  res.status(200).send('OK');
});

/* POST edit User */
router.post('/editUser', isLoggedIn, async function (req, res, next) {
  const user_fname = req.body.fname;
  const user_lname = req.body.lname;
  const user_phone = req.body.phone;
  const user_email = req.body.email;
  const user_oldPwd = req.body.oldPwd;
  const user_newPwd = req.body.newPwd;
  const user_newPwdBis = req.body.newPwdBis;
  const user_role = req.body.roleSelect;
  const user_org = req.body.orgSelect;
  var user_status = req.body.status;
  var user_orgAccepted = req.body.orgAccepted;

  if (user_status == "on") {
    user_status = 1;
  } else {
    user_status = 0;
  }

  if (user_orgAccepted == "on") {
    user_orgAccepted = 1;
  } else {
    user_orgAccepted = 0;
  }

  // Vérification du numéro de téléphone
  if (!validerTelephone(user_phone)) {
    res.status(400).send('Le numéro de téléphone n\'est pas valide');
    return;
  }

  // Vérification de l'adresse e-mail
  if (!validerEmail(user_email)) {
    res.status(400).send('L\'adresse e-mail n\'est pas valide');
    return;
  }

  if (user_oldPwd != "") {
    const [pwdValid] = await Promise.all([
      usersModel.areValid(user_email, user_oldPwd),
    ]);

    //check password
    if (!pwdValid) {
      res.status(400).send('L\'ancien mot de passe est incorrect');
      return;
    }

    // Vérification du mot de passe
    if (!validerMotDePasse(user_newPwd)) {
      res.status(400).send('Le nouveau mot de passe ne satisfait pas les conditions requises');
      return;
    }

    // Vérification de la confirmation du mot de passe
    if (user_newPwd !== user_newPwdBis) {
      res.status(400).send('La confirmation du mot de passe ne correspond pas avec le nouveau mot de passe');
      return;
    }

    await Promise.all([
      usersModel.update(user_email, user_lname, user_fname, user_newPwd, user_phone, user_status, user_role, user_org, user_orgAccepted),
    ]);
    res.status(200).send('OK');

  } else {
    await Promise.all([
      usersModel.updateNoPwd(user_email, user_lname, user_fname, user_phone, user_status, user_role, user_org, user_orgAccepted)
    ]);
    res.status(200).send('OK');
  }

});

function validerMotDePasse(motDePasse) {
  // Vérifications du mot de passe
  if (motDePasse.length < 12) {
    return false;
  }

  var regexMajuscules = /[A-Z]/;
  var regexMinuscules = /[a-z]/;
  var regexChiffres = /[0-9]/;
  var regexCaracteresSpeciaux = /[!@#$%^&*()\-_=+{}[\]\\|:;"'<>,.?/~`]/;

  if (!regexMajuscules.test(motDePasse) ||
    !regexMinuscules.test(motDePasse) ||
    !regexChiffres.test(motDePasse) ||
    !regexCaracteresSpeciaux.test(motDePasse)) {
    return false;
  }

  return true;
}

function validerTelephone(telephone) {
  // Vérification du numéro de téléphone
  var regexTelephone = /^\d{10}$/; // Format attendu : 10 chiffres

  return regexTelephone.test(telephone);
}

function validerEmail(email) {
  // Vérification de l'adresse e-mail
  var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regexEmail.test(email);
}

module.exports = router;
