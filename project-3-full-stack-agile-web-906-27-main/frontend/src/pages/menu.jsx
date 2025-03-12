import axios from "axios";
import React, { Component } from "react";
import { HOST } from "../const";
import "../css/MenuComponents/menu.css";
import { Link } from 'react-router-dom';
import logo from "../images/REVs LOGO.png";
import logo2 from "../images/RevTalking.png";


/**
 * The Menu component displays various menu items and allows cycling through different categories.
 * It fetches item data and weather information to enhance the user experience by suggesting items
 * based on the current weather conditions.
 */
class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weather: null,
      data: [],
      filteredData: [],
      outOfStockNames: [],
      currentListIndex: 0,
      itemLists: [
        {
          category: "Burgers and Sandwiches",
          items: [
            "Double Hamburger",
            "Bacon Cheeseburger",
            "Cheeseburger",
            "Veggieburger",
            "Chicken Sandwich",
            "BLT",
            "Grilled Chicken sandwich",
            "Spicy Chicken Sandwich",
          ],
        },
        {
          category: "Drinks",
          items: [
            "Coke",
            "Sprite",
            "Chocolate Shake",
            "Strawberry Shake",
            "Vanilla Shake",
          ],
        },
        {
          category: "Salads and Fries",
          items: [
            "Casear Salad",
            "Southwest Salad",
            "French Fries",
            "Garlic Fries",
            "Cheese fries",
          ],
        },
        { category: "Limited Time Offers", items: [] },
      ],
    };
  }

  /**
   * Called immediately after the component is mounted, setting the body class and
   * initializing data fetching and item cycling.
   */
  componentDidMount() {
    this.fetchData();
    this.fetchWeatherData();
    this.startInterval();
    document.body.classList.add("menu-body");
  }

  /**
  * Called immediately before the component is unmounted and destroyed, cleaning up interval
  * and removing body class.
  */
  componentWillUnmount() {
    clearInterval(this.interval);
    document.body.classList.remove("menu-body");
  }

  /**
  * Starts an interval to cycle through the menu item list every 7 seconds.
  */
  startInterval() {
    this.interval = setInterval(() => {
      this.cycleItemList();
    }, 7000); // Change interval before changing to next category. (7000 ms for demo, maybe 20000 for final)
  }

  /**
  * Cycles the current list index to display a new category from the item list.
  */
  cycleItemList() {
    const { itemLists, currentListIndex } = this.state;
    const nextIndex = (currentListIndex + 1) % itemLists.length;
    this.setState({ currentListIndex: nextIndex }, () => {
      this.filterData();
    });
  }

  /**
   * Fetches the current weather data from the OpenWeatherMap API.
   */
  fetchWeatherData = () => {
    const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=30.61280876442661&lon=-96.34112257794249&appid=REMOVED";

    axios
      .get(weatherApiUrl)
      .then((res) => {
        this.setState({ weather: res.data });
      })
      .catch((err) => {
        console.error("Error fetching weather data: ", err);
      });
  };

  /**
  * Fetches menu items from a backend service.
  */
  fetchData = () => {
    axios
      .get(`${HOST}/read/items`)
      .then((res) => {
        const regularItems = res.data;
        // Fetch seasonal items
        axios.get(`${HOST}/read/seasonalitems`).then((res) => {
          const today_date = new Date();
          const today = today_date.toISOString().split("T")[0];
          const seasonalItems = res.data.filter(
            (item) => item.startdate <= today && item.enddate >= today
          );
          const allItems = [...regularItems, ...seasonalItems];
          const filteredData = allItems.filter(
            (item) => !this.state.outOfStockNames.includes(item.itemname)
          );
          this.setState({
            data: filteredData.map((item) => ({ ...item, count: 0 })),
          }, () => {
            this.filterData();
          });
        });
      })
      .catch((err) => {
        console.error(err.response || err);
      });
  };

  /**
  * Filters the data based on the current category selection.
  */
  filterData = () => {
    const { data, itemLists, currentListIndex } = this.state;
    const currentCategory = itemLists[currentListIndex];
    let filteredData = [];

    if (currentCategory.category === "Limited Time Offers") {
      const allItems = itemLists.flatMap((category) => category.items);
      const itemsInOtherCategories = new Set(allItems);
      for (let item of data) {
        if (!itemsInOtherCategories.has(item.itemname)) {
          filteredData.push(item);
        }
      }
    } else {
      const itemList = currentCategory.items;
      filteredData = data.filter((item) => itemList.includes(item.itemname));
    }

    // Remove duplicates
    filteredData = filteredData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.itemname === item.itemname)
    );

    this.setState({ filteredData });
  };

  /**
 * Increases the count of an item in the menu data by one. This is typically used to
 * track the quantity of an item that has been selected or added to a cart.
 * 
 * @param {number} index - The index of the item in the data array whose count needs to be incremented.
 */
  addItem = (index) => {
    this.setState((prevState) => ({
      data: prevState.data.map((item, idx) =>
        idx === index ? { ...item, count: item.count + 1 } : item
      ),
    }));
  };

  /**
   * Utility function to return image paths for items.
   * @param {string} itemName - The name of the item.
   * @returns {string|undefined} - The path to the item's image or undefined if not found.
   */
  getImagePath = (itemName) => {
    try {
      return require(`../assets/items/${itemName}.png`);
    } catch (e) {
      console.warn(`Could not load image: ${itemName}.png`);
      return undefined;
    }
  };

  /**
   * Splits data into chunks for rendering.
   * @param {Array} data - The data to chunk.
   * @param {number} chunkSize - The size of each chunk.
   * @returns {Array} - An array of chunks.
   */
  chunkData(data, chunkSize) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }
  /**
   * 
   * Renders Menu UI, and any other features necessary for this 
   * component.
   */
  render() {
    const { filteredData, itemLists, currentListIndex, weather } = this.state;
    const chunkedData = this.chunkData(filteredData, 5);

    const kelvinToFahrenheit = (kelvin) => {
      return (kelvin - 273.15) * 9 / 5 + 32;
    };

    return (
      <div className="menu-container">
        <div className="menu-header">
          <Link to="/" className="home-link">
            <h1 className="category-name">{itemLists[currentListIndex].category}</h1>
          </Link>
          <img src={logo} alt="Rev's American Grill" className="menu-logo" />
          {weather && (
            <div className="weather-info">
              <div className="weather-image">
                <img src={logo2} alt="Weather" />
              </div>
              {/*305 kelvin = 90 F*/}
              <div className="weather-text">
                <p>
                  {
                    weather.main.temp > 305
                      ? "It's hot outside, maybe cool down with a vanilla milkshake?"
                      : weather.weather[0].id < 600
                        ? "It's raining outside, as good of a time as any for a salad!"
                        : weather.main.humidity > 60
                          ? "It's pretty humid outside, be sure to stay hydrated!"
                          : weather.main.temp < 286
                            ? "It's cold outside, warm up with a hot burger fresh off the grill!"
                            : weather.main.temp < 273
                              ? "Brrr... it's freezing outside! In times like these, I like having the spicy chicken sandwich!"
                              : weather.main.temp > 300
                                ? "It's warm outside, maybe have a refreshing sprite?"
                                : "I think a nice BLT is great in any wheather!"
                  }
                </p>
              </div>
              <div className="weather-location">
                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Weather Icon" />
                <p>College Station, TX</p>
                <p>{kelvinToFahrenheit(weather.main.temp).toFixed(0)}°F</p>
              </div>
            </div>
          )}
        </div>
        <div className="items-container">
          {chunkedData.length !== 0 &&
            chunkedData.map((row, rowIndex) => (
              <div key={rowIndex} className="menu-row">
                {row.map((item, itemIndex) => (
                  <div key={itemIndex} className="menu-card">
                    <div className="menu-card-img">
                      <img
                        src={this.getImagePath(item.itemname.toLowerCase())}
                        alt={item.itemname}
                      />
                    </div>
                    <h2>{item.itemname}</h2>
                    <h3>${item.itemprice}</h3>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    );
  }


}

export default Menu;
