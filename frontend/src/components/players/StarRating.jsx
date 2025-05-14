import React from 'react';

function StarRating({ name, value, onChange }) {
  const handleClick = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="star-rating" data-skill={name}>
      {[1, 2, 3, 4, 5].map(star => (
        <span 
          key={star}
          className={`star ${star <= value ? 'active' : ''}`}
          data-value={star}
          onClick={() => handleClick(star)}
        >
          &#9733;
        </span>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export default StarRating;