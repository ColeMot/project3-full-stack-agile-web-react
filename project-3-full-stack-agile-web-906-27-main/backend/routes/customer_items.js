/**
 * @module routes/customer_items
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();
const { format } = require('date-fns');  // Correctly imported

/**
 * Retrieves the current date and time formatted as 'yyyy-MM-dd HH:mm:ss'.
 * @returns {string} The current date and time in the specified format.
 * @memberof module:routes/customer_items
 */
function getCurrentDateTime() {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Retrieves the time of the first order placed by a customer.
 * @returns {Date} The time of the first order placed by a customer.
 * @throws {Error} If an error occurs while fetching the first time ordered.
 * @memberof module:routes/customer_items
 */
async function getFirstTimeOrdered() {
    try {
        const query = 'SELECT timeordered FROM customer ORDER BY customerid LIMIT 1;';
        const result = await DB.query(query);
        return result.rows.length > 0 ? result.rows[0].timeordered : new Date();  // Return current date if no entries found
    } catch (error) {
        console.error('Error fetching the latest timeordered:', error);
        throw error;
    }
}

/**
 * Calculates the difference in days between two dates.
 * @param {Date} date1 The first date.
 * @param {Date} date2 The second date.
 * @returns {number} The difference in days between the two dates.
 * @memberof module:routes/customer_items
 */
function getDifferenceInDays(date1, date2) {
    const diffInMilliseconds = date2 - date1;
    return Math.abs(Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24)));  // Simplified calculation
}

/**
 * Calculates the number of weeks based on the provided number of days.
 * @param {number} days The number of days.
 * @returns {number} The number of weeks.
 * @memberof module:routes/customer_items
 */
function getNumberOfWeeks(days) {
    return Math.floor(days / 7);
}

/**
 * Handles the HTTP POST request for processing an order.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the order is processed.
 * @memberof module:routes/customer_items
 * @function
 * @name post/checkout
 */
router.post('/checkout', async (req, res) => {
    const { order } = req.body;
    if (!order || !order.length) {
        return res.status(400).send('Invalid order data');
    }

    try {
        await DB.query('BEGIN');
        const current_time_str = getCurrentDateTime();
        const first_customer_time = new Date(await getFirstTimeOrdered());
        const daysDifference = getDifferenceInDays(first_customer_time, new Date(current_time_str));
        const totalWeeks = getNumberOfWeeks(daysDifference);
        const weekInsert = totalWeeks + 1;
        const orderStatus = "Incomplete";
        
        const customerResult = await DB.query(
            'INSERT INTO customer (timeordered, weeknumber, status) VALUES ($1, $2, $3) RETURNING customerid',
            [current_time_str, weekInsert, orderStatus]
        );
        const customerid = customerResult.rows[0].customerid;

        for (const item of order) {
            const { id, count, type } = item;
            const column = type === 'seasonal' ? 'seasonalid' : 'itemid';
            
            
            if(column == "itemid"){
                for (let j = 0; j < count; j++) {
                    await DB.query(`INSERT INTO customeritems (itemid, customerid, seasonalid) VALUES ($1, $2, $3)`, [id, customerid, null]);
                }
            }
            else{
                for (let j = 0; j < count; j++) {
                    await DB.query(`INSERT INTO customeritems (itemid, customerid, seasonalid) VALUES ($1, $2, $3)`, [null, customerid, id]);
                }
            }
            
        }

        await DB.query('COMMIT');
        res.send(`Order processed successfully. Days since last order: ${daysDifference}`);
    } catch (error) {
        await DB.query('ROLLBACK');
        console.error('Failed to process order:', error);
        res.status(500).send('Failed to process order');
    }
});

/**
 * Handles the HTTP GET request for fetching popular items.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when popular items are fetched.
 * @memberof module:routes/customer_items
 * @function
 * @name get/popular
 */
router.get('/popular', (req, res) => {
    popularItems = [];
    DB.query(`
        SELECT items.itemname AS item_name, COUNT(customeritems.itemid) AS total_sales
        FROM customeritems
        JOIN items ON customeritems.itemid = items.itemid
        GROUP BY items.itemname
        UNION
        SELECT seasonalitems.itemname AS item_name, COUNT(customeritems.seasonalid) AS total_sales
        FROM customeritems
        JOIN seasonalitems ON customeritems.seasonalid = seasonalitems.seasonalid
        GROUP BY seasonalitems.itemname
        ORDER BY total_sales DESC
        LIMIT 5;
    `).then((response) => {
        popularItems = response.rows;
        res.status(201).send(popularItems);
    }).catch((error) => {
        console.error("Failed to fetch popular items:", error);
        res.status(500).send("Internal server error");
    });
})

module.exports = router;
