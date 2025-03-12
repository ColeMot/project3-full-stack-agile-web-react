import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SubcategoryModal from '../src/Functions/SubcategoryModal';
import { CartProvider } from '../src/Functions/CartContext';

describe('SubcategoryModal', () => {
  const mockOnClose = jest.fn();
  const mockAddToCart = jest.fn();

  const subcategories = [
    { itemname: 'Subcategory 1', itemprice: 5 },
    { itemname: 'Subcategory 2', itemprice: 8 }
  ];

  const props = {
    subcategories: subcategories,
    isOpen: true,
    onClose: mockOnClose,
    veganItems: [],
    veganSeasonals: [],
    glutenItems: [],
    glutenSeasonals: [],
    peanutItems: [],
    peanutSeasonals: []
  };

  beforeEach(() => {
    render(
      <CartProvider>
        <SubcategoryModal {...props} />
      </CartProvider>
    );
  });

  it('renders correctly with given props', () => {
    expect(screen.getByText('Subcategory 1 - 5')).toBeInTheDocument();
    expect(screen.getByText('Subcategory 2 - 8')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('adds item to cart when subcategory button is clicked', () => {
    fireEvent.click(screen.getByText('Subcategory 1 - 5'));
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });

  it('removes item from cart when remove item button is clicked', () => {
    fireEvent.click(screen.getByText('Subcategory 1 - 5'));
    fireEvent.click(screen.getByText('x'));
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });
});
