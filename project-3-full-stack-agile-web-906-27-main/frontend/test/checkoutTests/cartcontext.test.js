import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../src/Functions/CartContext';

// Helper component to test context usage
const TestComponent = () => {
    const { cartItems, addToCart } = useCart();
    return (
        <div>
            <button onClick={() => addToCart({ itemname: 'Apple', itemprice: '0.99' })}>Add Apple</button>
            <button onClick={() => addToCart({ itemname: 'Banana', itemprice: '1.29' })}>Add Banana</button>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>{item.itemname} - Quantity: {item.quantity}</li>
                ))}
            </ul>
        </div>
    );
};

describe('CartProvider', () => {
    it('initializes with an empty cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        expect(screen.queryByText(/Quantity:/)).toBeNull();
    });

    it('adds a new item to the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        act(() => {
            screen.getByText('Add Apple').click();
        });
        expect(screen.getByText('Apple - Quantity: 1')).toBeInTheDocument();
    });

    it('increments quantity of an existing item in the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        act(() => {
            screen.getByText('Add Apple').click();
            screen.getByText('Add Apple').click();
        });
        expect(screen.getByText('Apple - Quantity: 2')).toBeInTheDocument();
    });

    it('handles multiple different items', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        act(() => {
            screen.getByText('Add Apple').click();
            screen.getByText('Add Banana').click();
        });
        expect(screen.getByText('Apple - Quantity: 1')).toBeInTheDocument();
        expect(screen.getByText('Banana - Quantity: 1')).toBeInTheDocument();
    });
});
