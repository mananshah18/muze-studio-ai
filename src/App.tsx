import { useState, useEffect, useCallback } from "react";
import { Editor, Preview } from "./components";
import { generateChartCode } from "./utils/openaiService";
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

  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedCode = await generateChartCode(query);
      setCode(generatedCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Muze Studio AI</h1>
          <p className="text-gray-400 text-sm">Create charts with natural language</p>
          
          <form onSubmit={handleQuerySubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the chart you want to create..."
              className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded font-medium ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Chart"}
            </button>
          </form>
          
          {error && (
            <div className="mt-2 text-red-400 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      </header>
      
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
