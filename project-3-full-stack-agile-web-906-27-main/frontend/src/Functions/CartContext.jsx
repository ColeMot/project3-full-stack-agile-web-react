import React, { createContext, useContext, useState } from 'react';

/**
 * Context for managing the shopping cart state and operations.
 * @type {React.Context<Object>} The context object containing cart state and functions.
 */
export const CartContext = createContext();

/**
 * Custom hook for accessing the cart context.
 * @returns {Object} The cart context object.
 */
export const useCart = () => useContext(CartContext);

/**
 * Provider component for managing the shopping cart state.
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The JSX element representing the CartProvider component.
 */
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        const priceNumber = parseFloat(item.itemprice); 
        const newItem = { ...item, price: priceNumber };  
    
        const existingItem = cartItems.find(cartItem => cartItem.itemname === item.itemname);
        if (existingItem) {
            setCartItems(cartItems.map(cartItem =>
                cartItem.itemname === item.itemname
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCartItems([...cartItems, { ...newItem, quantity: 1 }]);
        }
    };
    

    return (
        <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};
