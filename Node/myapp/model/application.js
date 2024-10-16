var db = require('./db.js');
var pieceModel = require('./piece.js');

module.exports = {
    read: function (user, jobOffer, callback) {
        db.query("SELECT * FROM Application WHERE user = ? AND jobOffer = ?", [user, jobOffer], function (err, results) {
            if (err) throw err;
            callback(results);
        });
    },
    readallUser: function (user) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Application WHERE user = ? ORDER BY date DESC", [user], function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    readFromJobOffer: function (jobOfferId) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM Application WHERE jobOffer = ?", jobOfferId, function (err, results) {
                if (err) throw err;
                resolve(results);
            });
        });
    },
    readall: function (callback) {
        db.query("SELECT * FROM Application", function (err, results) {
            if (err) throw err;
            callback(results);
        });
    },
    create: function (user, jobOffer, date, callback) {
        db.query("INSERT INTO Application (user, jobOffer, date) VALUES (?, ?, ?)", [user, jobOffer, date], function (err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    fDelete: function (id) {
        return new Promise((resolve, reject) => {
            pieceModel.deleteFromApplication(id, function (affectedRows) {
                console.log("Piece supprimées : " + affectedRows)
                db.query("DELETE FROM Application WHERE id = ?", id, function (err, result) {
                    if (err) throw err;
                    resolve(result.affectedRows);
                });
            });
        });
    },

    getIdsFromJobOffer: function (jobOfferNumber) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT id FROM Application WHERE jobOffer = ?`, [jobOfferNumber], function (error, results, fields) {
                if (error) throw error;
                const ids = results.map(result => result.id);
                resolve(ids);
            });
        });
    },

    getIdsFromUser: function (userId) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT id FROM Application WHERE user = ?`, [userId], function (error, results, fields) {
                if (error) throw error;
                const ids = results.map(result => result.id);
                resolve(ids);
            });
        });
    },

    fDeleteFromJobOffer: function (jobOfferNumber) {
        return new Promise(async (resolve, reject) => {
            const [ids] = await Promise.all([this.getIdsFromJobOffer(jobOfferNumber)]);

            await Promise.all(ids.map(async (id) => {
                await this.fDelete(id)
            }));

            // Get concerned rows ids
            resolve();
        });
    },

    fDeleteFromUser: function (userId) {
        return new Promise(async (resolve) => {
            // Get concerned rows ids
            const [ids] = await Promise.all([this.getIdsFromUser(userId)]);
            console.log(ids)

            await Promise.all(ids.map(async (id) => {
                await this.fDelete(id)
            }));

            resolve();
        });
    },

}