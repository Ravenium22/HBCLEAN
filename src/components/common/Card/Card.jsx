// src/components/common/Card/Card.jsx
import React from 'react';

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-secondary rounded-lg p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};