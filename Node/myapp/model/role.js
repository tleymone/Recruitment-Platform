var db = require('./db.js');
module.exports = {
    readById: function (roleId) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Role WHERE id = ?", roleId, function (err, result) {
                if (err) throw err;
                resolve(result[0]);
            });
        });
    },
    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Role", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    create: function (role, callback) {
        db.query("INSERT INTO Role (role) VALUES (?)", role, function (err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },
    update: function (id, role, callback) {
        var sql = "UPDATE Role SET role = ? WHERE id = ?";
        db.query(sql, [role, id], function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    },
    delete: function (id, callback) {
        var sql = "DELETE FROM Role WHERE id = ?";
        db.query(sql, id, function (err, result) {
            if (err) throw err;
            callback(result.affectedRows);
        });
    }
}