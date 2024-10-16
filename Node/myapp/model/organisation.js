var db = require('./db.js');
module.exports = {
    read: function (siren, callback) {
        db.query("SELECT * FROM Organisation WHERE siren = ?", siren, function (err, results) {
            if (err) throw err;
            callback(results);
        });
    },
    readName: function (siren) {
        return new Promise((resolve, reject) => {
            db.query("SELECT name FROM Organisation WHERE siren = ?", siren, function (err, result) {
                if (err) throw err;
                resolve(result[0].name);
            });
        });
    },
    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Organisation", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    create: function (siren, name, type, address, callback) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO Organisation (siren, name, typeOrg, address) VALUES (?, ?, ?, ?)", [siren, name, type, address], function (err, result) {
                if (err) throw err;
                resolve(result.insertId);
            });
        });
    },
    update: function (siren, name, type, address, callback) {
        var sql = "UPDATE Organisation SET name = ?, TypeOrg = ?, address = ? WHERE siren = ?";
        db.query(sql, [name, type, address, siren], function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    },
    delete: function (siren, callback) {
        var sql = "DELETE FROM Organisation WHERE siren = ?";
        db.query(sql, siren, function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    }
}