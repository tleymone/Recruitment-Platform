var express = require('express');
var router = express.Router();
var jobOfferModel = require('../model/jobOffer.js');
const jobSheet = require('../model/jobSheet');

router.get('/jobOffers', async function (req, res, next) {
    result = await Promise.all([jobOfferModel.readall()]);
    res.status(200).json(result);
});

router.get('/jobOffers/:id_jobOffer', async function (req, res, next) {
    result = await Promise.all([jobOfferModel.read(req.params.id_jobOffer)]);
    res.status(200).json(result);
});

router.delete('/jobOffers/:id_jobOffer', async function (req, res, next) {
    result = await Promise.all([jobOfferModel.fDelete(req.params.id_jobOffer)]);
    res.status(200).json(result);
});

router.post('/jobOffers', async function (req, res, next) {

    const jobSheetId = req.body.jobSheet;
    const state = "Publiée";
    const endDate = req.body.endDate;
    const requestedDocuments = req.body.requestedDocuments;

    let result = await Promise.all([jobOfferModel.create(jobSheetId, state, endDate, requestedDocuments)]);
    res.status(200).json(result);
});

router.put('/jobOffers/:id_jobOffer', async function (req, res, next) {
    let p_id = req.params.id_jobOffer;
    let jobOffer = await Promise.all([jobOfferModel.read(p_id)]);
    if (jobOffer!= undefined) {
        let p_jobSheet = req.body.jobSheet;
        let p_state = req.body.state;
        let p_endDate = req.body.endDate;
        let p_requestedDocuments = req.body.requestedDocuments;
        if (p_jobSheet != null && p_jobSheet != "" && p_jobSheet != undefined) {
            if (p_state != null && p_state != "" && p_state != undefined) {
                if (p_endDate != null && p_endDate != "" && p_endDate != undefined) {
                    if (p_requestedDocuments != null && p_requestedDocuments != "" && p_requestedDocuments != undefined) {
                        let result = await Promise.all([jobOfferModel.update(p_id, p_jobSheet, p_state, p_endDate, p_requestedDocuments)]);
                        if (result > 0) res.status(200).send(`JobOffer ${p_id} updated`);
                        else res.status(400).send("JobOffer not updated");
                    }
                    else res.status(400).send("Bad Request, requestedDocuments is invalid");
                }
                else res.status(400).send("Bad Request, endDate is invalid");
            }
            else res.status(400).send("Bad Request, state is invalid");
        }
        else res.status(400).send("Bad Request, jobSheet is invalid");
    }
    else res.status(404).send("JobOffer not found");
});

module.exports = router;