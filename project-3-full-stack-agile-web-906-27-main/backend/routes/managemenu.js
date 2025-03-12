/**
 * @module routes/managemenu
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP GET request to retrieve item ingredients by item ID.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when item ingredients are retrieved successfully.
 * @memberof module:routes/managemenu
 * @function
 * @name get/itemingredients/:itemid
 */
router.get('/itemingredients/:itemid', (req, res) => {
    itemIngredients = []
    DB
        .query(`SELECT ingredients.ingredientname, ingredients.currentstock 
                FROM items 
                JOIN itemingredients ON items.itemid = itemingredients.itemid 
                JOIN ingredients ON itemingredients.ingredientid = ingredients.ingredientid 
                WHERE items.itemid = ${req.params.itemid};`)
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                itemIngredients.push(query_res.rows[i])
            }
            res.status(201).send(itemIngredients);
        })
        .catch(err => {
            console.error("Error checking item ingredients: ", err);
            res.status(500).send("Internal server error");
        });
});

/**
 * Handles the HTTP POST request to update an item in the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the item is updated successfully.
 * @memberof module:routes/managemenu
 * @function
 * @name post/update
 */
router.post('/update', (req, res) => {
    const { itemName, newName, itemPrice, category, calories, vegan, gluten, peanut, changedItemIngredients } = req.body;

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

    if (newName || itemPrice || category || calories || vegan || gluten || peanut) {
        const updateFields = [];
        if (newName) {
            updateFields.push(`itemname = \'${newName}\'`);
        }
        if (itemPrice) {
            updateFields.push(`itemprice = ${itemPrice}`);
        }
        if (category) {
            updateFields.push(`category = '${category}'`);
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
        const updateQuery = `UPDATE items SET ${updateFields.join(', ')} WHERE itemName = '${itemName}';`;
        DB
            .query(updateQuery)
            .then(() => {
                res.status(201).send("Item updated successfully");
            })
            .catch(err => {
                console.error("Error updating item: ", err);
                res.status(500).send("Internal server error");
            });
    }

    currentName = itemName;
    if(newName) currentName = newName;
    if (changedItemIngredients.length !== 0) {
        DB
            .query(`SELECT itemid FROM items WHERE itemName = '${currentName}';`)
            .then((result) => {
                itemID = result.rows[0].itemid;
                DB.query(`DELETE FROM itemingredients WHERE itemid = ${itemID}`);
                for (let i = 0; i < changedItemIngredients.length; i++) {
                    DB.query(`INSERT INTO itemingredients (itemid, ingredientid) VALUES (${itemID}, ${changedItemIngredients[i]});`);
                }
            });
    }
});

/**
 * Handles the HTTP POST request to add a new item to the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the item is added successfully.
 * @memberof module:routes/managemenu
 * @function
 * @name post/add
 */
router.post('/add', (req, res) => {
    const { itemName, itemPrice, category, calories, vegan, gluten, peanut, newItemIngredients } = req.body;

    if (!itemName || !itemPrice || !category || !calories || !vegan || !gluten || !peanut || !newItemIngredients) {
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

    DB
        .query(`INSERT INTO items (itemname, itemprice, category, calories, vegan, gluten, peanut) VALUES (\'${itemName}\', ${itemPrice}, '${category}', ${calories}, ${vegan == 'Y'}, ${gluten == 'Y'}, ${peanut == 'Y'});`)
        .then(() => {
            res.status(201).send("Item added successfully.");
        })
        .catch(err => {
            console.error("Error adding item: ", err);
            res.status(500).send("Internal server error.");
        });
    
    DB
        .query(`SELECT itemid FROM items ORDER BY itemid DESC LIMIT 1;`)
        .then((result) => {
            itemID = result.rows[0].itemid;
            for (let i = 0; i < newItemIngredients.length; i++) {
                DB.query(`INSERT INTO itemingredients (itemid, ingredientid) VALUES (${itemID}, ${newItemIngredients[i]});`);
            }
        })
        .catch(err => {
            console.error("Error adding item ingredient: ", err);
            res.status(500).send("Internal server error.");
        })
});

/**
 * Handles the HTTP POST request to delete an item from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the item is deleted successfully.
 * @memberof module:routes/managemenu
 * @function
 * @name post/delete
 */
router.post('/delete', (req, res) => {
    const { itemID, itemName } = req.body;

    if(!itemID || !itemName) {
        return res.status(400).send("Missing field(s)");
    }

    DB
        .query(`SELECT * FROM items WHERE itemid = ${itemID} AND itemname = \'${itemName}\';`)
        .then((result) => {
            if(result.rowCount === 0) {
                return res.status(400).send("ID and Name do not match. No deletion occurred.");
            }
            else {
                DB.query(`DELETE FROM customeritems WHERE itemid = ${itemID};`);
                DB.query(`DELETE FROM itemingredients WHERE itemid = ${itemID};`);
                DB.query(`DELETE FROM items WHERE itemid = ${itemID} AND itemname = \'${itemName}\';`);
                res.status(202).send("Item deleted successfully.");
            }
        })
        .catch(err => {
            console.error("Error deleting item: ", err);
            res.status(500).send("Internal server error");
        })
});

/**
 * Handles the HTTP GET request to retrieve sales report within a specified time range.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {void} Returns sales report data within the specified time range.
 * @memberof module:routes/managemenu
 * @function
 * @name get/salesreport
 */
router.get('/salesreport', (req, res) => {
    const { timestamp1, timestamp2 } = req.query;

    if(!timestamp1 || !timestamp2) {
        return res.status(400).send("Missing field(s)");
    }

    data = [];
    DB
    // .query(`SELECT * FROM Ingredients WHERE CurrentStock < 0.2 * InitialStock;`)
    .query(`SELECT it.ItemName, COUNT(*) AS number_sold, it.ItemPrice * COUNT(*) AS income FROM customeritems ci JOIN items it ON ci.ItemID = it.ItemID WHERE ci.CustomerID IN (SELECT CustomerID FROM customer WHERE TimeOrdered BETWEEN TO_TIMESTAMP(\'${timestamp1} 00:00:00\', 'YYYY-MM-DD HH24:MI:SS') AND TO_TIMESTAMP(\'${timestamp2} 00:00:00\', 'YYYY-MM-DD HH24:MI:SS')) GROUP BY it.ItemName, it.ItemPrice;`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });

/**
 * Handles the HTTP GET request to retrieve excess report based on usage and current stock.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {void} Returns excess report data.
 * @memberof module:routes/managemenu
 * @function
 * @name get/excessreport
 */
router.get('/excessreport', (req, res) => {
    const { timestamp1 } = req.query;

    if(!timestamp1) {
        return res.status(400).send("Missing field(s)");
    }

    data = [];
    DB
    // .query(`SELECT * FROM Ingredients WHERE CurrentStock < 0.2 * InitialStock;`)
    .query(`SELECT ing.IngredientName, ing.currentstock, ing.initialstock FROM Ingredients ing JOIN (SELECT ii.IngredientID, COUNT(*) AS UsageCount FROM CustomerItems ci JOIN ItemIngredients ii ON ci.ItemID = ii.ItemID JOIN Customer c ON ci.CustomerID = c.CustomerID WHERE c.timeordered > \'${timestamp1}\' AND c.WeekNumber <= 119 GROUP BY ii.IngredientID) as Usage ON ing.IngredientID = Usage.IngredientID WHERE ing.CurrentStock > 0 AND (ing.CurrentStock - Usage.UsageCount) / ing.CurrentStock < 0.1;`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });

/**
 * Handles the HTTP GET request to retrieve items sold together within a specified time range.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {void} Returns items sold together data within the specified time range.
 * @memberof module:routes/managemenu
 * @function
 * @name get/sellstogether
 */
router.get('/sellstogether', (req, res) => {
    const { timestamp1, timestamp2 } = req.query;

    if(!timestamp1 || !timestamp2) {
        return res.status(400).send("Missing field(s)");
    }

    data = [];
    DB
    .query(`SELECT I1.ItemName AS ItemName1, I2.ItemName AS ItemName2, COUNT(*) AS Frequency FROM CustomerItems CI1 JOIN CustomerItems CI2 ON CI1.CustomerID = CI2.CustomerID AND CI1.ItemID < CI2.ItemID JOIN Items I1 ON CI1.ItemID = I1.ItemID JOIN Items I2 ON CI2.ItemID = I2.ItemID JOIN Customer C ON CI1.CustomerID = C.CustomerID WHERE C.TimeOrdered BETWEEN \'${timestamp1}\' AND \'${timestamp2}\' GROUP BY I1.ItemName, I2.ItemName ORDER BY Frequency DESC LIMIT 10;`)
    .then(query_res => {
    for (let i = 0; i < query_res.rowCount; i++){
        data.push(query_res.rows[i]);
    }
    res.send(data);
    }).catch((err)=>res.status(500).send(err.code="42P01"?"table doesn't exist":"internal error"));
    });
    
module.exports = router;

