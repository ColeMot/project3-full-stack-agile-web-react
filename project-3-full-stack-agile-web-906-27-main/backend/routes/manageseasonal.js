/**
 * @module routes/manageseasonal
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP GET request to retrieve seasonal item ingredients.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when seasonal item ingredients are retrieved successfully.
 * @memberof module:routes/manageseasonal
 * @function
 * @name get/seasonalitemingredients/:seasonalid
 */
router.get('/seasonalitemingredients/:seasonalid', (req, res) => {
    seasonalItemIngredients = []
    DB
        .query(`SELECT ingredients.ingredientname, ingredients.currentstock 
                FROM seasonalitems 
                JOIN seasonalitemingredients ON seasonalitems.seasonalid = seasonalitemingredients.seasonalid 
                JOIN ingredients ON seasonalitemingredients.ingredientid = ingredients.ingredientid 
                WHERE seasonalitems.seasonalid = ${req.params.seasonalid};`)
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                seasonalItemIngredients.push(query_res.rows[i])
            }
            res.status(201).send(seasonalItemIngredients);
        })
        .catch(err => {
            console.error("Error checking seasonal item ingredients: ", err);
            res.status(500).send("Internal server error");
        });
});

/**
 * Handles the HTTP POST request to update a seasonal item.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the seasonal item is updated successfully.
 * @memberof module:routes/manageseasonal
 * @function
 * @name post/update
 */
router.post('/update', (req, res) => {
    const { itemName, newName, itemPrice, startDate, endDate, calories, vegan, gluten, peanut, changedSeasonalIngredients } = req.body;

    if (!itemName) {
        return res.status(400).send("Missing Item Name (REQUIRED)");
    }

    if (vegan && vegan != 'Y' && vegan != 'N') {
        return res.status(400).send("vegan field entered incorrectly (Y/N) only.");
    }
    if (gluten && gluten != 'Y' && gluten != 'N') {
        return res.status(400).send("gluten field entered incorrectly (Y/N) only.");
    }
    if (peanut && peanut != 'Y' && peanut != 'N') {
        return res.status(400).send("peanut field entered incorrectly (Y/N) only.");
    }

    if (newName || itemPrice || startDate || endDate || calories || vegan || gluten || peanut) {
        const updateFields = [];
        if (newName) {
            updateFields.push(`itemname = \'${newName}\'`);
        }
        if (itemPrice) {
            updateFields.push(`itemprice = ${itemPrice}`);
        }
        if (startDate) {
            updateFields.push(`startdate = \'${startDate}\'`);
        }
        if (endDate) {
            updateFields.push(`enddate = \'${endDate}\'`);
        }
        if (calories) {
            updateFields.push(`calories = ${calories}`);
        }
        if (vegan) {
            updateFields.push(`vegan = ${vegan == 'Y'}`);
        }
        if (gluten) {
            updateFields.push(`gluten = ${gluten == 'Y'}`);
        }
        if (peanut) {
            updateFields.push(`peanut = ${peanut == 'Y'}`);
        }
        const updateQuery = `UPDATE seasonalitems SET ${updateFields.join(', ')} WHERE itemname = '${itemName}';`;
        DB
            .query(updateQuery)
            .then(() => {
                res.status(201).send("Seasonal item updated successfully");
            })
            .catch(err => {
                console.error("Error updating seasonal item: ", err);
                res.status(500).send("Internal server error");
            });
    }

    currentName = itemName;
    if(newName) currentName = newName;
    if (changedSeasonalIngredients.length !== 0) {
        DB
            .query(`SELECT seasonalid FROM seasonalitems WHERE itemName = '${currentName}';`)
            .then((result) => {
                seasonalID = result.rows[0].seasonalid;
                DB.query(`DELETE FROM seasonalitemingredients WHERE seasonalid = ${seasonalID}`);
                for (let i = 0; i < changedSeasonalIngredients.length; i++) {
                    DB.query(`INSERT INTO seasonalitemingredients (seasonalid, ingredientid) VALUES (${seasonalID}, ${changedSeasonalIngredients[i]});`);
                }
            });
    }
});

/**
 * Handles the HTTP POST request to add a seasonal item.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the seasonal item is added successfully.
 * @memberof module:routes/manageseasonal
 * @function
 * @name post/add
 */
router.post('/add', (req, res) => {
    const { itemName, itemPrice, startDate, endDate, calories, vegan, gluten, peanut, newSeasonalIngredients } = req.body;

    if (!itemName || !itemPrice || !startDate || !endDate || !calories || !vegan || !gluten || !peanut || !newSeasonalIngredients) {
        return res.status(400).send("Missing field(s)");
    }

    if (vegan && vegan != 'Y' && vegan != 'N') {
        return res.status(400).send("vegan field entered incorrectly (Y/N) only.");
    }
    if (gluten && gluten != 'Y' && gluten != 'N') {
        return res.status(400).send("gluten field entered incorrectly (Y/N) only.");
    }
    if (peanut && peanut != 'Y' && peanut != 'N') {
        return res.status(400).send("peanut field entered incorrectly (Y/N) only.");
    }

    DB.query(`INSERT INTO seasonalitems (itemname, itemprice, startdate, enddate, calories, vegan, gluten, peanut) VALUES ('${itemName}', ${itemPrice}, '${startDate}', '${endDate}', ${calories}, ${vegan == 'Y'}, ${gluten == 'Y'}, ${peanut == 'Y'});`)
        .then(() => {
            res.status(201).send("Seasonal item added successfully.");
            // Execute the second query inside the 'then' block of the first query
            DB.query(`SELECT seasonalid FROM seasonalitems ORDER BY seasonalid DESC LIMIT 1;`)
            .then((result) => {
                const seasonalID = result.rows[0].seasonalid;
                for (let i = 0; i < newSeasonalIngredients.length; i++) {
                DB.query(`INSERT INTO seasonalitemingredients (seasonalid, ingredientid) VALUES (${seasonalID}, ${newSeasonalIngredients[i]});`)
                    .catch(err => {
                    console.error("Error adding seasonal item ingredient: ", err);
                    res.status(500).send("Internal server error.");
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching seasonal ID: ", err);
                res.status(500).send("Internal server error.");
            });
        })
        .catch(err => {
            console.error("Error adding seasonal item: ", err);
            res.status(500).send("Internal server error.");
        });

});

/**
 * Handles the HTTP POST request to delete a seasonal item.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the seasonal item is deleted successfully.
 * @memberof module:routes/manageseasonal
 * @function
 * @name post/delete
 */
router.post('/delete', (req, res) => {
    const { seasonalID, itemName } = req.body;

    if(!seasonalID || !itemName) {
        return res.status(400).send("Missing field(s)");
    }

    DB
        .query(`SELECT * FROM seasonalitems WHERE seasonalid = ${seasonalID} AND itemname = \'${itemName}\';`)
        .then((result) => {
            if(result.rowCount === 0) {
                return res.status(400).send("ID and Name do not match. No deletion occurred.");
            }
            else {
                DB.query(`DELETE FROM customeritems WHERE seasonalid = ${seasonalID};`);
                DB.query(`DELETE FROM seasonalitemingredients WHERE seasonalid = ${seasonalID};`);
                DB.query(`DELETE FROM seasonalitems WHERE seasonalid = ${seasonalID} AND itemname = \'${itemName}\';`);
                res.status(202).send("Seasonal item deleted successfully.");
            }
        })
        .catch(err => {
            console.error("Error deleting seasonal item: ", err);
            res.status(500).send("Internal server error");
        })
});

module.exports = router;