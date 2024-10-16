var express = require('express');
var router = express.Router();
var userModel = require('../model/jobOffer.js');


/* GET jobOffer listing. */
router.get('/jobOfferList', function (req, res, next) {
  result = userModel.readall(function (result) {
    res.render('jobOfferList', {
      title: 'Liste des offres d\'emploi', jobOffers:
        result
    });
  });
});

/* GET candidate page.. */
router.get('/candidate', function (req, res, next) {
  result = userModel.readall(function (result) {
    res.render('candidate', {
      title: 'Liste des offres d\'emploi', jobOffers:
        result
    });
  });
});

/* POST jobOffer add */
router.post('/nvUser', function (req, res, next) {
  const user_fname = req.body.fname;
  const user_lname = req.body.lname;
  const user_tel = req.body.tel;
  const user_email = req.body.email;
  const user_pwd = req.body.pwd;
  const user_pwdbis = req.body.pwdbis;
  const user_status = true;
  const user_role = 1;
  
  result = userModel.create(user_email, user_lname, user_fname, user_pwd, user_tel, user_status, user_role )

});
  


module.exports = router;
