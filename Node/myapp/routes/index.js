var express = require('express');
var userModel = require('../model/users.js');
var roleModel = require('../model/role.js');
var rememberTokenModel = require('../model/rememberToken.js');
var router = express.Router();

function generateRememberToken() {
  const tokenLength = 32;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }

  return token;
}

/* GET home page. */
router.get('/', function (req, res, next) {
  const currentParams = new URLSearchParams(req.query); // Get the current query parameters
  let redirectUrl = '/login';
  if (currentParams.has('redirect')) {
    redirectUrl = '/login?' + currentParams.toString(); // Construct the redirect URL
  }
  res.redirect(redirectUrl);
});

/* GET login page. */
router.get('/login', async function (req, res, next) {
  if (req.cookies.rememberToken) {
    let redirectUrl = '/candidate';
    currentParams = new URLSearchParams(req.query)
    if (currentParams.has('redirect')) {
      if (currentParams.get('redirect') == 'admin') {
        redirectUrl = '/admin';
      } else if (currentParams.get('redirect') == 'recruiter') {
        redirectUrl = '/recruiter';
      }
    }
    const [userId] = await Promise.all([rememberTokenModel.read(req.cookies.rememberToken)]);

    if (userId != null) {
      const [userData] = await Promise.all([userModel.readById(userId)]);
      req.session.loggedin = true;
      req.session.user = userData.id;

      const [roleData] = await Promise.all([roleModel.readById(userData.role)]);
      req.session.role = roleData.role;

      res.redirect(redirectUrl);
    } else {
      res.render('login', { title: 'Page Recruteur' });
    }
  } else {
    res.render('login', { title: 'Page Recruteur' });
  }
});

/* GET signin page. */
router.get('/signin', function (req, res, next) {
  res.render('signin');
});

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // Durée d'une semaine en millisecondes

router.post('/login', async function (req, res, next) {
  const user_email = req.body.email;
  const user_pwd = req.body.pwd;
  const remember_me = req.body.rememberMe; // Champ "remember me" depuis le formulaire

  let [userData] = await Promise.all([userModel.read(user_email, user_pwd)]);

  if (userData.length > 0) {
    userData = userData[0];
    req.session.loggedin = true;
    req.session.user = userData.id;

    const [roleData] = await Promise.all([roleModel.readById(userData.role)]);
    req.session.role = roleData.role;

    const rememberToken = generateRememberToken(); // Génération d'un token aléatoire
    const currentDate = new Date(); // Date actuelle
    const expDate = new Date(currentDate.getTime() + ONE_WEEK); // Date dans une semaine


    // Gestion du "remember me"
    if (remember_me) {
      res.cookie('rememberToken', rememberToken, { maxAge: ONE_WEEK });
      rememberTokenModel.create(rememberToken, userData.id, expDate);
    }

    res.redirect('/candidate');
  } else {
    res.send(`
        <p>Incorrect Username and/or Password!</p>
        <a href="/">Return Home</a>
      `);
  }
});

/* GET logout page. */
router.get('/logout', (req, res) => {
  // Destroy the session
  res.clearCookie('rememberToken');
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});



module.exports = router;
