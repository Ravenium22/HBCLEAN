// src/components/common/StatCard/StatCard.jsx
import React from 'react';

export const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-secondary p-6 rounded-lg">
      <div className="flex items-center">
        <div className="p-3 rounded bg-primary/10">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
        </div>
        <div className="ml-4">
          <p className="text-sm font-sans text-dark/60">{title}</p>
          <p className="text-2xl font-display text-dark">{value}</p>
        </div>
      </div>
    </div>
  );
};