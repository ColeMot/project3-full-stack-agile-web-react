import React, { useState, useEffect } from 'react';
import '../css/CheckoutComponents/subcategoryModal.css';
import { useCart } from "../Functions/CartContext";
import veganIcon from "../assets/icons/vegan_icon.png";
import glutenIcon from "../assets/icons/gluten_icon.png";
import peanutIcon from "../assets/icons/peanut_icon.png";

/**
 * Functional component representing a subcategory modal.
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.subcategories - The array of subcategories to be displayed.
 * @param {boolean} props.isOpen - A boolean indicating whether the modal is open or not.
 * @param {Function} props.onClose - The function to close the modal.
 * @param {Array} props.veganItems - The array of vegan items.
 * @param {Array} props.veganSeasonals - The array of vegan seasonal items.
 * @param {Array} props.glutenItems - The array of gluten items.
 * @param {Array} props.glutenSeasonals - The array of gluten seasonal items.
 * @param {Array} props.peanutItems - The array of peanut items.
 * @param {Array} props.peanutSeasonals - The array of peanut seasonal items.
 * @returns {JSX.Element} The JSX element representing the SubcategoryModal component.
 * @module subcategoryModal
 */
const SubcategoryModal = ({ subcategories, isOpen, onClose, veganItems, veganSeasonals, glutenItems, glutenSeasonals, peanutItems, peanutSeasonals }) => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const [clickedSubcategories, setClickedSubcategories] = useState({});
  const [modalRef, setModalRef] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef && !modalRef.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onClose]);

  useEffect(() => {
    const updatedClickedSubcategories = {};
    cartItems.forEach(item => {
      updatedClickedSubcategories[item.itemname] = item.quantity;
    });
    setClickedSubcategories(updatedClickedSubcategories);
  }, [cartItems]);

  /**
   * Handles click events on subcategory buttons.
   * Adds the clicked subcategory to the cart and updates the clicked subcategories state.
   * @param {Object} sub The subcategory object.
   * @returns {void}
   * @memberof module:subcategoryModal
   */
  const handleClick = (sub) => {
    setClickedSubcategories(prevClicked => {
      const updatedClickedSubcategories = { ...prevClicked };
      updatedClickedSubcategories[sub.itemname] = (updatedClickedSubcategories[sub.itemname] || 0) + 1;
      return updatedClickedSubcategories;
    });
    addToCart(sub);
  };

  /**
   * Handles click events on remove item buttons.
   * Removes the specified subcategory from the cart and updates the clicked subcategories state.
   * @param {Object} sub The subcategory object.
   * @returns {void}
   * @memberof module:subcategoryModal
   */
  const handleRemoveItem = (sub) => {
    setClickedSubcategories(prevClicked => {
      const updatedClickedSubcategories = { ...prevClicked };
      if (updatedClickedSubcategories[sub.itemname] > 1) {
        updatedClickedSubcategories[sub.itemname]--;
      } else {
        delete updatedClickedSubcategories[sub.itemname];
      }
      return updatedClickedSubcategories;
    });
  
    setCartItems(currentItems => {
      const updatedItems = [];
      let itemRemoved = false;
      for (const item of currentItems) {
        if (item.itemname === sub.itemname) {
          if (item.quantity > 1 && !itemRemoved) {
            updatedItems.push({ ...item, quantity: item.quantity - 1 });
            itemRemoved = true; 
          } else if (!itemRemoved) {
            itemRemoved = true; 
            continue;
          } else {
            updatedItems.push(item);
          }
        } else {
          updatedItems.push(item);
        }
      }
      return updatedItems;
    });
  };
  

  if (!isOpen) return null;

  return (
    <div className="subcategory-modal">
      <div className="modal-content" ref={(ref) => setModalRef(ref)}>
        {subcategories.map(sub => (
          <div key={sub.itemname} className="subcategory-item">
            {clickedSubcategories[sub.itemname] && (
              <button onClick={() => handleRemoveItem(sub)} className="remove-item-button">x</button>
            )}
            <button 
              onClick={() => handleClick(sub)} 
              className="subcategory-button"
              style={{
                boxShadow: clickedSubcategories[sub.itemname] ? '0px 0px 10px rgba(255, 255, 255, 1)' : '4px 4px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div>{sub.itemname} - {sub.itemprice}</div>
              <div>
              {(veganItems.includes(sub.itemname) || veganSeasonals.includes(sub.itemname)) && (
                <img src={veganIcon} alt="This item is Vegan" className="dietary-icon" />
              )}
              {(glutenItems.includes(sub.itemname) || glutenSeasonals.includes(sub.itemname)) && (
                <img src={glutenIcon} alt="This item contains Gluten" className="dietary-icon" />
              )}
              {(peanutItems.includes(sub.itemname) || peanutSeasonals.includes(sub.itemname)) && (
                <img src={peanutIcon} alt="This item contains Peanuts" className="dietary-icon" />
              )}
              </div>
            </button>
            
            {clickedSubcategories[sub.itemname] && (
              <span className="subcategory-count">x{clickedSubcategories[sub.itemname]} </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryModal;
