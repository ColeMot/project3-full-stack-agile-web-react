import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import Checkout from '../../src/pages/checkout';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Checkout Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });  // Default response for all GET requests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and makes initial API calls', async () => {
    render(<Router><Checkout /></Router>);
    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });
    expect(axios.get).toHaveBeenCalledTimes(2);  // Check for two API calls
  });

  it('toggles colorblind mode on button click', async () => {
    render(<Router><Checkout /></Router>);
    const colorblindButton = screen.getByAltText('Colorblind Mode');
    fireEvent.click(colorblindButton);
    await waitFor(() => {
      expect(document.body.classList.contains('colorblind-mode')).toBe(true);
    });
  });

  // Additional tests...
});
