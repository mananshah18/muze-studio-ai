import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Muze Studio AI</h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 