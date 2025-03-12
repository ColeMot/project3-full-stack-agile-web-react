import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ManagerGUI from '../../src/pages/managerportal'; // Adjust the import path as necessary

describe('ManagerGUI Component', () => {
  it('renders ManagerGUI component', () => {
    render(
      <Router>
        <ManagerGUI />
      </Router>
    );
    expect(screen.getByText('Manage Inventory')).toBeInTheDocument();
  });

  it('fetches ingredients when "View Ingredients" button is clicked', async () => {
    render(
      <Router>
        <ManagerGUI />
      </Router>
    );
    fireEvent.click(screen.getByText('Manage Inventory'));
    await waitFor(() => fireEvent.click(screen.getByText('View All Ingredients')));
    // Additional assertions can be added here
  });

  it('generates and saves a PDF when "Download PDF" button for excess report is clicked', async () => {
    render(
      <Router>
        <ManagerGUI />
      </Router>
    );
    fireEvent.click(screen.getByText('Excess Report'));
    await waitFor(() => fireEvent.click(screen.getByText('Download PDF')));
    // Check if PDF generation function was called
  });

  it('toggles inventory buttons visibility', () => {
    render(
      <Router>
        <ManagerGUI />
      </Router>
    );
    fireEvent.click(screen.getByText('Manage Inventory'));
    expect(screen.getByText('View All Ingredients')).toBeVisible();
  });

  it('toggles colorblind mode', () => {
    render(
      <Router>
        <ManagerGUI />
      </Router>
    );
    expect(document.body.classList.contains('colorblind-mode')).toBe(false);
    fireEvent.click(screen.getByAltText('Colorblind Mode'));
    expect(document.body.classList.contains('colorblind-mode')).toBe(true);
  });
});
