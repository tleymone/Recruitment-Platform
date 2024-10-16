var express = require('express');
var router = express.Router();
var userModel = require('../model/users.js');


/* GET users listing. */
router.get('/userslist', function (req, res, next) {
  result = userModel.readall(function (result) {
    res.render('usersList', {
      title: 'Users List', users:
        result
    });
  });
});

/* POST user add */
router.post('/nvUser', async function (req, res, next) {
  const user_fname = req.body.fname;
  const user_lname = req.body.lname;
  const user_tel = req.body.tel;
  const user_email = req.body.email;
  const user_pwd = req.body.pwd;
  const user_pwdbis = req.body.pwdbis;
  const user_status = true;
  const user_role = 1;

  // Vérification du mot de passe
  if (!validerMotDePasse(user_pwd)) {
    res.status(400).send('Le mot de passe ne satisfait pas les conditions requises');
    return;
  }

  // Vérification de la confirmation du mot de passe
  if (user_pwd !== user_pwdbis) {
    res.status(400).send('La confirmation du mot de passe ne correspond pas');
    return;
  }

  // Vérification du numéro de téléphone
  if (!validerTelephone(user_tel)) {
    res.status(400).send('Le numéro de téléphone n\'est pas valide');
    return;
  }

  // Vérification de l'adresse e-mail
  if (!validerEmail(user_email)) {
    res.status(400).send('L\'adresse e-mail n\'est pas valide');
    return;
  }

  // Vérification de l'existence de l'email
  [isExist] = await Promise.all([
    userModel.isExist(user_email)
  ]);
  
  if (!isExist) {
    res.status(400).send('L\'adresse e-mail existe déjà');
  } else {
    // L'email est valide, procéder à la création de l'utilisateur
    result = await Promise.all([
      userModel.create(user_email, user_lname, user_fname, user_pwd, user_tel)
    ]);
    res.render('login');
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
