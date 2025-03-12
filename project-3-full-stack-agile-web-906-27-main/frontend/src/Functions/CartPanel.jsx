import React from 'react';
import '../css/CheckoutComponents/CartPanel.css'; 
import { useCart } from "../Functions/CartContext";
import axios from 'axios'; 
import { useState } from 'react';

/**
 * Represents a component that displays the shopping cart panel.
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.isOpen - Indicates whether the cart panel is open.
 * @param {function} props.closeCart - Callback function to close the cart panel.
 * @returns {JSX.Element} The JSX element representing the CartPanel component.
 * @module CartPanel
 */
function CartPanel({ isOpen, closeCart }) {
  const { cartItems, setCartItems } = useCart();
  const [orderProcessed, setOrderProcessed] = useState(false);

  /**
   * Handles the removal of an item from the shopping cart.
   * @param {Object} item - The item to be removed.
   * @returns {void}
   * @memberof module:CartPanel
   */
  const handleRemoveItem = (item) => {
    setCartItems((currentItems) => {
      return currentItems.reduce((acc, current) => {
        if (current.itemname === item.itemname) {
          if (current.quantity > 1) {
            acc.push({ ...current, quantity: current.quantity - 1 });
          } 
        } else {
          acc.push(current);
        }
        return acc;
      }, []);
    });
  };

  const subtotal = cartItems.reduce((total, item) => total + item.itemprice * item.quantity, 0);
  const taxRate = 0.0825; 
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  /**
   * Proceeds to the payment process by sending the cart items to the server for checkout.
   * @returns {void}
   * @memberof module:CartPanel
   */
  function proceedToPayment() {
    const order = cartItems.filter(item => item.quantity > 0)
        .map(item => ({
            id: item.type === 'regular' ? item.itemid : item.seasonalid, 
            count: item.quantity,
            type: item.type
        }));
    console.log(order);
    axios
      .post(`http://localhost:3001/order/checkout`, { order })
      .then(() => {
      setCartItems((prevData) => prevData.map((item) => ({ ...item, quantity: 0 })));
      })
      .catch((err) => {
      console.error("Checkout error:", err);
      });

    axios
      .post(`http://localhost:3001/customer_items/checkout`, { order })
      .then(() => {
      setCartItems((prevData) => prevData.map((item) => ({ ...item, quantity: 0 })));
      })
      .catch((err) => {
      console.error("Checkout error:", err);
      });
      closeCart(); // Close cart panel after payment
      setCartItems([]);
      setOrderProcessed(true);
      if (orderProcessed) {
        window.alert("Your order has been processed successfully!");
      }

  }
  

  return (
    <>
      {isOpen && <div className="backdrop" onClick={closeCart}></div>}
      <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
        <button className="close-cart" onClick={closeCart}>Close Cart</button>
        <ul>
          {cartItems.map((item, index) => (
            <li key={index} className="cart-item">
              <div className="item-name-and-details">
                <span className="item-name">{item.itemname}</span>
                <div className="item-quantity-and-price">
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price-per">${item.itemprice.toFixed(2)}</span>
                </div>
              </div>
              <span className="item-total">${(item.itemprice * item.quantity).toFixed(2)}</span>
              <button onClick={() => handleRemoveItem(item)} className="remove-item-button">×</button>
            </li>
          ))}
        </ul>
        <div className="pricing-details">
          <div className="subtotal">Subtotal: ${subtotal.toFixed(2)}</div>
          <div className="tax">Sales Tax: ${tax.toFixed(2)}</div>
          <div className="total">Total: ${total.toFixed(2)}</div>
        </div>
        <div className="proceed-payment-wrapper">
          <button className="proceed-payment" onClick={proceedToPayment}>Proceed to Payment</button>
        </div>
        
      </div>
    </>
  );
}

export default CartPanel;
