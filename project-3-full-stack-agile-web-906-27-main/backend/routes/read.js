/**
 * @module routes/read
 * @requires express
 */
const router = require("express").Router();
const DB = require("../db")


/**
 * Handles the HTTP GET request to retrieve the latest order number.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the latest order number is retrieved successfully.
 * @function
 * @memberof module:routes/read
 * @name get/ordernumber
 */
router.get('/ordernumber', (req, res) => {
    DB
        .query(`SELECT customerid FROM customer ORDER BY customerid DESC LIMIT 1;`)
        .then(result => {
            res.status(201).send(result.rows[0].customerid.toString());
        })
        .catch(err => {
            console.error("Error checking order number: ", err);
            res.status(500).send("Internal server error");
        });
})

/**
 * Handles the HTTP GET request to retrieve data from a specific table.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when data from the specified table is retrieved successfully.
 * @memberof module:routes/read
 * @function
 * @name get/:id
 */
router.get('/:id', (req, res) => {
    data = []
    DB
    .query(`SELECT * FROM ${req.params.id};`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });

module.exports = router;
