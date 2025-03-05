import { useState, useEffect } from 'react';
import { Editor, Preview, Header } from './components';
import Split from 'split.js';

function App() {
  const [code, setCode] = useState<string>(`// Get the Muze library
const env = viz.muze;

// Sample data
const data = [
  { "Category": "Furniture", "Sales": 1200 },
  { "Category": "Office Supplies", "Sales": 900 },
  { "Category": "Technology", "Sales": 1500 },
  { "Category": "Clothing", "Sales": 800 },
  { "Category": "Books", "Sales": 600 }
];

// Create the canvas
const canvas = env.canvas();

// Configure the chart
canvas
  .data(data)
  .rows(["Sales"])
  .columns(["Category"])
  .mount("#chart");
`);

  useEffect(() => {
    // Initialize split.js
    const split = Split(['.editor-container', '.preview-container'], {
      sizes: [50, 50],
      minSize: [300, 300],
      gutterSize: 10,
      cursor: 'col-resize'
    });

    return () => {
      // Clean up split.js
      split.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="editor-container w-1/2 overflow-auto">
          <Editor code={code} onChange={setCode} />
        </div>
        <div className="preview-container w-1/2 overflow-auto">
          <Preview code={code} />
        </div>
      </div>
    </div>
  );
}

export default App; 