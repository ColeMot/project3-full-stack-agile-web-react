import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CategoryCard from '../src/Functions/CategoryCard';

describe('CategoryCard', () => {
  const mockOnClick = jest.fn();
  const props = {
    imageSrc: 'path/to/image.jpg',
    categoryName: 'Burgers',
    onClick: mockOnClick
  };

  it('renders correctly with given props', () => {
    render(<CategoryCard {...props} />);
    expect(screen.getByText('Burgers')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyle(`backgroundImage: url(${props.imageSrc})`);
  });

  it('calls onClick when clicked', () => {
    render(<CategoryCard {...props} />);
    fireEvent.click(screen.getByText('Burgers'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when "Enter" key is pressed', () => {
    render(<CategoryCard {...props} />);
    fireEvent.keyPress(screen.getByText('Burgers'), { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    render(<CategoryCard {...props} />);
    fireEvent.keyPress(screen.getByText('Burgers'), { key: 'A', code: 'KeyA', charCode: 65 });
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
