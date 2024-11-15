//IconMenu.js
import React from 'react';

export default function IconMenu({ options, onClose }) {
  return (
    <div className="icon-menu">
      <button onClick={onClose}>Close</button>
      {options.map((option, index) => (
        <button key={index} onClick={option.onClick}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

