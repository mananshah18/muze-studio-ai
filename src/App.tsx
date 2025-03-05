import { useState, useEffect } from 'react';
import { Editor, Preview, Header } from './components';
import Split from 'split.js';

function App() {
  const [code, setCode] = useState<string>(`// Basic Muze chart example
// Get the Muze library
const { muze } = viz;

// Create a simple bar chart
const canvas = muze.canvas();

// Get data from the ThoughtSpot query
const data = viz.getDataFromSearchQuery();

// Log the data to see what we're working with
debugLog('Data received for chart', data);

// Configure and render the chart
canvas
  .data(data)
  .rows(['Total Sales'])
  .columns(['Category'])
  .mount('#chart');

// Log when the chart is mounted
debugLog('Chart mounted', { target: '#chart' });
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