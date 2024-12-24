// src/components/layout/Footer/Footer.jsx
import React from 'react';
import { Twitter, MessageSquare } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#171717] text-white py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <p className="text-sm text-gray-400">
              © 2024 HungryBera Analytics
            </p>
            <p className="text-sm text-gray-400">
              Made by{' '}
              <span className="text-primary font-medium">Ravenium</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://twitter.com/RaveniumNFT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Twitter className="h-4 w-4" />
              <span className="text-sm">@RaveniumNFT</span>
            </a>
            <a 
              href="https://discord.com/users/Ravenium22" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Ravenium22</span>
            </a>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};