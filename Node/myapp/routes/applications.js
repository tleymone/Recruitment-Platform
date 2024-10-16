var express = require('express');
var router = express.Router();
var userModel = require('../model/application.js');

/* GET users listing. */
router.get('/applicationsList', function (req, res, next) {
  result = userModel.readall(function (result) {
    res.render('applicationsList', {
      title: 'Liste des candidatures', applications:
        result
    });
  });
});


module.exports = router;
