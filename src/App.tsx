import { useState, useEffect } from 'react';
import { Editor, Preview, Header } from './components';
import Split from 'split.js';

function App() {
  const [code, setCode] = useState<string>(`
// Sample Muze chart code
function createChart(container) {
  // Access Muze from the global scope (loaded via CDN)
  const env = window.Muze;
  const DataModel = env.DataModel;
  const Muze = env;
  
  const data = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 30 },
    { category: 'D', value: 40 }
  ];

  const schema = [
    { name: 'category', type: 'dimension' },
    { name: 'value', type: 'measure' }
  ];

  const dataModel = new DataModel(data, schema);
  
  const canvas = Muze.create()
    .width(600)
    .height(400)
    .data(dataModel)
    .rows(['value'])
    .columns(['category']);
    
  canvas.mount(container);
}
  `);

  useEffect(() => {
    const split = Split(['#editor', '#preview'], {
      sizes: [50, 50],
      minSize: 300,
      gutterSize: 10,
      cursor: 'col-resize'
    });

    return () => {
      split.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="bg-blue-100 dark:bg-blue-900 p-2 text-sm text-blue-800 dark:text-blue-200">
        <p>Edit your Muze chart code in the editor, then click the <strong>Run</strong> button to see the preview.</p>
        <p>Make sure your code includes a <code>createChart(container)</code> function that will be called with the chart container element.</p>
      </div>
      <div className="flex-1 flex">
        <div id="editor" className="h-full">
          <Editor code={code} onChange={setCode} />
        </div>
        <div id="preview" className="h-full">
          <Preview code={code} />
        </div>
      </div>
    </div>
  );
}

export default App; 