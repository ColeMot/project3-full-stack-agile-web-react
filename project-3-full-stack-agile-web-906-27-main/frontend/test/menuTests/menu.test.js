import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Menu from '../../src/pages/menu';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios');

const mockWeatherData = {
    main: {
      temp: 310, // Adjust the temperature value as needed for your test cases
      humidity: 50 // Adjust other properties if needed
    },
    weather: [
      {
        id: 800,
        icon: "01d" // Adjust other properties if needed
      }
    ]
  };
  

const mockMenuData = {
  // Mocked menu data
  // Include mock menu data as needed for your tests
};

beforeEach(() => {
  axios.get.mockReset();
  axios.get.mockResolvedValueOnce({ data: mockWeatherData });
  axios.get.mockResolvedValueOnce({ data: mockMenuData });
});

test('renders menu component without crashing', () => {
  render(
    <BrowserRouter>
      <Menu />
    </BrowserRouter>
  );
});


  
test('changes menu categories automatically', async () => {
  jest.useFakeTimers(); // Use Jest's fake timers
  render(
    <BrowserRouter>
      <Menu />
    </BrowserRouter>
  );

  jest.advanceTimersByTime(7000); // Fast forward timers by 7 seconds
  // Add additional assertions for category change
});

test('renders correct HTML structure', () => {
  const { container } = render(
    <BrowserRouter>
      <Menu />
    </BrowserRouter>
  );

  expect(container.firstChild).toHaveClass('menu-container');
  // Add additional assertions for HTML structure
});
