var db = require('./db.js');
module.exports = {
    read: function (id, callback) {
        db.query("SELECT * FROM JobType WHERE id = ?", id, function (err, results) {
            if (err) throw err;
            callback(results[0]);
        });
    },

    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobType", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    create: function (jobType) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO JobType (jobType) VALUES (?)",
                [jobType],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.insertId);
                });
        });
    },
}