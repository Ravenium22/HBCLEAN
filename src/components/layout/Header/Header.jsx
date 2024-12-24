// src/components/layout/Header/Header.jsx
import { useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'OVERVIEW';
      case '/analysis':
        return 'ANALYSIS';
      case '/opportunities':
        return 'OPPORTUNITIES';
      default:
        return 'OVERVIEW';
    }
  };

  return (
    <div className="h-16 border-b border-secondary/10">
      <div className="h-full px-6 flex items-center">
        <div>
          <h1 className="font-display text-2xl text-secondary mb-0.5">{getPageTitle()}</h1>
          <p className="font-sans text-sm text-secondary/60">HungryBera Collection</p>
        </div>
      </div>
    </div>
  );
};