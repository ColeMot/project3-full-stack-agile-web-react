import React, { Component } from "react";
import { Navigate, Link } from "react-router-dom";
import firebase from "../firebase";
import "../css/MainComponents/main.css";
import logo from "../images/REVs LOGO.png";
import colorblindIcon from "../images/red-green.png";
import textSizeIcon from "../images/text-size-icon.png"; 

/**
 * MainPage is a React component that provides navigation to different views such as manager,
 * cashier, and admin interfaces depending on user authentication and selected options.
 * It also provides accessibility settings like color blind mode and text size adjustments.
 */
class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToManager: false,
      redirectToCheckout: false,
      redirectToAdmin: false,  // New state for admin redirection
      colorBlindMode: false,
      textSizeIncreased: false

    };

  }

  /**
   * Toggles the color blind mode in the application's UI.
   */
  toggleColorBlindMode = () => {
    this.setState(prevState => ({
      colorBlindMode: !prevState.colorBlindMode
    }), () => {
      if (this.state.colorBlindMode) {
        document.body.classList.add("colorblind-mode");
      } else {
        document.body.classList.remove("colorblind-mode");
      }
    });
  };

   /**
   * Toggles the text size for better readability across the application's UI.
   */
  toggleTextSize = () => {
    this.setState(prevState => ({
      textSizeIncreased: !prevState.textSizeIncreased
    }), () => {
      if (this.state.textSizeIncreased) {
        document.body.classList.add("text-size-increased");
      } else {
        document.body.classList.remove("text-size-increased");
      }
    });
  };

  /**
   * Adds a class to style the body specifically for the main page when the component mounts.
   */
  componentDidMount() {
    document.body.classList.add("main-body");
  }

  /**
   * Removes the main page specific body class when the component will unmount.
   */
  componentWillUnmount() {
    document.body.classList.remove("main-body");
  }

  /**
   * Handles authentication and redirects to the manager view upon successful login.
   */
  handleManagerViewClick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.user) {
        this.setState({ redirectToManager: true });
      }
    }).catch((error) => {
      console.error("Authentication error:", error);
    });
  };

  /**
   * Handles authentication and redirects to the cashier checkout view upon successful login.
   */
  handleCashierCheckoutClick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.user) {
        this.setState({ redirectToCheckout: true });
      }
    }).catch((error) => {
      console.error("Authentication error:", error);
    });
  };

   /**
   * Handles authentication and redirects to the admin view upon successful login.
   */
  handleAdminClick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.user) {
        this.setState({ redirectToAdmin: true });
      }
    }).catch((error) => {
      console.error("Authentication error:", error);
    });
  };

  /**
   * 
   * Renders the MainPage UI component, and sets up navigation for the whole
   * product.
   */
  render() {
    if (this.state.redirectToManager) {
      return <Navigate to="/manager" />;
    }

    if (this.state.redirectToCheckout) {
      return <Navigate to="/order" />;
    }

    if (this.state.redirectToAdmin) {
      return <Navigate to="/admin" />;
    }

    return (
      <div className="main-page">
        <div className="main-header">
          <img src={logo} alt="Rev's American Grill" className="main-logo" />
          <img
            src={colorblindIcon}
            alt="Colorblind Mode"
            className="colorblind-toggle"
            onClick={this.toggleColorBlindMode}
          />
          <img
            src={textSizeIcon} 
            alt="Increase Text Size"
            className="text-size-toggle"
            onClick={this.toggleTextSize}
          />
        </div>
        <main className="main-main">
          <div className="button-wrapper">
            <Link to="/menu"><button className="main-button">Menu</button></Link>
            <button className="main-button" onClick={this.handleManagerViewClick}>Manager View</button>
            <button className="main-button" onClick={this.handleCashierCheckoutClick}>Cashier Checkout</button>
            <Link to="/checkout"><button className="main-button">Self Checkout</button></Link>
            <button className="main-button" onClick={this.handleAdminClick}>Admin</button>  {/* Updated button event handler */}
            <Link to="/kitchen"><button className="main-button">Kitchen</button></Link>
          </div>
        </main>
      </div>
    );
  }

}

export default MainPage;
