import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useRoleRequired } from "../components/utility";
import "../css/OrderComponents/order.css";
import colorblindIcon from "../images/red-green.png";
import textSizeIcon from "../images/text-size-icon.png";
import { HOST } from "../const";
import veganIcon from "../assets/icons/vegan_icon.png";
import glutenIcon from "../assets/icons/gluten_icon.png";
import peanutIcon from "../assets/icons/peanut_icon.png";

/**
 * Functional component for handling the order process, including managing inventory,
 * dietary restrictions, accessibility features, and order finalization.
 * @module Order
 */
const Order = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showThanksPopup, setShowThanksPopup] = useState(false);
  const [outOfStockNames, setOutOfStockNames] = useState([]);
  const [veganItems, setVeganItems] = useState([]);
  const [veganSeasonals, setVeganSeasonals] = useState([]);
  const [glutenItems, setGlutenItems] = useState([]);
  const [glutenSeasonals, setGlutenSeasonals] = useState([]);
  const [peanutItems, setPeanutItems] = useState([]);
  const [peanutSeasonals, setPeanutSeasonals] = useState([]);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [textSizeIncreased, setTextSizeIncreased] = useState(false);

  // Role check for user access
  useRoleRequired(["admin", "manager", "cashier"], "/");

  /**
   * Fetch out of stock items and dietary restrictions on component mount.
   * @memberof module:Order
   */
  useEffect(() => {
    fetchOutOfStockItems();
    fetchDietaryRestrictions();
  }, []);

  /**
   * Fetch item data whenever out of stock information changes.
   * @memberof module:Order
   */
  useEffect(() => {
    if (outOfStockNames.length > 0) fetchData();
  }, [outOfStockNames]);

   /**
   * Fetches the list of items currently out of stock.
   * @memberof module:Order
   */
  const fetchOutOfStockItems = () => {
    let nameData = [];
    axios
      .get(`http://localhost:3001/order/outofstockitems`)
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          nameData.push(response.data[i].itemname);
        }
        axios
          .get(`http://localhost:3001/order/outofstockseasonals`)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              nameData.push(response.data[i].itemname);
            }
            setOutOfStockNames((prevData) => [...prevData, ...nameData]);
            fetchData();
          })
          .catch((error) => {
            console.error(
              "Error fetching out of stock seasonal items: ",
              error
            );
          });
      })
      .catch((error) => {
        console.error("Error fetching out of stock items: ", error);
      });
  };

  /**
   * Fetches dietary restriction data for various categories (vegan, gluten, peanuts).
   * @memberof module:Order
   */
  const fetchDietaryRestrictions = () => {
    axios
      .get(`http://localhost:3001/order/dietary/veganitems`)
      .then((response) => {
        let veganData = [];
        for (let i = 0; i < response.data.length; i++) {
          veganData.push(response.data[i].itemname);
        }
        setVeganItems(veganData);
        axios
          .get(`http://localhost:3001/order/dietary/veganseasonals`)
          .then((response) => {
            let veganData = [];
            for (let i = 0; i < response.data.length; i++) {
              veganData.push(response.data[i].itemname);
            }
            setVeganSeasonals(veganData);
            axios
              .get(`http://localhost:3001/order/dietary/glutenitems`)
              .then((response) => {
                let glutenData = [];
                for (let i = 0; i < response.data.length; i++) {
                  glutenData.push(response.data[i].itemname);
                }
                setGlutenItems(glutenData);
                axios
                  .get(`http://localhost:3001/order/dietary/glutenseasonals`)
                  .then((response) => {
                    let glutenData = [];
                    for (let i = 0; i < response.data.length; i++) {
                      glutenData.push(response.data[i].itemname);
                    }
                    setGlutenSeasonals(glutenData);
                    axios
                      .get(`http://localhost:3001/order/dietary/peanutitems`)
                      .then((response) => {
                        let peanutData = [];
                        for (let i = 0; i < response.data.length; i++) {
                          peanutData.push(response.data[i].itemname);
                        }
                        setPeanutItems(peanutData);
                        axios
                          .get(`http://localhost:3001/order/dietary/peanutseasonals`)
                          .then((response) => {
                            let peanutData = [];
                            for (let i = 0; i < response.data.length; i++) {
                              peanutData.push(response.data[i].itemname);
                            }
                            setPeanutSeasonals(peanutData);
                          })
                          .catch((error) => {
                            console.error("Error fetching peanut seasonal items: ", error);
                          });
                      })
                      .catch((error) => {
                        console.error("Error fetching peanut items: ", error);
                      });
                  })
                  .catch((error) => {
                    console.error("Error fetching gluten seasonal items: ", error);
                  });
              })
              .catch((error) => {
                console.error("Error fetching gluten items: ", error);
              });
          })
          .catch((error) => {
            console.error("Error fetching vegan seasonal items: ", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching vegan items: ", error);
      });
  };

   /**
   * Toggles the state for color blind accessibility feature.
   * @memberof module:Order
   */
  const toggleColorBlindMode = () => {
    setColorBlindMode((prevColorBlindMode) => {
      const newColorBlindMode = !prevColorBlindMode;
      if (newColorBlindMode) {
        document.body.classList.add("colorblind-mode");
      } else {
        document.body.classList.remove("colorblind-mode");
      }
      return newColorBlindMode;
    });
  };

  /**
   * Toggles the text size for better readability.
   * @memberof module:Order
   */
  const toggleTextSize = () => {
    setTextSizeIncreased((prevTextSizeIncreased) => {
      const newTextSizeIncreased = !prevTextSizeIncreased;
      if (newTextSizeIncreased) {
        document.body.classList.add("text-size-increased");
      } else {
        document.body.classList.remove("text-size-increased");
      }
      return newTextSizeIncreased;
    });
  };

  /**
   * Fetches the full list of items for the order, filtering out any that are out of stock.
   * @memberof module:Order
   */
  const fetchData = () => {
    axios
      .get(`${HOST}/read/items`)
      .then((res) => {
        const filteredData = res.data.filter(
          (item) => !outOfStockNames.includes(item.itemname)
        );
        setData(filteredData.map((item) => ({ ...item, count: 0, type: 'regular' })));
        axios.get(`${HOST}/read/seasonalitems`).then((res) => {
          const today_date = new Date();
          const today = today_date.toISOString().split("T")[0];
          const filteredData2 = res.data.filter(
            (item) => item.startdate <= today && item.enddate >= today
          );
          const filteredData3 = filteredData2.filter(
            (item) => !outOfStockNames.includes(item.itemname)
          );
          setData((prevData) => [
            ...prevData,
            ...filteredData3.map((item) => ({ ...item, count: 0, type: 'seasonal' })),
          ]);
        });
      })
      .catch((err) => {
        console.error(err.response || err);
      });
  };


  /**
   * Adds an item to the order count.
   * @param {number} index - The index of the item to add.
   * @memberof module:Order
   */
  const addItem = (index) => {
    setData((prevData) =>
      prevData.map((item, idx) =>
        idx === index ? { ...item, count: item.count + 1 } : item
      )
    );
  };

  /**
   * Removes all items from the order.
   * @param {number} index - The index of the item to remove.
   * @memberof module:Order
   */
  const decrementItem = (index) => {
    setData((prevData) =>
      prevData.map((item, idx) =>
        idx === index ? { ...item, count: Math.max(0, item.count - 1) } : item
      )
    );
  };

  /**
   * Calculates the total price for the items in the order.
   * @returns {string} - The formatted total price.
   * @memberof module:Order
   */
  const calculateTotal = () => {
    return data
      .reduce((acc, item) => acc + item.count * parseFloat(item.itemprice), 0)
      .toFixed(2);
  };

   /**
   * Handles the checkout process and sets the confirmation popup.
   * @memberof module:Order
   */
  const handleCheckout = () => {
    setShowModal(true);
  };

   /**
   * Closes the modal and resets the state.
   * @memberof module:Order
   */
  const closeModal = () => {
    setShowModal(false);
  };

   /**
   * Confirms the checkout, posts the order, and handles the response.
   * @memberof module:Order
   */
  
  const confirmCheckout = () => {
    const order = data.filter(item => item.count > 0)
                      .map(item => ({
                          id: item.type === 'regular' ? item.itemid : item.seasonalid, 
                          count: item.count,
                          type: item.type
                      }));

    axios
      .post(`${HOST}/order/checkout`, { order })
      .then(() => {
        setData((prevData) => prevData.map((item) => ({ ...item, count: 0 })));
        setShowModal(false);
        setShowThanksPopup(true);
        setTimeout(() => setShowThanksPopup(false), 3000);
      })
      .catch((err) => {
        console.error("Checkout error:", err);
      });

      axios
      .post(`${HOST}/customer_items/checkout`, { order })
      .then(() => {
        setData((prevData) => prevData.map((item) => ({ ...item, count: 0 })));
        setShowModal(false);
        setShowThanksPopup(true);
        setTimeout(() => setShowThanksPopup(false), 3000);
      })
      .catch((err) => {
        console.error("Checkout error:", err);
      });
  };

  /**
   * Utility function to chunk data into rows for display.
   * @param {Array} data - The data to chunk.
   * @param {number} chunkSize - The size of each chunk.
   * @returns {Array} - An array of chunks.
   * @memberof module:Order
   */
  const chunkData = (data, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const chunkedData = chunkData(data, 4);
  const isAnyItemSelected = data.some((item) => item.count > 0);
  
  /**
   * Renders the cashier checkout UI and any other components necessary
   */
  return (
    <div className="order-body">
    <div className="split-container">
      <div className="back-to-home">
        <Link to="/" className="home-button">
          Back to Home
        </Link>
        <img
          src={colorblindIcon}
          alt="Toggle Colorblind Mode"
          className="order-colorblind-toggle"
          onClick={toggleColorBlindMode}
        />
        <img
          src={textSizeIcon}
          alt="Increase Text Size"
          className="order-text-size-toggle"
          onClick={toggleTextSize}
        />
      </div>

      <div className="items-container">
        {chunkedData.map((row, rowIndex) => (
          <div key={rowIndex} className="items-row">
            {row.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="item-card"
                onClick={() => addItem(rowIndex * 4 + itemIndex)}>
                <h1>{item.itemname}</h1>
                <div>
                  {(veganItems.includes(item.itemname) ||
                    veganSeasonals.includes(item.itemname)) && (
                    <img
                      src={veganIcon}
                      alt="This item is Vegan"
                      className="dietary-icon"
                    />
                  )}
                  {(glutenItems.includes(item.itemname) ||
                    glutenSeasonals.includes(item.itemname)) && (
                    <img
                      src={glutenIcon}
                      alt="This item contains Gluten"
                      className="dietary-icon"
                    />
                  )}
                  {(peanutItems.includes(item.itemname) ||
                    peanutSeasonals.includes(item.itemname)) && (
                    <img
                      src={peanutIcon}
                      alt="This item contains Peanuts"
                      className="dietary-icon"
                    />
                  )}
                </div>
                <h2>${item.itemprice}</h2>
              </div>
            ))}
          </div>
        ))}
      </div>

      {isAnyItemSelected && (
        <div className="order-summary">
        {data.map(
          (item, index) =>
            item.count > 0 && (
              <div key={index} className="price-item">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3>{`${item.itemname}: ${item.count}`}</h3>
                  <button
                    className="remove-item-button"
                    onClick={() => decrementItem(index)}
                    style={{ marginTop: '10px', borderColor: '#ffc700' }}>
                    x
                  </button>
                </div>
                <h4>${Math.round(item.itemprice * item.count * 100) / 100}</h4>
              </div>
            )
        )}
          <div className="order-order-total">
            <h1>
              Subtotal: ${calculateTotal()}<br />
              Tax: ${Math.round(calculateTotal() * 8.25) / 100}<br />
              Total: ${Math.round(calculateTotal() * 108.25) / 100}
            </h1>
          </div>
          <div className="checkout-button-container">
            <button className="checkout-button" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ConfirmationModal
          show={showModal}
          onClose={closeModal}
          onConfirm={confirmCheckout}
        />
      )}

      {showThanksPopup && (
        <div className="thank-you-popup">Order is complete!</div>
      )}
    </div>
    </div>
  );
};

/**
 * Renders a modal dialog used to confirm user actions.
 * This modal will only render if the `show` prop is true. It provides "Yes" and "No" options to
 * either proceed with an action or cancel it.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.show - Controls the visibility of the modal. If false, the modal will not render.
 * @param {Function} props.onClose - Function to call when the user decides to close the modal without confirming.
 * @param {Function} props.onConfirm - Function to call when the user confirms the action.
 * @returns {JSX.Element|null} - The modal element or null if not visible.
 */
const ConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal show">
      <div className="modal-content">
        <h2>Are you sure?</h2>
        <div className="modal-buttons">
          <button className="yes-button" onClick={onConfirm}>
            Yes
          </button>
          <button className="no-button" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
