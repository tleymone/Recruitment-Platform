const { createPool } = require('mysql');
var db = require('./db.js');
var applicationModel = require('./application.js');

module.exports = {
    read: function (number) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobOffer WHERE number = ?", number, function (err, results) {
                if (err) throw err;
                resolve(results[0]);
            });
        });
    },

    readall: function () {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobOffer ORDER BY number DESC", function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    readallOrg: function (org) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM JobOffer INNER JOIN JobSheet ON JobOffer.jobSheet = JobSheet.id WHERE JobSheet.organisation = ?;", org, function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },

    create: function (jobSheet, state, endDate, requestedDocuments) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO JobOffer (jobSheet, state, endDate, requestedDocuments) VALUES (?, ?, ?, ?)",
                [jobSheet, state, endDate, requestedDocuments],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.insertId);
                });
        });
    },

    update: function (number, jobSheet, state, endDate, requestedDocuments) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE JobOffer SET jobSheet=?, state=?, endDate=?, requestedDocuments=? WHERE number=?",
            [jobSheet, state, endDate, requestedDocuments, number],
            function (err, result) {
                if (err) throw err;
                resolve(result.affectedRows);
            });
        });
    },

    commonUpdate: function (number, jobSheet, endDate, requestedDocuments) {
        return new Promise((resolve, reject) => {
            console.log(number)
            console.log(endDate)
            console.log(requestedDocuments)
            db.query("UPDATE JobOffer SET endDate=?, jobSheet=?, requestedDocuments=? WHERE number=?",
                [endDate, jobSheet, requestedDocuments, number],
                function (err, result) {
                    if (err) throw err;
                    resolve(result.affectedRows);
                });
        });
    },

    getIdsFromJobSheet: function (jobSheetNumber) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT number FROM JobOffer WHERE jobSheet = ?`, [jobSheetNumber], function (error, results, fields) {
                if (error) throw error;
                const ids = results.map(result => result.number);
                resolve(ids);
            });
        });
    },

    fDeleteFromJobSheet: function (jobSheetNumber) {
        return new Promise(async (resolve, reject) => {
            const [ids] = await Promise.all([this.getIdsFromJobSheet(jobSheetNumber)]);

            await Promise.all(ids.map(async (id) => {
                await this.fDelete(id);
            }));

            // Get concerned rows ids
            resolve();
        });
    },


    fDelete: function (jobNumber) {
        return new Promise(async (resolve, reject) => {
            await Promise.all([applicationModel.fDeleteFromJobOffer(jobNumber)]);
            console.log('Toutes les applications liées ont été supprimées ');
            db.query("DELETE FROM JobOffer WHERE number=?", jobNumber, function (err, result) {
                if (err) {
                    console.log(err)
                    throw err;
                }
                console.log('JobOffer ' + jobNumber + " has been deleted");
                resolve(result.affectedRows);
            });
        });
    },
}