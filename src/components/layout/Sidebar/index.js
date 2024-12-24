// src/components/layout/MainLayout/MainLayout.jsx
import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Footer } from '../Footer/Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};