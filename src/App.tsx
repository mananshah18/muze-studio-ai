import { useState, useEffect } from "react";
import { Editor, Preview, Header } from "./components";
import Split from "split.js";

function App() {
  const [code, setCode] = useState<string>(`// Get the Muze library

const muze = require("@viz/muze");

// Sample data
const data = [
  { Category: "A", Value: 30 },
  { Category: "B", Value: 70 },
  { Category: "C", Value: 50 }
];

// Define schema
const schema = [
  { name: "Category", type: "dimension" },
  { name: "Value", type: "measure", defAggFn: "sum" }
];

const { DataModel } = muze;
const formattedData = DataModel.loadDataSync(data, schema);
let rootData = new DataModel(formattedData);

muze()
  .canvas()
  .rows(["Category"])
  .columns(["Value"])
  .layers([
    {
      mark: "bar"
    }
  ])
  .data(rootData)
  .mount("#chart");
`);

  useEffect(() => {
    // Initialize split.js
    const split = Split([".editor-container", ".preview-container"], {
      sizes: [50, 50],
      minSize: [300, 300],
      gutterSize: 10,
      cursor: "col-resize",
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
