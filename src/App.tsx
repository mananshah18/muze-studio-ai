import React, { useState, useEffect } from 'react';
import { Editor, Preview, Header } from './components';
import Split from 'split.js';
import { generateChartCode } from './utils/openaiService';

function App() {
  const [code, setCode] = useState<string>(`// Get the Muze library and data function
const { muze, getDataFromSearchQuery } = viz;

// Get data from ThoughtSpot
const data = getDataFromSearchQuery();

// Create and configure the chart
muze.canvas()
  .rows(["Category"])
  .columns(["Total Sales"])
  .data(data)
  .mount("#chart");
`);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleQuerySubmit = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedCode = await generateChartCode(query);
      setCode(generatedCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the chart code.');
      console.error('Error generating chart code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
      
      {error && (
        <div className="bg-red-800 text-white p-3 text-center">
          {error}
        </div>
      )}
      
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