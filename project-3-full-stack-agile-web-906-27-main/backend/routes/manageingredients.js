/**
 * @module routes/manageingredients
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP POST request to update an ingredient in the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the ingredient is updated successfully.
 * @memberof module:routes/manageingredients
 * @function
 * @name post/update
 */
router.post('/update', (req, res) => {
    const {ingredientName, newName, initialStock, currentStock, pricePerUnit } = req.body;
    
    if (!ingredientName) {
        return res.status(400).send("Missing Ingredient Name (REQUIRED)");
    }
    if (!newName && !initialStock && !currentStock && !pricePerUnit) {
        return res.status(400).send("Nothing to update");
    }
    
    const updateFields = [];
    if (newName) {
        updateFields.push(`ingredientname = \'${newName}\'`);
    }
    if (initialStock) {
        updateFields.push(`initialstock = ${initialStock}`);
    }
    if (currentStock) {
        updateFields.push(`currentstock = ${currentStock}`);
    }
    if (pricePerUnit) {
        updateFields.push(`priceperunit = ${pricePerUnit}`);
    }
    const updateQuery = `UPDATE ingredients SET ${updateFields.join(', ')} WHERE ingredientname = '${ingredientName}';`;
    
    DB
        .query(updateQuery)
        .then(() => {
            res.status(201).send("Ingredient updated successfully");
        })
        .catch(err => {
            console.error("Error updating ingredient: ", err);
            res.status(500).send("Internal server error");
        });
});

/**
 * Handles the HTTP POST request to add a new ingredient to the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the ingredient is added successfully.
 * @memberof module:routes/manageingredients
 * @function
 * @name post/add
 */
router.post('/add', (req, res) => {
    const { ingredientName, initialStock, currentStock, pricePerUnit } = req.body;

    if (!ingredientName || !initialStock || !currentStock || !pricePerUnit) {
        return res.status(400).send("Missing field(s)");
    }

    DB
        .query(`INSERT INTO ingredients (ingredientname, initialstock, currentstock, priceperunit) VALUES (\'${ingredientName}\', $1, $2, $3);`, [initialStock, currentStock, pricePerUnit])
        .then(() => {
            res.status(201).send("Ingredient added successfully.");
        })
        .catch(err => {
            console.error("Error adding ingredient: ", err);
            res.status(500).send("Internal server error.");
        });
});

/**
 * Handles the HTTP POST request to delete an ingredient from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the ingredient is deleted successfully.
 * @memberof module:routes/manageingredients
 * @function
 * @name post/delete
 */
router.post('/delete', (req, res) => {
    const { ingredientID, ingredientName } = req.body;

    if(!ingredientID || !ingredientName) {
        return res.status(400).send("Missing field(s)");
    }
    
    DB
        .query(`SELECT * FROM ingredients WHERE ingredientid = ${ingredientID} AND ingredientName = '${ingredientName}'`)
        .then((result) => {
            if (result.rowCount === 0) {
                return res.status(400).send("ID and Name do not match. No deletion occurred.");
            }
            else {
                DB.query(`DELETE FROM seasonalitemingredients WHERE ingredientid = ${ingredientID};`);
                DB.query(`DELETE FROM itemingredients WHERE ingredientid = ${ingredientID};`);
                DB.query(`DELETE FROM ingredients WHERE ingredientid = ${ingredientID} AND ingredientname = \'${ingredientName}\';`);
                res.status(202).send("Ingredient deleted successfully.");
            }
        })
        .catch(err => {
            console.error("Error deleting ingredient: ", err);
            res.status(500).send("Internal server error");
        })
})

/**
 * Handles the HTTP GET request to retrieve ingredients that require restocking.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {void} Returns a list of ingredients that need restocking.
 * @memberof module:routes/manageingredients
 * @function
 * @name get/restock
 */
router.get('/restock', (req, res) => {
    data = [];
    DB
    .query(`SELECT * FROM Ingredients WHERE CurrentStock < 0.2 * InitialStock;`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });

/**
 * Handles the HTTP GET request to retrieve product usage between two timestamps.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {void} Returns product usage data within the specified time range.
 * @memberof module:routes/manageingredients
 * @function
 * @name get/productusage
 */
router.get('/productusage', (req, res) => {
    const { timestamp1, timestamp2 } = req.query;

    if(!timestamp1 || !timestamp2) {
        return res.status(400).send("Missing field(s)");
    }

    data = [];
    DB
    // .query(`SELECT * FROM Ingredients WHERE CurrentStock < 0.2 * InitialStock;`)
    .query(`SELECT i.IngredientID, i.IngredientName, COUNT(*) AS total_used FROM customeritems ci JOIN items it ON ci.ItemID = it.ItemID JOIN itemingredients ii ON it.ItemID = ii.ItemID JOIN ingredients i ON ii.IngredientID = i.IngredientID WHERE ci.CustomerID IN ( SELECT CustomerID FROM customer WHERE TimeOrdered BETWEEN TO_TIMESTAMP(\'${timestamp1} 00:00:00\', 'YYYY-MM-DD HH24:MI:SS') AND TO_TIMESTAMP(\'${timestamp2} 00:00:00\', 'YYYY-MM-DD HH24:MI:SS')) GROUP BY i.IngredientID, i.IngredientName;`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });

module.exports = router;
