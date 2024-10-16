const application = require('./application.js');
var db = require('./db.js');
var applicationModel = require('./application.js');
var rememberTokenModel = require('./rememberToken.js');
const crypto = require('crypto');
const { resolve } = require('path');

module.exports = {
    read: function (email, password) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            db.query("SELECT * FROM Users WHERE email = ? and password = ?", [email, hash], function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        });
    },
    readById: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result[0]);
            });
        });
    },
    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    readWithOrg: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users LEFT JOIN Organisation ON Users.organisation = Organisation.siren;", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    getCreateRequests: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users LEFT JOIN Organisation ON Users.organisation = Organisation.siren WHERE organisation IS NOT NULL AND orgAccepted = 0 AND organisation IN (SELECT organisation FROM Users GROUP BY organisation HAVING COUNT(*) = 1)", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    getJoinRequests: function (organisation) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users WHERE organisation = ? AND orgAccepted = 0 AND organisation IN (SELECT organisation FROM Users GROUP BY organisation HAVING COUNT(*) > 1)", organisation, function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    getAllJoinRequests: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Users WHERE organisation IS NOT NULL AND orgAccepted = 0 AND organisation IN (SELECT organisation FROM Users GROUP BY organisation HAVING COUNT(*) > 1)", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    areValid: function (email, password) {
        return new Promise((resolve, reject) => {
            sql = "SELECT password FROM Users WHERE email = ?";
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            db.query(sql, email, function (err, results) {
                if (err) throw err;
                if (results.length == 1 && results[0].password === hash) {
                    resolve(true)
                } else {
                    resolve(false);
                }
            });
        });
    },
    isExist: function (email) {
        return new Promise((resolve, reject) => {
            var sql = "SELECT password FROM Users WHERE email = ?";
            db.query(sql, email, function (err, results) {
                if (err) throw err;
                if (results.length > 0) {
                    // L'email existe déjà dans la base de données
                    resolve(false);
                } else {
                    // L'email n'existe pas dans la base de données
                    resolve(true);
                }
            });
        });
    },

    create: function (email, lname, fname, password, telephone) {
        return new Promise((resolve, reject) => {
            var creationDate = new Date();
            var status = true;
            var role = 1;
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            db.query("INSERT INTO Users (email, lname, fname, password, telephone, creationDate, status, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [email, lname, fname, hash, telephone, creationDate, status, role],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.insertId);
                });
        });
    },
    update: function (email, lname, fname, password, telephone, status, role, organisation, orgAccepted) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            var sql = "UPDATE Users SET email = ?, lname = ?, fname = ?, password = ?, telephone = ?, status = ?, role = ?, organisation = ?, orgAccepted = ? WHERE email = ?";
            db.query(sql, [email, lname, fname, hash, telephone, status, role, organisation, orgAccepted, email], function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    updateNoPwd: function (email, lname, fname, telephone, status, role, organisation, orgAccepted) {
        return new Promise((resolve, reject) => {
            var sql = "UPDATE Users SET email = ?, lname = ?, fname = ?, telephone = ?, status = ?, role = ?, organisation = ?, orgAccepted = ? WHERE email = ?";
            db.query(sql, [email, lname, fname, telephone, status, role, organisation, orgAccepted, email], function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    delete: function (email) {
        return new Promise((resolve, reject) => {
            var sql = "DELETE FROM Users WHERE email = ?";
            db.query(sql, email, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    fDelete: function (userId) {
        return new Promise(async (resolve, reject) => {
            await Promise.all([
                applicationModel.fDeleteFromUser(userId),
                rememberTokenModel.deleteFromUser(userId),
            ])

            db.query("DELETE FROM Users WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    assignOrg: function (userId, organisation) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE Users SET organisation = ? WHERE id = ?", [organisation, userId], function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    acceptJoinRequest: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE Users SET orgAccepted = 1 WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    denyJoinRequest: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE Users SET organisation = NULL WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
    getOrganisation: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("SELECT organisation FROM Users WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result[0].organisation);
            });
        });
    },
    promoteAdmin: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE Users SET role = 3 WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });

    },
    promoteRecruiter: function (userId) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE Users SET role = 2 WHERE id = ?", userId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },
}