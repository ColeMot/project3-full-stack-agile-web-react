/**
 * @module routes/manageorder
 * @requires express
 */

const DB = require("../db");
const router = require("express").Router();

/**
 * Handles the HTTP GET request to retrieve recent orders.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when recent orders are retrieved successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name get/recentorders
 */
router.get('/recentorders', (req, res) => {
    const { numOfOrders } = req.query;
    recentOrders = [];
    if (!numOfOrders) {
        DB
            .query(`SELECT * FROM customer;`)
            .then(result => {
                for (let i = 0; i < result.rowCount; i++) {
                    recentOrders.push(result.rows[i]);
                }
                res.status(201).send(recentOrders);
            })
            .catch(err => {
                console.error("Error checking recent orders: ", err);
                res.status(500).send("Internal server error");
            });
    }
    else {
        DB
            .query(`SELECT * FROM customer ORDER BY customerid DESC LIMIT ${numOfOrders};`)
            .then(result => {
                for (let i = 0; i < result.rowCount; i++) {
                    recentOrders.push(result.rows[i]);
                }
                res.status(201).send(recentOrders);
            })
            .catch(err => {
                console.error("Error checking recent orders: ", err);
                res.status(500).send("Internal server error");
            });
    }
})

/**
 * Handles the HTTP GET request to retrieve incomplete orders.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when incomplete orders are retrieved successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name get/incompleteorders
 */
router.get('/incompleteorders', (req, res) => {
    incompleteOrders = [];
    DB
        .query(`SELECT * FROM customer WHERE status = 'Incomplete';`)
        .then(result => {
            for (let i = 0; i < result.rowCount; i++) {
                incompleteOrders.push(result.rows[i]);
            }
            res.status(201).send(incompleteOrders);
        })
        .catch(err => {
            console.error("Error checking incomplete orders: ", err);
            res.status(500).send("Internal server error");
        });
})

/**
 * Handles the HTTP GET request to retrieve order items.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when order items are retrieved successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name get/orderitems
 */
router.get('/orderitems', async (req, res) => {
    const { orders } = req.query;
    ordersArray = Object.values(orders);
    const orderItems = [];
    try {
        for (const order of ordersArray) {
            const result = await DB.query(  `SELECT
                                                customeritems.customerid,
                                                items.itemname AS regular_item, 
                                                seasonalitems.itemname AS seasonal_item,
                                                COUNT(*) AS item_quantity
                                            FROM 
                                                customeritems
                                            LEFT JOIN 
                                                items ON customeritems.itemid = items.itemid
                                            LEFT JOIN 
                                                seasonalitems ON customeritems.seasonalid = seasonalitems.seasonalid
                                            WHERE 
                                                customeritems.customerid = ${order.customerid}
                                            GROUP BY 
                                                customeritems.customerid, items.itemname, seasonalitems.itemname;`);

            orderItems.push(...result.rows);
        }

        res.json(orderItems);
    } catch (error) {
        console.error("Error fetching order items:", error);
        res.status(500).send("Internal server error");
    }
});

/**
 * Handles the HTTP POST request to delete an order.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the order is deleted successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name post/delete
 */
router.post('/delete', (req, res) => {
    const { customerID } = req.body;

    if (!customerID) {
        return res.status(400).send("Missing Customer ID");
    }

    try {
        DB.query(`DELETE FROM customeritems WHERE customerid = ${customerID};`);
        DB.query(`DELETE FROM customer WHERE customerid = ${customerID};`);
        res.status(201).send("Order deleted successfully.");
    } catch (error) {
        console.error("Error deleting order: ", err);
            res.status(500).send("Internal server error.");
    }
})

/**
 * Handles the HTTP POST request to update an order.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the order is updated successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name post/update
 */
router.post('/update', (req, res) => {
    const { customerID, timeOrdered, weekNumber, status } = req.body;

    if (!customerID) {
        return res.status(400).send("Missing Customer ID (REQUIRED)");
    }

    if (!timeOrdered && !weekNumber && !status) {
        return res.status(400).send("Nothing to update");
    }

    const updateFields = [];
    if (timeOrdered) {
        updateFields.push(`timeordered = \'${timeOrdered}\'`);
    }
    if (weekNumber) {
        updateFields.push(`weeknumber = ${weekNumber}`);
    }
    if (status) {
        updateFields.push(`status = \'${status}\'`);
    }
    const updateQuery = `UPDATE customer SET ${updateFields.join(', ')} WHERE customerid = ${customerID};`;

    DB
        .query(updateQuery)
        .then(() => {
            res.status(201).send("Order updated successfully");
        })
        .catch(err => {
            console.error("Error updating order: ", err);
            res.status(500).send("Internal server error");
        });
})

/**
 * Handles the HTTP POST request to update the status of an order.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>} A promise that resolves when the status of the order is updated successfully.
 * @memberof module:routes/manageorder
 * @function
 * @name post/updatestatus
 */
router.post('/updatestatus', (req, res) => {
    const { customerID, newStatus } = req.body;

    DB
        .query(`UPDATE customer SET status = '${newStatus}' WHERE customerID = ${customerID};`)
        .then(() => {
            res.status(201).send(`Updated status for order #${customerID} successfully`);
        })
        .catch(err => {
            console.error("Error updating status: ", err);
            res.status(500).send("Internal server error");
        })
})

module.exports = router;