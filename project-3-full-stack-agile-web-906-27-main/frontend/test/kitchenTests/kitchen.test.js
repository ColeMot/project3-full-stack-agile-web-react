import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Kitchen from '../../src/pages/kitchen'; // Adjust the import path as necessary
import axios from 'axios';

describe('Kitchen Component', () => {
  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <Kitchen />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Active orders:/i)).toBeInTheDocument();
    });
  });

  it('toggles color blind mode', () => {
    render(
      <MemoryRouter>
        <Kitchen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByAltText(/Colorblind Mode/i));
    expect(document.body.classList.contains('colorblind-mode')).toBe(true);
    fireEvent.click(screen.getByAltText(/Colorblind Mode/i));
    expect(document.body.classList.contains('colorblind-mode')).toBe(false);
  });

  it('fetches incomplete orders on mount', async () => {
    const axiosMock = jest.spyOn(axios, 'get').mockResolvedValue({
      data: [{ customerid: 1, status: 'Incomplete' }]
    });

    await waitFor(() => {
      render(
        <MemoryRouter>
          <Kitchen />
        </MemoryRouter>
      );
    });

    expect(axiosMock).toHaveBeenCalledWith('http://localhost:3001/manageorder/incompleteorders');
    axiosMock.mockRestore(); // Clean up mock to prevent memory leak
  });
});
