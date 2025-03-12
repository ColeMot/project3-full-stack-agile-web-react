/**
 * @module routes/itemNames_to_itemIds
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP POST request for retrieving item IDs by item names.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when item IDs are retrieved.
 * @memberof module:routes/itemNames_to_itemIds
 * @function
 * @name post/get-item-ids
 */
router.post('/get-item-ids', async (req, res) => {
  const itemNames = req.body.itemNames;
  if (!itemNames || !Array.isArray(itemNames)) {
    return res.status(400).send('Invalid item names list');
  }

  const query = 'SELECT itemid, itemname FROM items WHERE itemname = ANY($1);';

  try {
    const result = await DB.query(query, [itemNames]);
    res.json(result.rows.map(item => ({ name: item.itemname, id: item.itemid })));
  } catch (error) {
    console.error('Error fetching item IDs:', error);
    res.status(500).send('Database error');
  }
});

module.exports = router;
