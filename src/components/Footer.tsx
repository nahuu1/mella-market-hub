import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <p className="text-lg font-medium">
          Made by{' '}
          <a
            href="https://techspaceet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-400"
          >
            Tech Space ET
          </a>
        </p>
        <p className="text-gray-400 text-sm mt-2">
          © 2025 Mella - Ethiopian Marketplace. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
