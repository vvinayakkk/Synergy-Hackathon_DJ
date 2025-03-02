import React from 'react';

const CapFilter = ({ options, active, onChange }) => {
  return (
    <div className="cap-filter">
      {options.map((option) => (
        <button
          key={option}
          className={`cap-filter-button ${active === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default CapFilter;