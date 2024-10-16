var db = require('./db.js');
module.exports = {
    read: function (id, callback) {
        db.query("SELECT * FROM Status WHERE id = ?", id, function (err, results) {
            if (err) throw err;
            callback(results[0]);
        });
    },

    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Status", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    create: function (status) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO Status (status) VALUES (?)",
                [status],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.insertId);
                });
        });
    },
}