var db = require('./db.js');

module.exports = {
  read: function (id, callback) {
    db.query("SELECT * FROM Piece WHERE id = ?", id, function (err, results) {
      if (err) throw err;
      callback(results);
    });
  },
  readFromName: function (applicationId, name) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM Piece WHERE application = ? AND name = ?", [applicationId, name], function (err, result) {
        if (err) throw err;
        resolve(result[0].data);
      });
    });
  },

  readallApp: function (application) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM Piece WHERE application = ? ORDER BY name", application, function (err, results) {
        if (err) throw err;
        resolve(results);
      });
    });
  },
  readFromAppAndName: function(application, startOfName, callback) {
    var searchTerm = startOfName + '%'; // Ajouter le caractère joker '%' pour correspondre à n'importe quelle suite de caractères après le début du nom
    db.query("SELECT * FROM Piece WHERE application = ? AND name LIKE ? ORDER BY name", [application, searchTerm], function(err, results) {
      if (err) throw err;
      callback(results);
    });
  },  
  readall: function (callback) {
    db.query("SELECT * FROM Piece", function (err, results) {
      if (err) throw err;
      callback(results);
    });
  },
  create: function (application, name, data, callback) {
    db.query("INSERT INTO Piece (application, name, data) VALUES (?, ?, ?)", [application, name, data], function (err, result) {
      if (err) throw err;
      callback(result.insertId);
    });
  },
  update: function (id, application, name, data, callback) {
    var sql = "UPDATE Piece SET application = ?, name = ?, data = ? WHERE id = ?";
    db.query(sql, [application, name, data, id], function (err, result) {
      if (err) throw err;
      callback(result.affectedRows);
    });
  },
  delete: function (id, callback) {
    var sql = "DELETE FROM Piece WHERE id = ?";
    db.query(sql, id, function (err, result) {
      if (err) throw err;
      callback(result.affectedRows);
    });
  },

  deleteFromApplication: function (applicationId, callback) {
    db.query("DELETE FROM Piece WHERE application = ?", applicationId, function (err, result) {
      if (err) throw err;
      callback(result.affectedRows);
    });
  }

}
