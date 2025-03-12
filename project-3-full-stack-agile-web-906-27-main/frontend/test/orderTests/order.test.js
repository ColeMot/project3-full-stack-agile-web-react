import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import Order from '../../src/pages/order';

jest.mock('axios');

describe('Order Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });  // Default mock for axios
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Router><Order /></Router>);
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('fetches out of stock items on mount', async () => {
    const mockOutOfStock = { data: [{ itemname: 'Cake' }] };
    axios.get.mockResolvedValueOnce(mockOutOfStock);
    render(<Router><Order /></Router>);
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/order/outofstockitems'));
    expect(screen.getByText('Cake')).toBeInTheDocument();
  });

  it('toggles color blind mode', () => {
    render(<Router><Order /></Router>);
    fireEvent.click(screen.getByAltText('Toggle Colorblind Mode'));
    expect(document.body.classList.contains('colorblind-mode')).toBe(true);
  });

  it('adds an item to the order and updates subtotal correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ itemname: 'Cookie', itemprice: '2.00', count: 0 }] });
    render(<Router><Order /></Router>);
    const addItemButton = await screen.findByText('Cookie');
    fireEvent.click(addItemButton);
    expect(screen.getByText('Subtotal: $2.00')).toBeInTheDocument();
  });

  it('handles checkout and shows thank you message', async () => {
    render(<Router><Order /></Router>);
    fireEvent.click(screen.getByText('Checkout'));
    fireEvent.click(screen.getByText('Yes'));
    await waitFor(() => expect(screen.getByText('Order is complete!')).toBeInTheDocument());
  });
});
