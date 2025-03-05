import { useState, useEffect } from 'react';
import { Editor, Preview, Header } from './components';
import Split from 'split.js';

function App() {
  const [code, setCode] = useState<string>(`// Get the Muze library and data function from ThoughtSpot
const { muze, getDataFromSearchQuery } = viz;

// Get data from ThoughtSpot search query
const data = getDataFromSearchQuery();

// Create and configure the chart
muze.canvas()
  .rows(["Total Sales"])
  .columns(["Category"])
  .data(data)
  .mount("#chart");

// You can also use more advanced configurations:
/*
muze.canvas()
  .rows(["Total Sales"])
  .columns(["Category"])
  .color("Region")
  .data(data)
  .title("Sales by Category and Region")
  .subtitle("Data from ThoughtSpot")
  .mount("#chart");
*/
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