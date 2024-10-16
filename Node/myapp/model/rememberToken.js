var db = require('./db.js');

module.exports = {

  read: function (token) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM RememberToken WHERE token = ?", token, function (err, results) {
        if (err) throw err;
        if (results.length == 0) {
          resolve(null);
        } else {
          resolve(results[0].user);
        }
      });
    });
  },
  deleteFromUser : async function (userId) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM RememberToken WHERE user = ?", userId, function (err, result) {
        if (err) throw err;
        resolve(result.insertId);
      });
    });
  },
  create: async function (token, userId, expDate) {
    await Promise.all([this.deleteOldDates()]);
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO RememberToken (token, user, expDate) VALUES (?, ?, ?)", [token, userId, expDate], function (err, result) {
        if (err) throw err;
        resolve(result.insertId);
      });
    });
  },
  deleteOldDates: function () {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM RememberToken WHERE expDate < CURDATE();", function (err, result) {
        if (err) throw err;
        resolve('OK');
      });
    });
  },
  getIdsFromUser: function (userId, callback) {
    db.query(`SELECT id FROM RememberToken WHERE user = ?`, [userId], function (error, results, fields) {
      if (error) throw error;
      const ids = results.map(result => result.id);
      callback(ids);
    });
  },
}
