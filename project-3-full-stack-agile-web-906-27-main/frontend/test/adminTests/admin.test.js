import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Admin from '../../src/pages/admin';
import firebase from '../../src/firebase';
import { MemoryRouter } from 'react-router-dom';

describe('Admin Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const setup = () => render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

  it('renders the admin panel correctly', () => {
    const { getByText, getByPlaceholderText } = setup();
    expect(getByText('Add New User')).toBeInTheDocument();
    expect(getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('allows adding a new user', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'New User' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'newuser@example.com' } });
    fireEvent.click(getByText('Add User'));

    await waitFor(() => {
      expect(firebase.firestore().add).toHaveBeenCalledWith({
        username: 'newuser', name: 'New User', email: 'newuser@example.com', role: 'Employee'
      });
    });
  });

  it('handles toggling colorblind mode', () => {
    const { getByText } = setup();
    const toggleButton = getByText('Colorblind Mode');
    fireEvent.click(toggleButton);
    // Verify some expected outcome after toggling
  });
});
