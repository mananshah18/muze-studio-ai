import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-white">Muze Studio AI</h1>
          <div className="flex space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Export to ThoughtSpot
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Generate with AI
            </button>
          </div>
        </div>
        <div className="bg-gray-700 p-2 text-sm text-gray-200 rounded">
          <p>Edit your Muze chart code in the editor, then click the <strong>Run</strong> button to see the preview.</p>
          <p>You can directly use the <code>muze.canvas()</code> method and chain your chart configuration as shown in the example.</p>
        </div>
      </div>
    </header>
  );
};

export default Header; 