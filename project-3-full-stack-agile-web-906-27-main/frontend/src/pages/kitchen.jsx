import React, { useState, useEffect } from 'react';
import axios from "axios";
import "../css/KitchenComponents/kitchen.css";
import { Link } from "react-router-dom";
import colorblindIcon from "../images/red-green.png";
import textSizeIcon from "../images/text-size-icon.png";

/**
 * Represents the kitchen order management system for handling order statuses,
 * displaying incomplete and past orders, and modifying accessibility settings.
 *
 * @returns {JSX.Element} The kitchen component with order management features.
 * @module Kitchen
 */
const Kitchen = () => {
    const [message, setMessage] = useState("");
    const [incompleteOrders, setIncompleteOrders] = useState([]);
    const [incompleteOrderItems, setIncompleteOrderItems] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [pastOrderItems, setPastOrderItems] = useState([]);
    const [numPastOrders, setNumPastOrders] = useState(10);
    const [fetchingIncompletes, setFetchingIncompletes] = useState(false);
    const [fetchingPasts, setFetchingPasts] = useState(false);
    const [colorBlindMode, setColorBlindMode] = useState(false);
    const [textSizeIncreased, setTextSizeIncreased] = useState(false);

    /**
    * Initializes and cleans up the kitchen environment UI settings.
    * Fetches incomplete and past orders when the component mounts.
    */
    useEffect(() => {
        document.body.classList.add("kitchen-body");
        fetchIncompleteOrders();
        fetchPastOrders();
        return () => {
            document.body.classList.remove("kitchen-body");
        };
    }, [numPastOrders]);

    /**
     * Toggles the color blind mode for better accessibility.
     * @memberof module:Kitchen
     */
    const toggleColorBlindMode = () => {
        setColorBlindMode(!colorBlindMode);
        if (colorBlindMode) {
            document.body.classList.remove("colorblind-mode");
        } else {
            document.body.classList.add("colorblind-mode");
        }
    };

    /**
    * Toggles the text size for increased readability.
    * @memberof module:Kitchen
    */
    const toggleTextSize = () => {
        setTextSizeIncreased(prevTextSizeIncreased => {
            const newState = !prevTextSizeIncreased;
            if (newState) {
                document.body.classList.add("text-size-increased");
            } else {
                document.body.classList.remove("text-size-increased");
            }
            return newState;
        });
    };


    /**
     * Effect hook that triggers fetching of items for incomplete orders.
     * It only runs when there are incomplete orders and when it is not currently fetching past orders.
     * This is to prevent simultaneous network requests for item details of different order types,
     * ensuring that the UI updates are manageable and that the server is not overwhelmed.
     * @memberof module:Kitchen
     */
    useEffect(() => {
        if (incompleteOrders.length > 0 && !fetchingPasts) fetchIncompleteOrderItems();
    }, [incompleteOrders, fetchingPasts]);

    /**
    * Effect hook that triggers fetching of items for past orders.
    * It only runs when there are past orders and when it is not currently fetching incomplete orders.
    * Similar to the above effect, this setup ensures that fetching operations for past and incomplete
    * orders do not interfere with each other, allowing for controlled data retrieval and UI updates.
    * @memberof module:Kitchen
    */
    useEffect(() => {
        if (pastOrders.length > 0 && !fetchingIncompletes) fetchPastOrderItems();
    }, [pastOrders, fetchingIncompletes]);

    /**
    * Fetches incomplete orders from the backend.
    * @memberof module:Kitchen
    */
    const fetchIncompleteOrders = () => {
        axios
            .get(`http://localhost:3001/manageorder/incompleteorders`)
            .then((response) => {
                setIncompleteOrders(response.data);
            })
            .catch((error) => {
                console.error("Error fetching active orders: ", error);
            });
    };

    /**
     * Fetches items for the incomplete orders.
     * @memberof module:Kitchen
     */
    const fetchIncompleteOrderItems = () => {
        setFetchingIncompletes(true);
        axios
            .get(`http://localhost:3001/manageorder/orderitems`, {
                params: { orders: incompleteOrders }
            })
            .then((response) => {
                setIncompleteOrderItems(response.data);
            })
            .catch((error) => {
                console.error("Error fetching order items: ", error);
            })
            .finally(() => {
                setFetchingIncompletes(false);
            });
    };

    /**
     * Fetches past orders from the backend.
     * @memberof module:Kitchen
     */
    const fetchPastOrders = () => {
        axios
            .get(`http://localhost:3001/manageorder/recentorders`, {
                params: { numOfOrders: numPastOrders }
            })
            .then((response) => {
                setPastOrders(response.data);
            })
            .catch((error) => {
                console.error("Error fetching past orders: ", error);
            });
    };

    /**
    * Fetches items for the past orders.
    * @memberof module:Kitchen
    */
    const fetchPastOrderItems = () => {
        setFetchingPasts(true);
        axios
            .get(`http://localhost:3001/manageorder/orderitems`, {
                params: { orders: pastOrders }
            })
            .then((response) => {
                setPastOrderItems(response.data);
            })
            .catch((error) => {
                console.error("Error fetching order items: ", error);
            }).finally(() => {
                setFetchingPasts(false);
            });
    };

    /**
     * Handles status changes for incomplete orders.
     * @param {Event} e - The event object from the select element.
     * @param {number} index - Index of the order in the incompleteOrders array.
     * @memberof module:Kitchen
     */
    const handleStatusChangeIncomplete = (e, index) => {
        const newStatus = e.target.value;
        setIncompleteOrders(prevIncompleteOrders => {
            const updatedIncompleteOrders = [...prevIncompleteOrders];
            updatedIncompleteOrders[index].status = newStatus;
            return updatedIncompleteOrders;
        });

        const customerID = incompleteOrders[index].customerid;
        axios
            .post(`http://localhost:3001/manageorder/updatestatus/`, { customerID, newStatus })
            .then((response) => {
                console.log(response.data);
                setMessage(`Order #${customerID} status successfully updated to ${newStatus}.`);
                fetchIncompleteOrders();
                fetchPastOrders();
            })
            .catch((error) => {
                console.error(`Error updating order #${customerID}:`, error);
                setMessage(`Error updating order #${customerID}.`);
            });
    };

    /**
     * Handles status changes for past orders.
     * @param {Event} e - The event object from the select element.
     * @param {number} index - Index of the order in the pastOrders array.
     * @memberof module:Kitchen
     */
    const handleStatusChangePast = (e, index) => {
        const newStatus = e.target.value;
        setPastOrders(prevPastOrders => {
            const updatedPastOrders = [...prevPastOrders];
            updatedPastOrders[index].status = newStatus;
            return updatedPastOrders;
        });

        const customerID = pastOrders[index].customerid;
        axios
            .post(`http://localhost:3001/manageorder/updatestatus/`, { customerID, newStatus })
            .then((response) => {
                console.log(response.data);
                setMessage(`Order #${customerID} status successfully updated to ${newStatus}.`);
                fetchIncompleteOrders();
                fetchPastOrders();
            })
            .catch((error) => {
                console.error(`Error updating order #${customerID}:`, error);
                setMessage(`Error updating order #${customerID}.`);
            });
    };

    /**
    * Handles changes in the number of past orders to fetch and display.
    * @param {Event} e - The event object from the select element.
    * @memberof module:Kitchen
    */
    const handleNumPastOrdersChange = (e) => {
        setNumPastOrders(parseInt(e.target.value));
    };

    /**
     * Formats a timestamp into a readable date-time string.
     * @param {string} timestamp - The timestamp to format.
     * @returns {string} The formatted date-time string.
     * @memberof module:Kitchen
     */
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    /**
     * Renders the Kitchen Compnent
     */
    return (
        <div className="content">
            <div className="main">
                <Link to="/" className="back-home-button">Back to Home</Link>
                <img
                    src={colorblindIcon}
                    alt="Colorblind Mode"
                    className="kitchen-colorblind-toggle"
                    onClick={toggleColorBlindMode}
                    style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
                />

                <img
                    src={textSizeIcon}
                    alt="Increase Text Size"
                    className="kitchen-text-size-toggle"
                    onClick={toggleTextSize}
                    style={{ position: 'absolute', top: '15px', right: '250px', cursor: 'pointer' }}
                />

                <p>{message}</p>
                <div className="incomplete-orders-container">
                    <h1>Active orders:</h1>
                    {incompleteOrders.map((order, index) => (
                        <div key={index} className="order-item">
                            <p>Order ID: {order.customerid}, Time: {formatTime(order.timeordered)}, Status: {order.status}</p>
                            {incompleteOrderItems
                                .filter((item) => item.customerid === order.customerid)
                                .map((item) => (
                                    <tr
                                        style={{
                                            backgroundColor: "#370000",
                                            border: 'none'
                                        }}>
                                        <td style={{ border: 'none' }}>{item.regular_item ? item.regular_item : item.seasonal_item}: </td>
                                        <td style={{ border: 'none' }}>{item.item_quantity}</td>
                                    </tr>
                                ))}
                            <select value={order.status} onChange={(e) => handleStatusChangeIncomplete(e, index)}>
                                <option value="Canceled">Canceled</option>
                                <option value="Completed">Completed</option>
                                <option value="Incomplete">Incomplete</option>
                            </select>
                        </div>
                    ))}
                </div>
                <div className="past-orders-container">
                    <h1>Past orders:</h1>
                    <div>
                        <select value={numPastOrders} onChange={(e) => handleNumPastOrdersChange(e)}>
                            <option value={10}>10 Orders</option>
                            <option value={20}>20 Orders</option>
                            <option value={50}>50 Orders</option>
                        </select>
                    </div>
                    {pastOrders.map((order, index) => (
                        <div key={index} className="order-item">
                            <p>Order ID: {order.customerid}, Time: {formatTime(order.timeordered)}, Status: {order.status}</p>
                            {pastOrderItems
                                .filter((item) => item.customerid === order.customerid)
                                .map((item) => (
                                    <tr
                                        style={{
                                            backgroundColor: "#370000",
                                            border: 'none'
                                        }}>
                                        <td style={{ border: 'none' }}>{item.regular_item ? item.regular_item : item.seasonal_item}: </td>
                                        <td style={{ border: 'none' }}>{item.item_quantity}</td>
                                    </tr>
                                ))}
                            <select defaultValue={order.status} onChange={(e) => handleStatusChangePast(e, index)}>
                                <option value="Canceled">Canceled</option>
                                <option value="Completed">Completed</option>
                                <option value="Incomplete">Incomplete</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Kitchen;
