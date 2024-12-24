// src/components/layout/Sidebar/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Search } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Overview', icon: Home },
    { path: '/analysis', name: 'Analysis', icon: BarChart2 },
    { path: '/opportunities', name: 'Opportunities', icon: Search }
  ];

  return (
    <div className="h-full bg-dark relative">
      {/* Logo and Title */}
      <div className="h-16 flex items-center px-6 border-b border-secondary/10">
        <h1 className="font-display text-2xl text-secondary">HUNGRYBERA</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center h-12 px-6 mb-1 transition-all ${
                isActive 
                  ? 'bg-primary text-secondary' 
                  : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-sans">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 w-full px-6 py-4 border-t border-secondary/10">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-secondary/60 font-sans text-sm">Chain:</span>
            <span className="text-secondary font-sans text-sm">Arbitrum</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary/60 font-sans text-sm">Total Supply:</span>
            <span className="text-secondary font-sans text-sm">7500</span>
          </div>
        </div>
      </div>
    </div>
  );
};