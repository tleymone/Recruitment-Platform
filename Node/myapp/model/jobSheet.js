var db = require('./db.js');
const jobOfferModel = require('./jobOffer.js');
module.exports = {
    read: function (id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobSheet WHERE id = ?", id, function (err, results) {
                if (err) throw err;
                resolve(results[0]);
            });
        });
    },

    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobSheet ORDER BY id DESC", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    readallOrg: function (org) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobSheet WHERE organisation = ?;", org, function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    create: function (organisation, title, status, manager, jobType, location, rythme, salary, description) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO JobSheet (organisation, title, status, manager, jobType, location, rythme, salary, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [organisation, title, status, manager, jobType, location, rythme, salary, description],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.insertId);
                });
        });
    },

    update: function (id, title, status, manager, jobType, location, rythme, salary, description) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE JobSheet SET title=?, status=?, manager=?, jobType=?, location=?, rythme=?, salary=?, description=? WHERE id=?",
                [title, status, manager, jobType, location, rythme, salary, description, id],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.affectedRows);
                });
        });
    },

    fDelete: async function (jobSheetId) {
        await Promise.all([jobOfferModel.fDeleteFromJobSheet(jobSheetId)]);
        return new Promise((resolve, reject) => {
            console.log('Toutes les applications liées à la fiche ont été supprimées');
            db.query("DELETE FROM JobSheet WHERE id=?", jobSheetId, function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    }
}