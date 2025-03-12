import React, { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../const";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import "../css/ManagerComponents/manager.css";
import { useRoleRequired } from '../components/utility';
import colorblindIcon from "../images/red-green.png";
import { Link } from 'react-router-dom';
import textSizeIcon from "../images/text-size-icon.png";

/**
 * Manager GUI component for managing resources.
 * This component provides a graphical interface for managing various resources in the system.
 * @returns {JSX.Element} The JSX element representing the ManagerGUI component.
 * @module ManagerGUI
 */
const ManagerGUI = () => {
  //Role authentication
  useRoleRequired(['admin', 'manager'], '/');


  /**
   * Generates and downloads a PDF report containing information about excess stock of ingredients.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const downloadExcessPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Ingredient Name', 'Current Stock', 'Initial Stock']],
      body: excessReportNums.map(ingredient => [
        ingredient.ingredientname,
        ingredient.currentstock,
        ingredient.initialstock,
      ]),
    });
    doc.save('excess-report.pdf');
  };

  /**
   * Generates and downloads a PDF report containing information about trending items and their frequency of being sold together.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const downloadTrendingPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Item Number 1', 'Item Number 2', 'Amount Sold Together']],
      body: TrendingReportNums.map(pair => [
        pair.itemname1,
        pair.itemname2,
        pair.frequency.toString(),
      ]),
    });
    doc.save('trending-report.pdf');
  };

  /**
   * Generates and downloads a PDF report containing information about the total usage of ingredients in products.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const downloadProductUsagePdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Ingredient ID', 'Ingredient Name', 'Total Used']],
      body: productUsageIng.map(ingredient => [
        ingredient.ingredientid.toString(),
        ingredient.ingredientname,
        ingredient.total_used.toString(),
      ]),
    });
    doc.save('product-usage-report.pdf');
  };

  /**
   * Generates and downloads a PDF report containing information about ingredients that need restocking.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const downloadRestockReportPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Ingredient ID', 'Ingredient Name', 'Initial Stock', 'Current Stock', 'Price Per Unit']],
      body: restockIngredients.map(ingredient => [
        ingredient.ingredientid.toString(),
        ingredient.ingredientname,
        ingredient.initialstock.toString(),
        ingredient.currentstock.toString(),
        ingredient.priceperunit.toString()
      ]),
    });
    doc.save('restock-report.pdf');
  };

  /**
   * Generates and downloads a PDF report containing information about sales.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const downloadSalesReportPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Item Name', 'Number Sold', 'Income Per Item']],
      body: salesReportNums.map(sale => [
        sale.itemname,
        sale.number_sold.toString(),
        sale.income.toString()
      ]),
    });
    doc.save('sales-report.pdf');
  };

  const [message, setMessage] = useState("");

  // States to manage the visibility of inventory management functions
  const [showInventoryButtons, setShowInventoryButtons] = useState(false);
  const [showViewIngredients, setShowViewIngredients] = useState(false);
  const [showUpdateIngredientForm, setShowUpdateIngredientForm] = useState(false);
  const [showAddIngredientForm, setShowAddIngredientForm] = useState(false);
  const [showDeleteIngredientForm, setShowDeleteIngredientForm] = useState(false);

  // States to manage restock report visibility
  const [showRestockButton, setShowRestockButton] = useState(false);
  const [showRestockReport, setShowRestockReport] = useState(false);
  // States to manage sales report visibility
  const [showSalesButton, setShowSalesButton] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  // States to manage excess report visibility
  const [showExcessButton, setshowExcessButton] = useState(false);
  const [showExcessReport, setshowExcessReport] = useState(false);
  // States to manage the trending report
  const [showTrendingButton, setshowTrendingButton] = useState(false);
  const [showTrendingReport, setshowTrendingReport] = useState(false);
  // States to manage menu visibility
  const [showProductButton, setShowProductButton] = useState(false);
  const [showProductChart, setShowProductChart] = useState(false);
  // States for handleAddIngredientQuery
  const [ingredientName_add, setIngredientName_add] = useState("");
  const [initialStock_add, setInitialStock_add] = useState("");
  const [currentStock_add, setCurrentStock_add] = useState("");
  const [pricePerUnit_add, setPricePerUnit_add] = useState("");

  // States to manage the visibility of menu management functions
  const [showMenuButtons, setShowMenuButtons] = useState(false);
  const [showViewItems, setShowViewItems] = useState(false);
  const [showUpdateItemForm, setShowUpdateItemForm] = useState(false);
  const [showViewIngredients_update, setShowViewIngredients_update] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showViewIngredients_add, setShowViewIngredients_add] = useState(false);
  const [showDeleteItemForm, setShowDeleteItemForm] = useState(false);

  // States to manage the visibility of seasonal management functions
  const [showSeasonalButtons, setShowSeasonalButtons] = useState(false);
  const [showViewSeasonals, setShowViewSeasonals] = useState(false);
  const [showUpdateSeasonalForm, setShowUpdateSeasonalForm] = useState(false);
  const [showAddSeasonalForm, setShowAddSeasonalForm] = useState(false);
  const [showDeleteSeasonalForm, setShowDeleteSeasonalForm] = useState(false);

  // States for handleUpdateIngredientQuery
  const [ingredientName_update, setIngredientName_update] = useState("");
  const [ingredientNewName_update, setIngredientNewName_update] = useState("");
  const [initialStock_update, setInitialStock_update] = useState("");
  const [currentStock_update, setCurrentStock_update] = useState("");
  const [pricePerUnit_update, setPricePerUnit_update] = useState("");

  // States for handleProductUsageQuery
  const [timestamp1_update, setTimestamp1_update] = useState("");
  const [timestamp2_update, setTimestamp2_update] = useState("");

  // States for handleDeleteIngredientQuery
  const [ingredientID_delete, setIngredientID_delete] = useState("");
  const [ingredientName_delete, setIngredientName_delete] = useState("");

  // States for pulling all ingredients/items/orders from the database
  const [ingredients, setIngredients] = useState([]);
  const [items, setItems] = useState([]);
  const [seasonals, setSeasonals] = useState([]);
  const [orders, setOrders] = useState([]);

  // State for pulling all restock ingredients from the database
  const [restockIngredients, setRestockIngredients] = useState([]);

  // States for pulling product usage chart
  const [productUsageIng, setProductUsageIng] = useState([]);

  // State for pulling sales report
  const [salesReportNums, setSalesReportNums] = useState();

  // State for pulling trending analysis
  const [TrendingReportNums, setTrendingReportNums] = useState();

  // States for pulling excess report nums
  const [excessReportNums, setexcessReportNums] = useState();

  const [clickedRows, setClickedRows] = useState([]);

  // States for pulling ingredients of an item from the database and highlighting a single row
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemIngredients, setItemIngredients] = useState([]);

  // States for handleUpdateItemQuery
  const [changedItemIngredients, setChangedItemIngredients] = useState([]);
  const [itemName_update, setItemName_update] = useState("");
  const [itemPrice_update, setItemPrice_update] = useState("");

  // States for handleAddItemQuery
  const [newItemIngredients, setNewItemIngredients] = useState([]);
  const [itemName_add, setItemName_add] = useState("");
  const [itemPrice_add, setItemPrice_add] = useState("");

  // States for handleDeleteItemQuery
  const [itemID_delete, setItemID_delete] = useState("");
  const [itemName_delete, setItemName_delete] = useState("");

  // States for pulling ingredients of a seasonal item from the database and highlighting a single row
  const [selectedSeasonal, setSelectedSeasonal] = useState(null);
  const [seasonalIngredients, setSeasonalIngredients] = useState([]);

  // States for handleUpdateSeasonalQuery
  const [changedSeasonalIngredients, setChangedSeasonalIngredients] = useState([]);
  const [seasonalName_update, setSeasonalName_update] = useState("");
  const [seasonalPrice_update, setSeasonalPrice_update] = useState("");
  const [startDate_update, setStartDate_update] = useState("");
  const [endDate_update, setEndDate_update] = useState("");

  // States for handleAddSeasonalQuery
  const [newSeasonalIngredients, setNewSeasonalIngredients] = useState([]);
  const [seasonalName_add, setSeasonalName_add] = useState("");
  const [seasonalPrice_add, setSeasonalPrice_add] = useState("");
  const [startDate_add, setStartDate_add] = useState("");
  const [endDate_add, setEndDate_add] = useState("");

  // States for handleDeleteSeasonalQuery
  const [seasonalID_delete, setSeasonalID_delete] = useState("");
  const [seasonalName_delete, setSeasonalName_delete] = useState("");

  // States for managing orders
  const [showOrderButtons, setShowOrderButtons] = useState(false);
  const [showViewOrders, setShowViewOrders] = useState(false);
  const [showUpdateOrderForm, setShowUpdateOrderForm] = useState(false);
  const [showDeleteOrderForm, setShowDeleteOrderForm] = useState(false);
  const [customerID_update, setCustomerID_update] = useState("");
  const [timeOrdered_update, setTimeOrdered_update] = useState("");
  const [weekNumber_update, setWeekNumber_update] = useState("");
  const [status_update, setStatus_update] = useState("");
  const [customerID_delete, setCustomerID_delete] = useState("");
  const [numOrders, setNumOrders] = useState("");
  const [numOrdersChanged, setNumOrdersChanged] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  // States for managing items
  const [newName_update, setNewName_update] = useState("");
  const [category_update, setCategory_update] = useState("");
  const [calories_update, setCalories_update] = useState("");
  const [vegan_update, setVegan_update] = useState("");
  const [gluten_update, setGluten_update] = useState("");
  const [peanut_update, setPeanut_update] = useState("");
  const [category_add, setCategory_add] = useState("");
  const [calories_add, setCalories_add] = useState("");
  const [vegan_add, setVegan_add] = useState("");
  const [gluten_add, setGluten_add] = useState("");
  const [peanut_add, setPeanut_add] = useState("");

  // States for manging seasonal items
  const [seasonal_newName_update, setSeasonal_NewName_update] = useState("");
  const [seasonal_calories_update, setSeasonal_Calories_update] = useState("");
  const [seasonal_vegan_update, setSeasonal_Vegan_update] = useState("");
  const [seasonal_gluten_update, setSeasonal_Gluten_update] = useState("");
  const [seasonal_peanut_update, setSeasonal_Peanut_update] = useState("");
  const [seasonal_calories_add, setSeasonal_Calories_add] = useState("");
  const [seasonal_vegan_add, setSeasonal_Vegan_add] = useState("");
  const [seasonal_gluten_add, setSeasonal_Gluten_add] = useState("");
  const [seasonal_peanut_add, setSeasonal_Peanut_add] = useState("");

  // Accessibility states
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [textSizeIncreased, setTextSizeIncreased] = useState(false);

  /**
   * Toggles the color-blind mode of the application by adding or removing the 'colorblind-mode' class from the body.
   * @returns {void}
   * @memberof module:ManagerGUI
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
   * Toggles the increased text size mode of the application by adding or removing the 'text-size-increased' class from the body.
   * @returns {void}
   * @memberof module:ManagerGUI
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
   * Fetches ingredients, items, and seasonalitems from the server when the component mounts.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  useEffect(() => {
    fetchIngredients();
    fetchItems();
    fetchSeasonals();
  }, []);

  /**
   * Fetches the items of each order when the orders array is updated.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  useEffect(() => {
    if (orders.length > 0) {
      fetchOrderItems();
    }
  }, [orders]);

  /**
   * Fetches ingredients from the server when the component mounts.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchIngredients = () => {
    axios
      .get(`${HOST}/read/ingredients`)
      .then((response) => {
        setIngredients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching ingredients: ", error);
      });
  };

  /**
   * Fetches restock ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchRestockIngredients = () => {
    axios
      .get(`http://localhost:3001/manageingredients/restock`)
      .then((response) => {
        setRestockIngredients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching restock ingredients: ", error);
      });
  };

  /**
   * Fetches items from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchItems = () => {
    axios
      .get(`${HOST}/read/items`)
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching items: ", error);
      });
  };

  /**
   * Fetches ingredients of an item from the server.
   * @param {string} itemID - The ID of the item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchItemIngredients = (itemID) => {
    axios
      .get(`http://localhost:3001/managemenu/itemingredients/${itemID}`)
      .then((response) => {
        setItemIngredients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching item ingredients: ", error);
      });
  };

  /**
   * Fetches seasonal items from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchSeasonals = () => {
    axios
      .get(`${HOST}/read/seasonalitems`)
      .then((response) => {
        setSeasonals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching seasonal items: ", error);
      });
  };

  /**
   * Fetches ingredients of a seasonal item from the server.
   * @param {string} itemID - The ID of the seasonal item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchSeasonalIngredients = (itemID) => {
    axios
      .get(
        `http://localhost:3001/manageseasonal/seasonalitemingredients/${itemID}`
      )
      .then((response) => {
        setSeasonalIngredients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching seasonal item ingredients: ", error);
      });
  };

  /**
   * Fetches orders from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchOrders = () => {
    axios
      .get(`http://localhost:3001/manageorder/recentorders`, {
        params: { numOfOrders: numOrders }
      })
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("Error fetching orders: ", error);
      });
  };

  /**
   * Fetches items of orders from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchOrderItems = () => {
    axios
      .get(`http://localhost:3001/manageorder/orderitems`, {
        params: { orders: orders }
      })
      .then((response) => {
        setOrderItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching order items: ", error);
      });
  };

  /**
   * Formats the given timestamp into a string with the format 'YYYY-MM-DD HH:MM'.
   * @param {number} timestamp - The timestamp to format.
   * @returns {string} - The formatted date and time string.
   * @memberof module:ManagerGUI
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
   * Handles the UI state when the "Manage Inventory" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleManageInventory = () => {
    setShowInventoryButtons(!showInventoryButtons);
    setShowViewIngredients(false);
    setShowUpdateIngredientForm(false);
    setShowAddIngredientForm(false);

    setShowSalesButton(false);
    setShowRestockButton(false);
    setShowProductButton(false);

    setShowDeleteIngredientForm(false);

    setShowMenuButtons(false);
    setShowSeasonalButtons(false);
    setShowOrderButtons(false);

    setMessage("");
  };

  /**
   * Handles the UI state when the "View Ingredients" button is clicked.
   * Fetches ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewIngredients = () => {
    fetchIngredients();
    setClickedRows([]);
    setShowViewIngredients(!showViewIngredients);
  };

  /**
   * Handles sorting of data based on the specified column and type.
   * @param {string} column - The column to sort by.
   * @param {string} type - The type of data to sort.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleSort = (column, type) => {
    let data;
    let setData;
    switch (type) {
      case "ingredients":
        data = ingredients.slice();
        setData = setIngredients;
        break;
      case "items":
        data = items.slice();
        setData = setItems;
        break;
      case "seasonal":
        data = seasonals.slice();
        setData = setSeasonals;
        break;
      case "orders":
        data = orders.slice();
        setData = setOrders;
        break;
    }

    const sortedData = data.slice().sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });

    // Check if the current column is already sorted in ascending order
    const isAsc = JSON.stringify(sortedData) === JSON.stringify(data);

    // If the current column is already sorted in ascending order, reverse the order to sort in descending order
    setData(isAsc ? sortedData.reverse() : sortedData);
  };

  /**
   * Handles sorting of restock ingredients based on the specified column.
   * @param {string} column - The column to sort by.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleRestockSort = (column) => {
    const sortedRestockIngredients = [...restockIngredients].sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });

    // Check if the current column is already sorted in ascending order
    const isAsc =
      JSON.stringify(sortedRestockIngredients) ===
      JSON.stringify(restockIngredients);

    // If the current column is already sorted in ascending order, reverse the order to sort in descending order
    setIngredients(
      isAsc ? sortedRestockIngredients.reverse() : sortedRestockIngredients
    );
  };

  /**
   * Handles toggling the clicked state of a row.
   * @param {string} rowId - The ID of the clicked row.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleRowClick = (rowId) => {
    setClickedRows((prevClickedRows) => {
      if (prevClickedRows.includes(rowId)) {
        return prevClickedRows.filter((id) => id !== rowId);
      } else {
        return [...prevClickedRows, rowId];
      }
    });
  };

  /**
   * Handles the UI state when the "Update Ingredient" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateIngredient = () => {
    setShowUpdateIngredientForm(!showUpdateIngredientForm);
    setIngredientName_update("");
    setIngredientNewName_update("");
    setInitialStock_update("");
    setCurrentStock_update("");
    setPricePerUnit_update("");
  };

  /**
   * Handles updating an ingredient with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateIngredientQuery = () => {
    axios
      .post(`http://localhost:3001/manageingredients/update`, {
        ingredientName: ingredientName_update,
        newName: ingredientNewName_update,
        initialStock: initialStock_update,
        currentStock: currentStock_update,
        pricePerUnit: pricePerUnit_update,
      })
      .then((response) => {
        setMessage("Ingredient updated successfully!");
        fetchIngredients();
      })
      .catch((error) => {
        console.error("Error updating ingredient: ", error);
        setMessage("Error updating ingredient. Please try again.");
      });
  };

  /**
   * Fetches product usage data from the server based on provided timestamps.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchProductUsageIng = () => {
    axios
      .get(`http://localhost:3001/manageingredients/productusage`, {
        params: {
          timestamp1: timestamp1_update,
          timestamp2: timestamp2_update,
        },
      })
      .then((response) => {
        setProductUsageIng(response.data);
      })
      .catch((error) => {
        console.error("Error with grabbing query ", error);
      });
  };

  /**
   * Fetches trending item data from the server based on provided timestamps.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchTrendingNums = () => {
    axios
      .get(`http://localhost:3001/managemenu/sellstogether`, {
        params: {
          timestamp1: timestamp1_update,
          timestamp2: timestamp2_update,
        },
      })
      .then((response) => {
        setTrendingReportNums(response.data);
        console.log("trending report values", response.data);
      })
      .catch((error) => {
        console.error("Error with grabbing query ", error);
      });
  };

  /**
   * Fetches sales report data from the server based on provided timestamps.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchSalesReportNums = () => {
    axios
      .get(`http://localhost:3001/managemenu/salesreport`, {
        params: {
          timestamp1: timestamp1_update,
          timestamp2: timestamp2_update,
        },
      })
      .then((response) => {
        console.log("Sales report data: ", response.data);
        setSalesReportNums(response.data);
      })
      .catch((error) => {
        console.error("Error with grabbing query ", error);
        setSalesReportNums([]);
      });
  };

  /**
   * Fetches excess report data from the server based on provided timestamp.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const fetchExcessReportNums = () => {
    axios
      .get(`http://localhost:3001/managemenu/excessreport`, {
        params: {
          timestamp1: timestamp1_update
        },
      })
      .then((response) => {
        console.log("Excess report data: ", response.data);
        setexcessReportNums(response.data);
      })
      .catch((error) => {
        console.error("Error with grabbing query ", error);
        setexcessReportNums([]);
      });
  };

  /**
   * Handles the UI state when the "Add Ingredient" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddIngredient = () => {
    setShowAddIngredientForm(!showAddIngredientForm);
    setIngredientName_add("");
    setInitialStock_add("");
    setCurrentStock_add("");
    setPricePerUnit_add("");
  };

  /**
   * Handles adding a new ingredient with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddIngredientQuery = () => {
    axios
      .post(`http://localhost:3001/manageingredients/add`, {
        ingredientName: ingredientName_add,
        initialStock: initialStock_add,
        currentStock: currentStock_add,
        pricePerUnit: pricePerUnit_add,
      })
      .then((response) => {
        setMessage("Ingredient added successfully!");
        fetchIngredients();
      })
      .catch((error) => {
        console.error("Error adding ingredient: ", error);
        setMessage("Error adding ingredient. Please try again.");
      });
  };

  /**
   * Handles the UI state when the "Delete Ingredient" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteIngredient = () => {
    setShowDeleteIngredientForm(!showDeleteIngredientForm);
    setIngredientID_delete("");
    setIngredientName_delete("");
  };

  /**
   * Handles deleting an ingredient with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteIngredientQuery = () => {
    axios
      .post(`http://localhost:3001/manageingredients/delete`, {
        ingredientID: ingredientID_delete,
        ingredientName: ingredientName_delete,
      })
      .then((response) => {
        setMessage("Ingredient deleted successfully!");
        fetchIngredients();
      })
      .catch((error) => {
        console.error("Error deleting ingredient: ", error);
        setMessage("Error deleting ingredient. Please try again.");
      });
  };

  /**
   * Handles the UI state when the "Manage Menu" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleManageMenu = () => {
    setShowMenuButtons(!showMenuButtons);
    setShowViewItems(false);
    setShowUpdateItemForm(false);
    setShowViewIngredients_update(false);
    setShowAddItemForm(false);
    setShowViewIngredients_add(false);
    setShowDeleteItemForm(false);
    setShowInventoryButtons(false);
    setShowRestockButton(false);
    setShowSalesButton(false);
    setShowProductButton(false);
    setShowSeasonalButtons(false);
    setShowOrderButtons(false);
    setshowTrendingButton(false);
    setshowExcessButton(false);
    setMessage("");
  };

  /**
   * Handles the UI state when the "View Items" button is clicked.
   * Fetches items from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewItems = () => {
    fetchItems();
    setClickedRows([]);
    setShowViewItems(!showViewItems);
    setSelectedItem(null);
  };

  /**
   * Handles the click event of viewing item ingredients.
   * @param {string} itemID - The ID of the item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewItemIngredients = (itemID) => {
    if (selectedItem === itemID) setSelectedItem(null);
    else setSelectedItem(itemID);
    fetchItemIngredients(itemID);
  };

  /**
   * Handles the selection of ingredients when adding or updating an item.
   * @param {string} ingredientID - The ID of the ingredient.
   * @param {string} type - The type of operation ('add', 'add_s', 'update', 'update_s').
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleIngredientSelection = (ingredientID, type) => {
    if (type === "add") {
      setNewItemIngredients((prevSelectedIngredients) => {
        if (prevSelectedIngredients.includes(ingredientID)) {
          return prevSelectedIngredients.filter((id) => id !== ingredientID);
        } else {
          return [...prevSelectedIngredients, ingredientID];
        }
      });
    }
    if (type === "add_s") {
      setNewSeasonalIngredients((prevSelectedIngredients) => {
        if (prevSelectedIngredients.includes(ingredientID)) {
          return prevSelectedIngredients.filter((id) => id !== ingredientID);
        } else {
          return [...prevSelectedIngredients, ingredientID];
        }
      });
    }
    if (type === "update") {
      setChangedItemIngredients((prevSelectedIngredients) => {
        if (prevSelectedIngredients.includes(ingredientID)) {
          return prevSelectedIngredients.filter((id) => id !== ingredientID);
        } else {
          return [...prevSelectedIngredients, ingredientID];
        }
      });
    }
    if (type === "update_s") {
      setChangedSeasonalIngredients((prevSelectedIngredients) => {
        if (prevSelectedIngredients.includes(ingredientID)) {
          return prevSelectedIngredients.filter((id) => id !== ingredientID);
        } else {
          return [...prevSelectedIngredients, ingredientID];
        }
      });
    }
  };

  /**
   * Handles the UI state when viewing ingredients for item update.
   * Fetches ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewIngredients_update = () => {
    fetchIngredients();
    setChangedItemIngredients([]);
    setShowViewIngredients_update(!showViewIngredients_update);
  };

  /**
   * Handles the UI state when updating an item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateItem = () => {
    handleViewIngredients_update();
    setShowUpdateItemForm(!showUpdateItemForm);
    setItemName_update("");
    setItemPrice_update("");
    setNewName_update("");
    setCategory_update("");
    setCalories_update("");
    setVegan_update("");
    setGluten_update("");
    setPeanut_update("");
  };

  /**
   * Handles updating an item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateItemQuery = () => {
    axios
      .post(`http://localhost:3001/managemenu/update`, {
        itemName: itemName_update,
        newName: newName_update,
        itemPrice: itemPrice_update,
        category: category_update,
        calories: calories_update,
        vegan: vegan_update,
        gluten: gluten_update,
        peanut: peanut_update,
        changedItemIngredients: changedItemIngredients
      })
      .then((response) => {
        setMessage("Item updated successfully!");
        fetchItems();
      })
      .catch((error) => {
        console.error("Error updating item: ", error);
        setMessage("Error updating item. Please try again.");
      });
  };

  /**
   * Handles the UI state when viewing ingredients for item addition.
   * Fetches ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewIngredients_add = () => {
    fetchIngredients();
    setNewItemIngredients([]);
    setShowViewIngredients_add(!showViewIngredients_add);
  };

  /**
   * Handles the UI state when adding an item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddItem = () => {
    handleViewIngredients_add();
    setShowAddItemForm(!showAddItemForm);
    setItemName_add("");
    setItemPrice_add("");
    setCategory_add("");
    setCalories_add("");
    setVegan_add("");
    setGluten_add("");
    setPeanut_add("");
  };

  /**
   * Handles adding an item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddItemQuery = () => {
    axios
      .post(`http://localhost:3001/managemenu/add`, {
        itemName: itemName_add,
        itemPrice: itemPrice_add,
        category: category_add,
        calories: calories_add,
        vegan: vegan_add,
        gluten: gluten_add,
        peanut: peanut_add,
        newItemIngredients: newItemIngredients,
      })
      .then((response) => {
        setMessage("Item added successfully!");
        fetchItems();
      })
      .catch((error) => {
        console.error("Error adding item: ", error);
        setMessage("Error adding item. Please try again.");
      });
  };

  /**
   * Handles the UI state when the "Delete Item" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteItem = () => {
    setShowDeleteItemForm(!showDeleteItemForm);
    setItemID_delete("");
    setItemName_delete("");
  };

  /**
   * Handles deleting an item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteItemQuery = () => {
    axios
      .post(`http://localhost:3001/managemenu/delete`, {
        itemID: itemID_delete,
        itemName: itemName_delete,
      })
      .then((response) => {
        setMessage("Item deleted successfully!");
        fetchItems();
      })
      .catch((error) => {
        console.error("Error deleting item: ", error);
        setMessage("Error deleting item. Please try again.");
      });
  };

  /**
   * Handles the UI state when the "Manage Seasonal" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleManageSeasonal = () => {
    setShowSeasonalButtons(!showSeasonalButtons);
    setShowViewSeasonals(false);
    setShowUpdateSeasonalForm(false);
    setShowViewIngredients_update(false);
    setShowAddSeasonalForm(false);
    setShowViewIngredients_add(false);
    setShowDeleteSeasonalForm(false);
    setshowTrendingButton(false);
    setShowInventoryButtons(false);
    setShowMenuButtons(false);
    setShowOrderButtons(false);
    setShowProductButton(false);
    setshowExcessButton(false);
    setMessage("");
  };

  /**
   * Handles the UI state when the "View Seasonals" button is clicked.
   * Fetches seasonal items from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewSeasonals = () => {
    fetchSeasonals();
    setClickedRows([]);
    setShowViewSeasonals(!showViewSeasonals);
    setSelectedSeasonal(null);
  };

  /**
   * Handles the click event of viewing seasonal item ingredients.
   * @param {string} itemID - The ID of the seasonal item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewSeasonalIngredients = (itemID) => {
    if (selectedSeasonal === itemID) setSelectedSeasonal(null);
    else setSelectedSeasonal(itemID);
    fetchSeasonalIngredients(itemID);
  };

  /**
   * Handles the UI state when viewing ingredients for seasonal item update.
   * Fetches ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewSeasonalIngredients_update = () => {
    fetchIngredients();
    setChangedSeasonalIngredients([]);
    setShowViewIngredients_update(!showViewIngredients_update);
  };

  /**
   * Handles the UI state when updating a seasonal item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateSeasonal = () => {
    handleViewSeasonalIngredients_update();
    setShowUpdateSeasonalForm(!showUpdateSeasonalForm);
    setSeasonalName_update("");
    setSeasonalPrice_update("");
    setStartDate_update("");
    setEndDate_update("");
    setSeasonal_NewName_update("");
    setSeasonal_Calories_update("");
    setSeasonal_Vegan_update("");
    setSeasonal_Gluten_update("");
    setSeasonal_Peanut_update("");
  };

  /**
   * Handles updating a seasonal item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateSeasonalQuery = () => {
    axios
      .post(`http://localhost:3001/manageseasonal/update`, {
        itemName: seasonalName_update,
        newName: seasonal_newName_update,
        itemPrice: seasonalPrice_update,
        startDate: startDate_update,
        endDate: endDate_update,
        calories: seasonal_calories_update,
        vegan: seasonal_vegan_update,
        gluten: seasonal_gluten_update,
        peanut: seasonal_peanut_update,
        changedSeasonalIngredients: changedSeasonalIngredients,
      })
      .then((response) => {
        setMessage("Seasonal item updated successfully!");
        fetchSeasonals();
      })
      .catch((error) => {
        console.error("Error updating seasonal item: ", error);
        setMessage("Error updating seasonal item. Please try again.");
      });
  };

  /**
   * Handles the UI state when viewing ingredients for seasonal item addition.
   * Fetches ingredients from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewSeasonalIngredients_add = () => {
    fetchIngredients();
    setNewSeasonalIngredients([]);
    setShowViewIngredients_add(!showViewIngredients_add);
  };

  /**
   * Handles the UI state when adding a seasonal item.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddSeasonal = () => {
    handleViewSeasonalIngredients_add();
    setShowAddSeasonalForm(!showAddSeasonalForm);
    setSeasonalName_add("");
    setSeasonalPrice_add("");
    setStartDate_add("");
    setEndDate_add("");
    setSeasonal_Calories_add("");
    setSeasonal_Vegan_add("");
    setSeasonal_Gluten_add("");
    setSeasonal_Peanut_add("");
  };

  /**
   * Handles adding a seasonal item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleAddSeasonalQuery = () => {
    axios
      .post(`http://localhost:3001/manageseasonal/add`, {
        itemName: seasonalName_add,
        itemPrice: seasonalPrice_add,
        startDate: startDate_add,
        endDate: endDate_add,
        calories: seasonal_calories_add,
        vegan: seasonal_vegan_add,
        gluten: seasonal_gluten_add,
        peanut: seasonal_peanut_add,
        newSeasonalIngredients: newSeasonalIngredients,
      })
      .then((response) => {
        setMessage("Seasonal item added successfully!");
        fetchSeasonals();
      })
      .catch((error) => {
        console.error("Error adding seasonal item: ", error);
        setMessage("Error adding seasonal item. Please try again");
      });
  };

  /**
   * Handles the UI state when the "Delete Seasonal" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteSeasonal = () => {
    setShowDeleteSeasonalForm(!showDeleteSeasonalForm);
    setSeasonalName_delete("");
    setSeasonalID_delete("");
  };

  /**
   * Handles deleting a seasonal item with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteSeasonalQuery = () => {
    axios
      .post(`http://localhost:3001/manageseasonal/delete`, {
        seasonalID: seasonalID_delete,
        itemName: seasonalName_delete
      })
      .then((response) => {
        setMessage("Seasonal item deleted successfully!");
        fetchSeasonals();
      })
      .catch((error) => {
        console.error("Error deleting seasonal item: ", error);
        setMessage("Error deleting item. Please try again");
      });
  };

  /**
   * Handles the UI state when the "Manage Orders" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleManageOrders = () => {
    setShowOrderButtons(!showOrderButtons);
    setShowViewOrders(true);
    setShowUpdateOrderForm(false);
    setShowDeleteOrderForm(false);
    setshowExcessButton(false);
    setShowRestockButton(false);
    setShowSalesButton(false);
    setShowProductButton(false);
    setshowTrendingButton(false);
    setShowInventoryButtons(false);
    setShowMenuButtons(false);
    setShowSeasonalButtons(false);

    setMessage("");
  };

  /**
   * Handles the UI state when the "View Orders" button is clicked.
   * Fetches orders from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewOrders = () => {
    fetchOrders();
    setClickedRows([]);
    if (!numOrdersChanged) setShowViewOrders(!showViewOrders);
    setNumOrdersChanged(false);
  };

  /**
   * Handles the UI state when the "Update Order" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateOrder = () => {
    setShowUpdateOrderForm(!showUpdateOrderForm);
    setCustomerID_update("");
    setTimeOrdered_update("");
    setWeekNumber_update("");
    setStatus_update("");
  };

  /**
   * Handles updating an order with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleUpdateOrderQuery = () => {
    axios
      .post("http://localhost:3001/manageorder/update", {
        customerID: customerID_update,
        timeOrdered: timeOrdered_update,
        weekNumber: weekNumber_update,
        status: status_update,
      })
      .then((response) => {
        setMessage("Order updated successfully!");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Error updating order: ", error);
        setMessage("Error updating order. Please try again");
      });
  };

  /**
   * Handles the UI state when the "Delete Order" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteOrder = () => {
    setShowDeleteOrderForm(!showDeleteOrderForm);
    setCustomerID_delete("");
  };

  /**
   * Handles deleting an order with the provided information.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleDeleteOrderQuery = () => {
    axios
      .post(`http://localhost:3001/manageorder/delete`, {
        customerID: customerID_delete,
      })
      .then((response) => {
        setMessage("Order deleted successfully!");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Error deleting order: ", error);
        setMessage("Error deleting order. Please try again");
      });
  };

  /**
   * Handles the UI state when the "Product Usage" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleProductUsage = () => {
    setShowInventoryButtons(false);
    setshowExcessButton(false);
    setShowRestockButton(false);
    setShowSalesButton(false);
    setShowProductButton(!showProductButton);
    setshowTrendingButton(false);
    setShowMenuButtons(false);
  };

  /**
   * Handles the UI state when viewing product usage.
   * Fetches product usage data from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewProductUsage = () => {
    fetchProductUsageIng();
    setClickedRows([]);
    setShowProductChart(!showProductChart);
  };

  /**
   * Handles the UI state when the "Restock" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleRestock = () => {
    setShowRestockButton(!showRestockButton);
    setShowInventoryButtons(false);
    setShowSalesButton(false);
    setShowProductButton(false);
    setshowExcessButton(false);
    setShowMenuButtons(false);
    setshowTrendingButton(false);
  };

  /**
   * Handles the UI state when viewing restock report.
   * Fetches restock report data from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewRestock = () => {
    fetchRestockIngredients();
    setClickedRows([]);
    setShowRestockReport(!showRestockReport);
  };

  /**
   * Handles the UI state when the "Sales" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleSales = () => {
    setShowSalesButton(!showSalesButton);
    setshowExcessButton(false);
    setShowInventoryButtons(false);
    setShowRestockButton(false);
    setShowProductButton(false);
    setShowMenuButtons(false);
    setshowTrendingButton(false);
  }

  /**
   * Handles the UI state when viewing sales report.
   * Fetches sales report data from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewSales = () => {
    fetchSalesReportNums();
    setClickedRows([]);
    setShowSalesReport(!showSalesReport);
  };

  /**
   * Handles the UI state when the "Excess" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleExcess = () => {
    setshowExcessButton(!showExcessButton);
    setShowInventoryButtons(false);
    setShowRestockButton(false);
    setShowSalesButton(false);
    setShowProductButton(false);
    setShowMenuButtons(false);
    setshowTrendingButton(false);
  };

  /**
   * Handles the UI state when viewing excess report.
   * Fetches excess report data from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewExcess = () => {
    fetchExcessReportNums();
    setClickedRows([]);
    setshowExcessReport(!showExcessReport);
  };

  /**
   * Handles the UI state when the "Trending" button is clicked.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleTrending = () => {
    setShowInventoryButtons(false);
    setShowRestockButton(false);
    setShowSalesButton(false);
    setShowProductButton(false);
    setShowMenuButtons(false);
    setshowExcessButton(false);
    setshowTrendingButton(!showTrendingButton);
  };

  /**
   * Handles the UI state when viewing trending report.
   * Fetches trending report data from the server.
   * @returns {void}
   * @memberof module:ManagerGUI
   */
  const handleViewTrending = () => {
    fetchTrendingNums();
    setClickedRows([]);
    setshowTrendingReport(!showTrendingReport);
  };

  /**
   * Represents the Manager GUI component.
   * This component renders a sidebar with various management options.
   * It includes buttons for managing inventory, menu, seasonal items, orders, product usage, restocking, sales, and excess reports.
   * Additionally, it provides toggles for colorblind mode and text size adjustment.
   * @returns {JSX.Element} The JSX element representing the Manager GUI.
   * @memberof module:ManagerGUI
   */
  return (
    <div className="manager-gui">
      <div className="sidebar">
        <div className="logo">
          <Link to="/" className="dashboard-link">
            <h2>Dashboard</h2>
          </Link>
        </div>
        <img
          src={colorblindIcon}
          alt="Colorblind Mode"
          className="manager-colorblind-toggle"
          onClick={toggleColorBlindMode}
        />

        <img
          src={textSizeIcon}
          alt="Increase Text Size"
          className="manager-text-size-toggle"
          onClick={toggleTextSize}
        />

        <div className="buttons-container">
          <button className="sidebar-button" onClick={handleManageInventory}>
            Manage Inventory
          </button>
          <button className="sidebar-button" onClick={handleManageMenu}>
            Manage Menu
          </button>
          <button className="sidebar-button" onClick={handleManageSeasonal}>
            Manage Seasonal Menu
          </button>
          <button className="sidebar-button" onClick={handleManageOrders}>
            Manage Orders
          </button>
          <button className="sidebar-button" onClick={handleProductUsage}>
            Product Usage
          </button>
          <button className="sidebar-button" onClick={handleRestock}>
            Restock Report
          </button>
          <button className="sidebar-button" onClick={handleSales}>
            Sales Report
          </button>
          <button className="sidebar-button" onClick={handleExcess}>
            Excess Report
          </button>
          <button className="sidebar-button" onClick={handleTrending}>
            Trending
          </button>
        </div>
      </div>
      <div className="content">
        <div className="header">
          {/* Additional header content can be added here */}
        </div>
        <div className="main">
        <h5>Welcome to the Manager GUI</h5>
          <p>{message}</p>
          {/* Render excess report form if showexcessreport is true */}
          {showExcessButton && (
            <div className="excess-form">
              <input
                type="text"
                placeholder="Time 1 (YYYY-MM-DD)"
                value={timestamp1_update}
                onChange={(e) => setTimestamp1_update(e.target.value)}
              />
              <button
                className="sidebar-button"
                onClick={handleViewExcess}>
                View Excess Report
              </button>
              <button className="sidebar-button" onClick={downloadExcessPdf}>
                Download PDF
              </button>
              {showExcessReport && (
                <table className="excessreport-table">
                  <thead>
                    <tr>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Ingredient Name
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Current Stock
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Initial Stock
                      </button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {excessReportNums && excessReportNums.length > 0 ? (
                      excessReportNums.map((ingredient, index) => (
                        <tr key={index}
                          style={{
                            backgroundColor: clickedRows.includes(ingredient.itemname)
                              ? "gray" : "black",
                          }}>
                          <td>{ingredient.ingredientname}</td>
                          <td>{ingredient.currentstock}</td>
                          <td>{ingredient.initialstock}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">No sales data available.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {/* Render sales report form if showsalesreport is true */}
          {showTrendingButton && (
            <div className="trending-form">
              <input
                type="text"
                placeholder="Time 1 (YYYY-MM-DD)"
                value={timestamp1_update}
                onChange={(e) => setTimestamp1_update(e.target.value)}
              />
              <input
                type="text"
                placeholder="Time 2 (YYYY-MM-DD)"
                value={timestamp2_update}
                onChange={(e) => setTimestamp2_update(e.target.value)}
              />
              <button
                className="sidebar-button"
                onClick={handleViewTrending}>
                View What Sells Together
              </button>
              <button className="sidebar-button" onClick={downloadTrendingPdf}>
                Download PDF
              </button>
              {showTrendingReport && (
                <table className="trendingreport-table">
                  <thead>
                    <tr>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Item Number 1
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Item Number 2
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Amount Sold Together
                      </button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/*Change this form to update query stuff*/}
                    {TrendingReportNums && TrendingReportNums.length > 0 ? (
                      TrendingReportNums.map((pair, index) => (
                        <tr key={index}
                          style={{
                            backgroundColor: clickedRows.includes(pair.ItemName1)
                              ? "gray" : "black",
                          }}>
                          <td>{pair.itemname1}</td>
                          <td>{pair.itemname2}</td>
                          <td>{pair.frequency}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">No sales data available.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {/* Render sales report form if showsalesreport is true */}
          {showSalesButton && (
            <div className="sales-table">
              <input
                type="text"
                placeholder="Time 1 (YYYY-MM-DD)"
                value={timestamp1_update}
                onChange={(e) => setTimestamp1_update(e.target.value)}
              />
              <input
                type="text"
                placeholder="Time 2 (YYYY-MM-DD)"
                value={timestamp2_update}
                onChange={(e) => setTimestamp2_update(e.target.value)}
              />
              <button
                className="sidebar-button"
                onClick={handleViewSales}>
                View Sales Report
              </button>
              <button className="sidebar-button" onClick={downloadSalesReportPdf}>
                Download PDF
              </button>
              {showSalesReport && (
                <table className="salesreport-table">
                  <thead>
                    <tr>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Item Name
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Number Sold
                      </button></th>
                      <th><button
                        onClick={() => handleRestockSort("ingredientid")}>
                        Income Per Item
                      </button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReportNums && salesReportNums.length > 0 ? (
                      salesReportNums.map((sale, index) => (
                        <tr key={index}
                          style={{
                            backgroundColor: clickedRows.includes(sale.itemname)
                              ? "gray" : "black",
                          }}>
                          <td>{sale.itemname}</td>
                          <td>{sale.number_sold}</td>
                          <td>{sale.income}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">No sales data available.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {/* Render inventory management buttons if showInventoryButtons is true */}
          {showRestockButton && (
            <div className="buttons-container">
              <button className="sidebar-button" onClick={handleViewRestock}>
                View Restock Report
              </button>
              <button className="sidebar-button" onClick={downloadRestockReportPdf}>
                Download PDF
              </button>
              {/* Render ingredients table only when the view all ingredients button is clicked*/}
              {showRestockReport && (
                <table className="restock-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleRestockSort("ingredientid")}>
                          Ingredient ID
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleRestockSort("ingredientname")}>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleRestockSort("initialstock")}>
                          Initial Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleRestockSort("currentstock")}>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleRestockSort("priceperunit")}>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map through ingredients and render each as a table row */}
                    {restockIngredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() => handleRowClick(ingredient.ingredientid)}
                        style={{
                          backgroundColor: clickedRows.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientid}</td>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.initialstock}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Render update ingredient form if showUpdateIngredientForm is true */}
          {showProductButton && (
            <div className="product-form">
              <input
                type="text"
                placeholder="Time 1 (YYYY-MM-DD)"
                value={timestamp1_update}
                onChange={(e) => setTimestamp1_update(e.target.value)}
              />
              <input
                type="text"
                placeholder="Time 2 (YYYY-MM-DD)"
                value={timestamp2_update}
                onChange={(e) => setTimestamp2_update(e.target.value)}
              />
              <button
                className="sidebar-button"
                onClick={handleViewProductUsage}>
                Create chart
              </button>
              <button className="sidebar-button" onClick={downloadProductUsagePdf}>
                Download PDF
              </button>
              {showProductChart && (
                <table className="productUsage-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleRestockSort("ingredientid")}>
                          Ingredient ID
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleRestockSort("ingredientname")}>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button onClick={() => handleRestockSort("COUNT(*)")}>
                          Total Used
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map through ingredients and render each as a table row */}
                    {productUsageIng.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() => handleRowClick(ingredient.ingredientid)}
                        style={{
                          backgroundColor: clickedRows.includes(
                            ingredient.total_used
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientid}</td>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.total_used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Render inventory management buttons if showInventoryButtons is true */}
          {showInventoryButtons && (
            <div className="buttons-container">
              <button
                className="sidebar-button"
                onClick={handleViewIngredients}>
                View All Ingredients
              </button>
              {showViewIngredients && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientid", "ingredients")
                          }>
                          Ingredient ID
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientname", "ingredients")
                          }>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("initialstock", "ingredients")
                          }>
                          Initial Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("currentstock", "ingredients")
                          }>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("priceperunit", "ingredients")
                          }>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() => handleRowClick(ingredient.ingredientid)}
                        style={{
                          backgroundColor: clickedRows.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientid}</td>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.initialstock}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                className="sidebar-button"
                onClick={handleUpdateIngredient}>
                Update Ingredient
              </button>
              {showUpdateIngredientForm && (
                <div className="update-ingredient-form">
                  <input
                    type="text"
                    placeholder="Ingredient Name (REQUIRED)"
                    value={ingredientName_update}
                    onChange={(e) => setIngredientName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="NEW Name"
                    value={ingredientNewName_update}
                    onChange={(e) => setIngredientNewName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Initial Stock"
                    value={initialStock_update}
                    onChange={(e) => setInitialStock_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Current Stock"
                    value={currentStock_update}
                    onChange={(e) => setCurrentStock_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Price Per Unit"
                    value={pricePerUnit_update}
                    onChange={(e) => setPricePerUnit_update(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleUpdateIngredientQuery}>
                    Update Ingredient
                  </button>
                </div>
              )}
              <button className="sidebar-button" onClick={handleAddIngredient}>
                Add Ingredient
              </button>
              {showAddIngredientForm && (
                <div className="add-ingredient-form">
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={ingredientName_add}
                    onChange={(e) => setIngredientName_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Initial Stock"
                    value={initialStock_add}
                    onChange={(e) => setInitialStock_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Current Stock"
                    value={currentStock_add}
                    onChange={(e) => setCurrentStock_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Price Per Unit"
                    value={pricePerUnit_add}
                    onChange={(e) => setPricePerUnit_add(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleAddIngredientQuery}>
                    Add Ingredient
                  </button>
                </div>
              )}
              <button
                className="sidebar-button"
                onClick={handleDeleteIngredient}>
                Delete Ingredient
              </button>
              {showDeleteIngredientForm && (
                <div className="delete-ingredient-form">
                  <input
                    type="text"
                    placeholder="Ingredient ID"
                    value={ingredientID_delete}
                    onChange={(e) => setIngredientID_delete(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={ingredientName_delete}
                    onChange={(e) => setIngredientName_delete(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleDeleteIngredientQuery}>
                    Delete Ingredient
                  </button>
                </div>
              )}
            </div>
          )}
          {showMenuButtons && (
            <div className="buttons-container">
              <button className="sidebar-button" onClick={handleViewItems}>
                View All Items
              </button>
              {showViewItems && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button onClick={() => handleSort("itemid", "items")}>
                          Item ID
                        </button>
                      </th>
                      <th>
                        <button onClick={() => handleSort("itemname", "items")}>
                          Item Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("itemprice", "items")}>
                          Item Price
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("category", "items")}>
                          Category
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("calories", "items")}>
                          Calories
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("vegan", "items")}>
                          Vegan
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("gluten", "items")}>
                          Gluten
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("peanut", "items")}>
                          Peanut
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.itemid}
                        onClick={() => handleViewItemIngredients(item.itemid)}
                        style={{
                          backgroundColor:
                            selectedItem === item.itemid ? "gray" : "black",
                        }}>
                        <td>{item.itemid}</td>
                        <td>{item.itemname}</td>
                        <td>{item.itemprice}</td>
                        <td>{item.category}</td>
                        <td>{item.calories}</td>
                        <td>{item.vegan ? 'Yes' : 'No'}</td>
                        <td>{item.gluten ? 'Yes' : 'No'}</td>
                        <td>{item.peanut ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedItem && (
                <div className="item-ingredients">
                  <h3>Ingredients for selected item: </h3>
                  <ul>
                    {itemIngredients.map((ingredient) => (
                      <li key={ingredient.ingredientid}>
                        {ingredient.ingredientname}: {ingredient.currentstock}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="sidebar-button" onClick={handleUpdateItem}>
                Update Item
              </button>
              {showUpdateItemForm && (
                <div className="update-item-form">
                  <input
                    type="text"
                    placeholder="Item Name (REQUIRED)"
                    value={itemName_update}
                    onChange={(e) => setItemName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="NEW Name"
                    value={newName_update}
                    onChange={(e) => setNewName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Price"
                    value={itemPrice_update}
                    onChange={(e) => setItemPrice_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={category_update}
                    onChange={(e) => setCategory_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Calories"
                    value={calories_update}
                    onChange={(e) => setCalories_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Vegan (Y/N)"
                    value={vegan_update}
                    onChange={(e) => setVegan_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Gluten (Y/N)"
                    value={gluten_update}
                    onChange={(e) => setGluten_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Peanut (Y/N)"
                    value={peanut_update}
                    onChange={(e) => setPeanut_update(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleUpdateItemQuery}>
                    Update Item
                  </button>
                </div>
              )}
              {showViewIngredients_update && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientname", "ingredients")
                          }>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("currentstock", "ingredients")
                          }>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("priceperunit", "ingredients")
                          }>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() =>
                          handleIngredientSelection(
                            ingredient.ingredientid,
                            "update"
                          )
                        }
                        style={{
                          backgroundColor: changedItemIngredients.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button className="sidebar-button" onClick={handleAddItem}>
                Add Item
              </button>
              {showAddItemForm && (
                <div className="add-item-form">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={itemName_add}
                    onChange={(e) => setItemName_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Price"
                    value={itemPrice_add}
                    onChange={(e) => setItemPrice_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={category_add}
                    onChange={(e) => setCategory_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Calories"
                    value={calories_add}
                    onChange={(e) => setCalories_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Vegan (Y/N)"
                    value={vegan_add}
                    onChange={(e) => setVegan_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Gluten (Y/N)"
                    value={gluten_add}
                    onChange={(e) => setGluten_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Peanut (Y/N)"
                    value={peanut_add}
                    onChange={(e) => setPeanut_add(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleAddItemQuery}>
                    Add Item
                  </button>
                </div>
              )}
              {showViewIngredients_add && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientname", "ingredients")
                          }>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("currentstock", "ingredients")
                          }>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("priceperunit", "ingredients")
                          }>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() =>
                          handleIngredientSelection(
                            ingredient.ingredientid,
                            "add"
                          )
                        }
                        style={{
                          backgroundColor: newItemIngredients.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button className="sidebar-button" onClick={handleDeleteItem}>
                Delete item
              </button>
              {showDeleteItemForm && (
                <div className="delete-item-form">
                  <input
                    type="text"
                    placeholder="Item ID"
                    value={itemID_delete}
                    onChange={(e) => setItemID_delete(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={itemName_delete}
                    onChange={(e) => setItemName_delete(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleDeleteItemQuery}>
                    Delete Item
                  </button>
                </div>
              )}
            </div>
          )}
          {showSeasonalButtons && (
            <div className="buttons-container">
              <button className="sidebar-button" onClick={handleViewSeasonals}>
                View Seasonal Items
              </button>
              {showViewSeasonals && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleSort("itemid", "seasonal")}>
                          Item ID
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("itemname", "seasonal")}>
                          Item Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("itemprice", "seasonal")}>
                          Item Price
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("startdate", "seasonal")}>
                          Start Date
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("enddate", "seasonal")}>
                          End Date
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("calories", "items")}>
                          Calories
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("vegan", "items")}>
                          Vegan
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("gluten", "items")}>
                          Gluten
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("peanut", "items")}>
                          Peanut
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonals.map((seasonal) => (
                      <tr
                        key={seasonal.seasonalid}
                        onClick={() =>
                          handleViewSeasonalIngredients(seasonal.seasonalid)
                        }
                        style={{
                          backgroundColor:
                            selectedSeasonal === seasonal.seasonalid
                              ? "gray"
                              : "black",
                        }}>
                        <td>{seasonal.seasonalid}</td>
                        <td>{seasonal.itemname}</td>
                        <td>{seasonal.itemprice}</td>
                        <td>{formatTime(seasonal.startdate)}</td>
                        <td>{formatTime(seasonal.enddate)}</td>
                        <td>{seasonal.calories}</td>
                        <td>{seasonal.vegan ? 'Yes' : 'No'}</td>
                        <td>{seasonal.gluten ? 'Yes' : 'No'}</td>
                        <td>{seasonal.peanut ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedSeasonal && (
                <div className="seasonal-ingredients">
                  <h3>Ingredients for selected item: </h3>
                  <ul>
                    {seasonalIngredients.map((ingredient) => (
                      <li key={ingredient.ingredientid}>
                        {ingredient.ingredientname}: {ingredient.currentstock}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="sidebar-button" onClick={handleUpdateSeasonal}>
                Update Seasonal Item
              </button>
              {showUpdateSeasonalForm && (
                <div className="update-seasonal-form">
                  <input
                    type="text"
                    placeholder="Item Name (REQUIRED)"
                    value={seasonalName_update}
                    onChange={(e) => setSeasonalName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="NEW Name"
                    value={seasonal_newName_update}
                    onChange={(e) => setSeasonal_NewName_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Price"
                    value={seasonalPrice_update}
                    onChange={(e) => setSeasonalPrice_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Start Date (YYYY-MM-DD)"
                    value={startDate_update}
                    onChange={(e) => setStartDate_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="End Date (YYYY-MM-DD)"
                    value={endDate_update}
                    onChange={(e) => setEndDate_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Calories"
                    value={seasonal_calories_update}
                    onChange={(e) => setSeasonal_Calories_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Vegan (Y/N)"
                    value={seasonal_vegan_update}
                    onChange={(e) => setSeasonal_Vegan_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Gluten (Y/N)"
                    value={seasonal_gluten_update}
                    onChange={(e) => setSeasonal_Gluten_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Peanut (Y/N)"
                    value={seasonal_peanut_update}
                    onChange={(e) => setSeasonal_Peanut_update(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleUpdateSeasonalQuery}>
                    Update Seasonal Item
                  </button>
                </div>
              )}
              {showViewIngredients_update && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientname", "ingredients")
                          }>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("currentstock", "ingredients")
                          }>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("priceperunit", "ingredients")
                          }>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() =>
                          handleIngredientSelection(
                            ingredient.ingredientid,
                            "update_s"
                          )
                        }
                        style={{
                          backgroundColor: changedSeasonalIngredients.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button className="sidebar-button" onClick={handleAddSeasonal}>
                Add Seasonal Item
              </button>
              {showAddSeasonalForm && (
                <div className="add-seasonal-form">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={seasonalName_add}
                    onChange={(e) => setSeasonalName_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Price"
                    value={seasonalPrice_add}
                    onChange={(e) => setSeasonalPrice_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Start Date (YYYY-MM-DD)"
                    value={startDate_add}
                    onChange={(e) => setStartDate_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="End Date (YYYY-MM-DD)"
                    value={endDate_add}
                    onChange={(e) => setEndDate_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Calories"
                    value={seasonal_calories_add}
                    onChange={(e) => setSeasonal_Calories_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Vegan (Y/N)"
                    value={seasonal_vegan_add}
                    onChange={(e) => setSeasonal_Vegan_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Gluten (Y/N)"
                    value={seasonal_gluten_add}
                    onChange={(e) => setSeasonal_Gluten_add(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Peanut (Y/N)"
                    value={seasonal_peanut_add}
                    onChange={(e) => setSeasonal_Peanut_add(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleAddSeasonalQuery}>
                    Add Seasonal Item
                  </button>
                </div>
              )}
              {showViewIngredients_add && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("ingredientname", "ingredients")
                          }>
                          Ingredient Name
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("currentstock", "ingredients")
                          }>
                          Current Stock
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() =>
                            handleSort("priceperunit", "ingredients")
                          }>
                          Price Per Unit
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr
                        key={ingredient.ingredientid}
                        onClick={() =>
                          handleIngredientSelection(
                            ingredient.ingredientid,
                            "add_s"
                          )
                        }
                        style={{
                          backgroundColor: newSeasonalIngredients.includes(
                            ingredient.ingredientid
                          )
                            ? "gray"
                            : "black",
                        }}>
                        <td>{ingredient.ingredientname}</td>
                        <td>{ingredient.currentstock}</td>
                        <td>{ingredient.priceperunit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button className="sidebar-button" onClick={handleDeleteSeasonal}>
                Delete Seasonal Item
              </button>
              {showDeleteSeasonalForm && (
                <div className="delete-seasonal-form">
                  <input
                    type="text"
                    placeholder="Item ID"
                    value={seasonalID_delete}
                    onChange={(e) => setSeasonalID_delete(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={seasonalName_delete}
                    onChange={(e) => setSeasonalName_delete(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleDeleteSeasonalQuery}>
                    Delete Seasonal Item
                  </button>
                </div>
              )}
            </div>
          )}
          {showOrderButtons && (
            <div className="buttons-container">
              <button className="sidebar-button" onClick={handleUpdateOrder}>
                Update Order
              </button>
              {showUpdateOrderForm && (
                <div className="update-order-form">
                  <input
                    type="text"
                    placeholder="Order ID (REQUIRED)"
                    value={customerID_update}
                    onChange={(e) => setCustomerID_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Time Ordered"
                    value={timeOrdered_update}
                    onChange={(e) => setTimeOrdered_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Week Number"
                    value={weekNumber_update}
                    onChange={(e) => setWeekNumber_update(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Status"
                    value={status_update}
                    onChange={(e) => setStatus_update(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleUpdateOrderQuery}>
                    Update Order
                  </button>
                </div>
              )}
              <button className="sidebar-button" onClick={handleDeleteOrder}>
                Delete Order
              </button>
              {showDeleteOrderForm && (
                <div className="delete-order-form">
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={customerID_delete}
                    onChange={(e) => setCustomerID_delete(e.target.value)}
                  />
                  <button
                    className="sidebar-button"
                    onClick={handleDeleteOrderQuery}>
                    Delete Order
                  </button>
                </div>
              )}
              <div className="view-order-form">
                <input
                  type="text"
                  placeholder="Number of Orders"
                  value={numOrders}
                  onChange={(e) => { setNumOrders(e.target.value); setNumOrdersChanged(true); }}
                />
                <button className="sidebar-button" onClick={handleViewOrders}>
                  View Most Recent Orders
                </button>
              </div>
              {showViewOrders && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleSort("customerid", "orders")}>
                          Customer ID
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("timeordered", "orders")}>
                          Time Ordered
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("weeknumber", "orders")}>
                          Week Number
                        </button>
                      </th>
                      <th>
                        <button onClick={() => handleSort("status", "orders")}>
                          Status
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <>
                        <tr
                          key={order.customerid}
                          onClick={() => handleRowClick(order.customerid)}
                          style={{
                            backgroundColor: clickedRows.includes(order.customerid)
                              ? "gray"
                              : "black",
                          }}>
                          <td>{order.customerid}</td>
                          <td>{formatTime(order.timeordered)}</td>
                          <td>{order.weeknumber}</td>
                          <td>{order.status}</td>
                        </tr>
                        {orderItems
                          .filter((item) => item.customerid === order.customerid)
                          .map((item) => (
                            <tr
                              style={{
                                backgroundColor: "#3f312d",
                                border: 'none'
                              }}>
                              <td style={{ border: 'none' }}>{item.regular_item ? item.regular_item : item.seasonal_item}:</td>
                              <td style={{ border: 'none' }}>{item.item_quantity}</td>
                            </tr>
                          ))}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerGUI;
