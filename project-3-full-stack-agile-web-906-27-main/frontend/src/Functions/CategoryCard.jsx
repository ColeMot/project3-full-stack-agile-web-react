import React from 'react';
import '../css/CheckoutComponents/categoryCard.css'; 

/**
 * Functional component representing a category card.
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.imageSrc - The image source URL for the category.
 * @param {string} props.categoryName - The name of the category.
 * @param {Function} props.onClick - The function to be executed on clicking the card.
 * @returns {JSX.Element} The JSX element representing the CategoryCard component.
 */
const CategoryCard = ({ imageSrc, categoryName, onClick }) => {
  return (
    <div
      className="category-card"
      onClick={onClick}
      onKeyPress={(e) => {
        if (e.key === 'Enter') onClick(); 
      }}
      tabIndex="0" 
      role="button" 
      style={{ cursor: 'pointer' }} 
    >
      <div className="card-image" style={{ backgroundImage: `url(${imageSrc})` }}>
      </div>
      <div className="card-title">
        <h3>{categoryName}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
