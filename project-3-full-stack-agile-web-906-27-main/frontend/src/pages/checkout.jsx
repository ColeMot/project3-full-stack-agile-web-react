import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/CheckoutComponents/checkout.css";
import CategoryCard from "../Functions/CategoryCard";
import CartPanel from "../Functions/CartPanel";
import SubcategoryModal from "../Functions/subcategoryModal";
import logo from "../images/REVs LOGO.png";
import LTO from "../images/Categories/LTO.png";
import Combo from "../images/Categories/Combos.png";
import Burger from "../images/Categories/Burgers.png";
import Sandwich from "../images/Categories/Sandwiches.png";
import Salad from "../images/Categories/Salads.png";
import Side from "../images/Categories/Sides.png";
import Shake from "../images/Categories/Shakes.png";
import Drink from "../images/Categories/Drinks.png";
import axios from "axios";
import colorblindIcon from "../images/red-green.png";
import textSizeIcon from "../images/text-size-icon.png";

/**
 * Checkout component handles the UI for the checkout process including handling category selections,
 * displaying modal dialogs for confirmations and cancellations, and adjusting accessibility settings.
 * @returns {JSX.Element} The rendered component for the checkout page.
 * @module Checkout
 */
function Checkout() {
  const navigate = useNavigate();

  // State management for UI elements visibility and selections
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  // State for order details and stock management
  const [orderNumber, setOrderNumber] = useState("");
  const [outOfStockNames, setOutOfStockNames] = useState([]);

  // State for dietary restriction based categories
  const [veganItems, setVeganItems] = useState([]);
  const [veganSeasonals, setVeganSeasonals] = useState([]);
  const [glutenItems, setGlutenItems] = useState([]);
  const [glutenSeasonals, setGlutenSeasonals] = useState([]);
  const [peanutItems, setPeanutItems] = useState([]);
  const [peanutSeasonals, setPeanutSeasonals] = useState([]);

  // Accessibility states
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [textSizeIncreased, setTextSizeIncreased] = useState(false);

  // Category data states
  const [seasonalCategory, setSeasonalCategory] = useState([]);
  const [regularItemCategory, setRegularItemCategory] = useState([]);
  const [comboCategory, setComboCategory] = useState([]);
  const [burgerCategory, setBurgerCategory] = useState([]);
  const [sandwichCategory, setSandwichCategory] = useState([]);
  const [saladCategory, setSaladCategory] = useState([]);
  const [sideCategory, setSideCategory] = useState([]);
  const [shakeCategory, setShakeCategory] = useState([]);
  const [drinkCategory, setDrinkCategory] = useState([]);

  /**
   * Fetches and sets the order number from the backend on component mount.
   * Sets body class for checkout styling and cleans up on unmount.
   */
  useEffect(() => {
    fetchOrderNumber();
    fetchOutOfStockItems();
    fetchDietaryRestrictions();
    document.body.classList.add("checkout-body");
    return () => {
      document.body.classList.remove("checkout-body");
    };
  }, []);

  /**
   * Fetches category data if there are items that are out of stock.
   */
  useEffect(() => {
    if (outOfStockNames.length > 0) fetchCategories();
  }, [outOfStockNames]);

  /**
   * Toggles the state of colorblind mode, adding or removing the respective class on the body.
   * @memberof module:Checkout
   */
  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode);  // Toggle the state
    if (colorBlindMode) {
      document.body.classList.remove("colorblind-mode");
    } else {
      document.body.classList.add("colorblind-mode");
    }
  };

  /**
   * Toggles the text size for better visibility, adding or removing the respective class on the body.
   * @memberof module:Checkout
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

  // Various handlers for modal dialogs and navigation
  const handleCancel = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleConfirm = () => {
    window.location.reload();
  };

  /**
   * Shows the cart panel.
   * @memberof module:Checkout
   */
  const handleCompleteOrder = () => setShowCart(true);

  /**
   * Closes the cart panel.
   * @memberof module:Checkout
   */
  const handleCloseCart = () => setShowCart(false);

  /**
   * Handles the selection of a category, updating the state with subcategories.
   * @param {Array} subcategories The subcategories associated with the selected category.
   * @memberof module:Checkout
   */
  const handleCategoryClick = (subcategories) => {
    setSelectedSubcategories(subcategories);
    setShowSubcategoryModal(true);
  };

  // Handler to close the subcategory modal on pressing the Escape key.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27 && showSubcategoryModal) { // 27 is the Escape key
        setShowSubcategoryModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSubcategoryModal]);

  // Predefined categories used for rendering CategoryCard components
  const categories = [
    {
      name: "Limited Time Offers",
      image: LTO,
      subcategories: [seasonalCategory]
    },
    {
      name: "Combos",
      image: Combo,
      subcategories: [comboCategory]
    },
    {
      name: "Burgers",
      image: Burger,
      subcategories: [burgerCategory]
    },
    {
      name: "Sandwiches",
      image: Sandwich,
      subcategories: [sandwichCategory]
    },
    {
      name: "Salads",
      image: Salad,
      subcategories: [saladCategory]
    },
    {
      name: "Sides",
      image: Side,
      subcategories: [sideCategory]
    },
    {
      name: "Shakes",
      image: Shake,
      subcategories: [shakeCategory]
    },
    {
      name: "Drinks",
      image: Drink,
      subcategories: [drinkCategory]
    }
  ];

  /**
 * Fetches the current order number from the backend.
 * This function is expected to make a GET request to retrieve the order number
 * which is then set in the orderNumber state to be displayed in the UI.
 * @memberof module:Checkout
 */
  const fetchOrderNumber = () => {
    axios
      .get(`http://localhost:3001/read/ordernumber`)
      .then(response => {
        setOrderNumber(response.data);
      })
      .catch(error => {
        console.error("Error fetching order number: ", error);
      })
  };


  /**
 * Fetches a list of items that are currently out of stock from the backend.
 * This function makes two GET requests: one for regular out of stock items and another
 * for seasonal items that are out of stock. It updates the outOfStockNames state
 * which is used to filter available items in the UI.
 * @memberof module:Checkout
 */
  const fetchOutOfStockItems = () => {
    let nameData = [];
    axios
      .get(`http://localhost:3001/order/outofstockitems`)
      .then(response => {
        for (let i = 0; i < response.data.length; i++) {
          nameData.push(response.data[i].itemname);
        }
        axios
          .get(`http://localhost:3001/order/outofstockseasonals`)
          .then(response => {
            for (let i = 0; i < response.data.length; i++) {
              nameData.push(response.data[i].itemname);
            }
            setOutOfStockNames(prevData => [...prevData, ...nameData]);
          })
          .catch(error => {
            console.error("Error fetching out of stock seasonal items: ", error);
          })
      })
      .catch(error => {
        console.error("Error fetching out of stock items: ", error);
      })
  }


  /**
 * Fetches dietary restricted items from the backend.
 * This function makes separate GET requests for vegan, gluten-free, and peanut-free items,
 * both regular and seasonal. It updates the corresponding states which are used to
 * filter items displayed in the UI according to dietary restrictions.
 * @memberof module:Checkout
 */
  const fetchDietaryRestrictions = () => {
    axios
      .get(`http://localhost:3001/order/dietary/veganitems`)
      .then(response => {
        let veganData = [];
        for (let i = 0; i < response.data.length; i++) {
          veganData.push(response.data[i].itemname);
        }
        setVeganItems(veganData);
        axios
          .get(`http://localhost:3001/order/dietary/veganseasonals`)
          .then(response => {
            let veganData = [];
            for (let i = 0; i < response.data.length; i++) {
              veganData.push(response.data[i].itemname);
            }
            setVeganSeasonals(veganData);
            axios
              .get(`http://localhost:3001/order/dietary/glutenitems`)
              .then(response => {
                let glutenData = [];
                for (let i = 0; i < response.data.length; i++) {
                  glutenData.push(response.data[i].itemname);
                }
                setGlutenItems(glutenData);
                axios
                  .get(`http://localhost:3001/order/dietary/glutenseasonals`)
                  .then(response => {
                    let glutenData = [];
                    for (let i = 0; i < response.data.length; i++) {
                      glutenData.push(response.data[i].itemname);
                    }
                    setGlutenSeasonals(glutenData);
                    axios
                      .get(`http://localhost:3001/order/dietary/peanutitems`)
                      .then(response => {
                        let peanutData = [];
                        for (let i = 0; i < response.data.length; i++) {
                          peanutData.push(response.data[i].itemname);
                        }
                        setPeanutItems(peanutData);
                        axios
                          .get(`http://localhost:3001/order/dietary/peanutseasonals`)
                          .then(response => {
                            let peanutData = [];
                            for (let i = 0; i < response.data.length; i++) {
                              peanutData.push(response.data[i].itemname);
                            }
                            setPeanutSeasonals(peanutData);
                          })
                          .catch(error => {
                            console.error("Error fetching peanut seasonal items: ", error);
                          })
                      })
                      .catch(error => {
                        console.error("Error fetching peanut items: ", error);
                      })
                  })
                  .catch(error => {
                    console.error("Error fetching gluten seasonal items: ", error);
                  })
              })
              .catch(error => {
                console.error("Error fetching gluten items: ", error);
              })
          })
          .catch(error => {
            console.error("Error fetching vegan seasonal items: ", error);
          })
      })
      .catch(error => {
        console.error("Error fetching vegan items: ", error);
      });
  }

  /**
 * Fetches categories and filters them based on the outOfStockNames state.
 * This function is expected to make a GET request to fetch all items and seasonal items,
 * filter them against the out of stock list, and update the category-specific states
 * for rendering in the UI.
 * @memberof module:Checkout
 */
  const fetchCategories = () => {
    axios
      .get(`http://localhost:3001/read/items`)
      .then(response => {
        const filteredData = response.data.filter((item) => !outOfStockNames.includes(item.itemname));
        setRegularItemCategory(filteredData.map(item => ({ ...item, count: 0, type: 'regular' })));
        axios
          .get(`http://localhost:3001/read/seasonalitems`)
          .then(response => {
            const today_date = new Date();
            const today = today_date.toISOString().split('T')[0];
            const filteredData2 = response.data.filter((item) => item.startdate <= today && item.enddate >= today);
            setSeasonalCategory(filteredData2.filter((item) => !outOfStockNames.includes(item.itemname)).map((item) => ({...item, count: 0, type: 'seasonal'})));
          })
          .catch(error => {
            console.error("Error fetching seasonal items: ", error);
          });
      })
      .catch(error => {
        console.error("Error fetching items: ", error);
      });

    setComboCategory([]);
    setBurgerCategory([]);
    setSandwichCategory([]);
    setSaladCategory([]);
    setSideCategory([]);
    setShakeCategory([]);
    setDrinkCategory([]);

    for (const item of regularItemCategory) {
      if (item.category === 'Combo') comboCategory.push(item);
      if (item.category === 'Burger') burgerCategory.push(item);
      if (item.category === 'Sandwich') sandwichCategory.push(item);
      if (item.category === 'Salad') saladCategory.push(item);
      if (item.category === 'Side') sideCategory.push(item);
      if (item.category === 'Shake') shakeCategory.push(item);
      if (item.category === 'Drink') drinkCategory.push(item);
    }
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button className="cancel-button" onClick={handleCancel}>Cancel Order</button>
        <img src={logo} alt="Rev's American Grill" className="logo" />
        <button className="complete-order-button" onClick={handleCompleteOrder}>Complete Order</button>
      </header>
      <img
        src={colorblindIcon}
        alt="Colorblind Mode"
        className="checkout-colorblind-toggle"
        onClick={toggleColorBlindMode}
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
      />

      <img
        src={textSizeIcon}
        alt="Increase Text Size"
        className="checkout-text-size-toggle"
        onClick={toggleTextSize}
      />
      <CartPanel isOpen={showCart} closeCart={handleCloseCart} />
      {showModal && (
        <div className="checkout-modal">
          <div className="checkout-modal-content">
            <p>Are you sure you want to cancel your order?</p>
            <div className="checkout-button-container">
              <button onClick={handleConfirm} className="checkout-modal-button">Yes</button>
              <button onClick={handleClose} className="checkout-modal-button">No</button>
            </div>
          </div>
        </div>
      )}
      <main className="checkout-main">
        <div className="category-grid">
          {categories.map(category => (
            <CategoryCard
              key={category.name}
              categoryName={category.name}
              imageSrc={category.image}
              onClick={() => { fetchCategories(); fetchDietaryRestrictions(); handleCategoryClick(category.subcategories.flat()); }}
              tabIndex={0} // Make the cards focusable
            />
          ))}
        </div>
      </main>
      <SubcategoryModal
        subcategories={selectedSubcategories}
        isOpen={showSubcategoryModal}
        onClose={() => setShowSubcategoryModal(false)}
        veganItems={veganItems}
        veganSeasonals={veganSeasonals}
        glutenItems={glutenItems}
        glutenSeasonals={glutenSeasonals}
        peanutItems={peanutItems}
        peanutSeasonals={peanutSeasonals}
      />
      <footer className="checkout-footer"></footer>
      <div className="order-number">Order #{orderNumber}</div>
    </div>
  );
}

export default Checkout;
