import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPanel from '../../src/Functions/CartPanel';
import { useCart } from '../../src/Functions/CartContext';
import axios from 'axios';

jest.mock('../Functions/CartContext', () => ({
  useCart: jest.fn()
}));

jest.mock('axios');

const mockCartItems = [
  { itemname: 'Apple', itemprice: 0.99, quantity: 2 },
  { itemname: 'Banana', itemprice: 1.29, quantity: 1 }
];

describe('CartPanel', () => {
  beforeEach(() => {
    useCart.mockImplementation(() => ({
      cartItems: mockCartItems,
      setCartItems: jest.fn()
    }));
    axios.post.mockClear();
  });

  it('renders correctly when open', () => {
    render(<CartPanel isOpen={true} closeCart={jest.fn()} />);
    expect(screen.getByText('Close Cart')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CartPanel isOpen={false} closeCart={jest.fn()} />);
    expect(screen.queryByText('Close Cart')).not.toBeInTheDocument();
  });

  it('displays the correct subtotal, tax, and total', () => {
    render(<CartPanel isOpen={true} closeCart={jest.fn()} />);
    expect(screen.getByText('Subtotal: $3.27')).toBeInTheDocument();
    expect(screen.getByText('Sales Tax: $0.27')).toBeInTheDocument();
    expect(screen.getByText('Total: $3.54')).toBeInTheDocument();
  });

  it('removes an item when remove button is clicked', () => {
    const setCartItems = jest.fn();
    useCart.mockImplementation(() => ({
      cartItems: mockCartItems,
      setCartItems
    }));

    render(<CartPanel isOpen={true} closeCart={jest.fn()} />);
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(setCartItems).toHaveBeenCalled();
  });

  it('proceeds to payment when button is clicked', async () => {
    axios.post.mockResolvedValueOnce({ data: [{ itemname: 'Apple', id: 1 }, { itemname: 'Banana', id: 2 }]});
    axios.post.mockResolvedValueOnce({ data: 'Order processed successfully' });

    render(<CartPanel isOpen={true} closeCart={jest.fn()} />);
    fireEvent.click(screen.getByText('Proceed to Payment'));

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/itemNames_to_itemIds/get-item-ids', { itemNames: ['Apple', 'Banana'] });
    await axios.post; // Ensure axios calls are resolved

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/customer_items/checkout', {
      order: [
        { id: 1, count: 2 },
        { id: 2, count: 1 }
      ]
    });
  });
});
