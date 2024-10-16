var db = require('./db.js');
module.exports = {
    read: function (type, callback) {
        db.query("SELECT * FROM TypeOrg WHERE type = ?", type, function (err, results) {
            if (err) throw err;
            callback(results);
        });
    },
    readall: function (callback) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM TypeOrg", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    create: function (type, callback) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO TypeOrg (type) VALUES (?)", type, function (err, result) {
                if (err) throw err;
                resolve(result.insertId);
            });
        });
    },
    update: function (id, type, callback) {
        var sql = "UPDATE TypeOrg SET type = ? WHERE id = ?";
        db.query(sql, [type, id], function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    },
    delete: function (id, callback) {
        var sql = "DELETE FROM TypeOrg WHERE id = ?";
        db.query(sql, id, function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    }
}