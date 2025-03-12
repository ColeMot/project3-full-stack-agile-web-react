/**
 * @module routes/order
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP GET request to retrieve out of stock items.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when out of stock items are retrieved successfully.
 * @memberof module:routes/order
 * @function
 * @name get/outofstockitems
 */
router.get('/outofstockitems', (req, res) => {
  outOfStockItems = [];

  DB
    .query(`SELECT DISTINCT items.*
            FROM items
            JOIN itemingredients ON items.itemid = itemingredients.itemid
            JOIN ingredients ON itemingredients.ingredientid = ingredients.ingredientid
            WHERE ingredients.currentstock <= 0;`)
    .then((response) => {
      for (let i = 0; i < response.rowCount; i++) {
        outOfStockItems.push(response.rows[i]);
      }
      res.status(201).send(outOfStockItems);
    })
    .catch((error) => {
      console.error("Error checking out of stock items: ", error);
      res.status(500).send("Internal server error");
    })
})

/**
 * Handles the HTTP GET request to retrieve out of stock seasonal items.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when out of stock seasonal items are retrieved successfully.
 * @memberof module:routes/order
 * @function
 * @name get/outofstockseasonals
 */
router.get('/outofstockseasonals', (req, res) => {
  outOfStockSeasonals = [];

  DB
    .query(`SELECT DISTINCT seasonalitems.*
            FROM seasonalitems
            JOIN seasonalitemingredients ON seasonalitems.seasonalid = seasonalitemingredients.seasonalid
            JOIN ingredients ON seasonalitemingredients.ingredientid = ingredients.ingredientid
            WHERE ingredients.currentstock <= 0;`)
    .then((response) => {
      for (let i = 0; i < response.rowCount; i++) {
        outOfStockSeasonals.push(response.rows[i]);
      }
      res.status(201).send(outOfStockSeasonals);
    })
    .catch((error) => {
      console.error("Error checking out of stock seasonal items: ", error);
      res.status(500).send("Internal server error");
    })
})

/**
 * Handles the HTTP GET request to retrieve dietary items.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when dietary items are retrieved successfully.
 * @memberof module:routes/order
 * @function
 * @name get/dietary/:type
 */
router.get('/dietary/:type', (req, res) => {
  dietaryItems = [];

  if (req.params.type == 'veganitems') {
    table = 'items';
    restriction = 'vegan';
  }
  else if (req.params.type == 'veganseasonals') {
    table = 'seasonalitems';
    restriction = 'vegan';
  }
  else if (req.params.type == 'glutenitems') {
    table = 'items';
    restriction = 'gluten';
  }
  else if (req.params.type == 'glutenseasonals') {
    table = 'seasonalitems';
    restriction = 'gluten';
  }
  else if (req.params.type == 'peanutitems') {
    table = 'items';
    restriction = 'peanut';
  }
  else if (req.params.type == 'peanutseasonals') {
    table = 'seasonalitems';
    restriction = 'peanut';
  }

  DB
    .query(`SELECT * FROM ${table} WHERE ${restriction} = true;`)
    .then((response) => {
      for (let i = 0; i < response.rowCount; i++) {
        dietaryItems.push(response.rows[i]);
      }
      res.status(201).send(dietaryItems);
    })
    .catch((error) => {
      console.error(`Error checking ${restriction} items: `, error);
      res.status(500).send("Internal server error");
    })
})

/**
 * Handles the HTTP POST request to process checkout.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the checkout process is completed successfully.
 * @memberof module:routes/order
 * @function
 * @name post/checkout
 */
router.post("/checkout", (req, res) => {
  const { order } = req.body;

  let promises = order.map((item) => {
    const table = item.type === 'regular' ? 'ItemIngredients' : 'SeasonalItemIngredients';
    const itemIdColumn = item.type === 'regular' ? 'itemid' : 'seasonalid';

    return DB.query(
      `SELECT * FROM ${table} WHERE ${table}.${itemIdColumn} = ${item.id};`
    ).then((query_res) => {
      const ingredientIds = query_res.rows.map(ing => ing.ingredientid);
      console.log("Ingredient IDs for item", item.id, ":", ingredientIds); // Debug log

      if (ingredientIds.length === 0) {
        throw new Error(`No ingredients found for item ID: ${item.id}`);
      }

      const updateCommand = `UPDATE Ingredients
                             SET CurrentStock = CurrentStock - ${item.count}
                             WHERE IngredientID IN (${ingredientIds.join(", ")});`;
      console.log("Update Command:", updateCommand); // Debug log

      return DB.query(updateCommand)
        .then(() => {
          return DB.query(
            `SELECT ingredientname, CurrentStock FROM Ingredients WHERE IngredientID IN (${ingredientIds.join(", ")});`
          );
        })
        .then((query_res) => {
          const outOfStock = query_res.rows.filter(
            (ingredient) => ingredient.currentstock <= 0
          );
          if (outOfStock.length > 0) {
            throw new Error(
              `Can't make order: current stock of ${outOfStock.map(i => i.ingredientname).join(", ")} is too low.`
            );
          }
        });
    });
  });

  Promise.all(promises)
    .then(() => {
      console.log("Order completed");
      res.status(200).send("Order completed");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err.message || "An error occurred");
    });
});


module.exports = router;
