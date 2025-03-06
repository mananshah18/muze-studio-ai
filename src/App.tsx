import { useState, useEffect, useCallback } from "react";
import { Editor, Preview } from "./components";
import ChartRenderer from "./components/ChartRenderer";
import { generateChartCode, ChartRecommendation } from "./utils/openaiService";
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
  const [chartRecommendation, setChartRecommendation] = useState<ChartRecommendation | null>(null);
  const [useThoughtSpotData, setUseThoughtSpotData] = useState<boolean>(false);

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
    setChartRecommendation(null);
    
    try {
      const result = await generateChartCode(query);
      setCode(result.code);
      setChartRecommendation(result.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle ThoughtSpot data usage
  const toggleThoughtSpotData = () => {
    setUseThoughtSpotData(prev => !prev);
  };

  // Function to render chart recommendation details
  const renderChartRecommendation = () => {
    if (!chartRecommendation) return null;

    return (
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-2">Chart Recommendation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-blue-400">
                {chartRecommendation.chartType}
              </h3>
              <p className="text-gray-300 mt-1">{chartRecommendation.rationale}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Configuration</h3>
              <ul className="space-y-1 text-gray-300">
                {chartRecommendation.configuration.xAxis && (
                  <li><span className="text-gray-400">X-Axis:</span> {chartRecommendation.configuration.xAxis}</li>
                )}
                {chartRecommendation.configuration.yAxis && (
                  <li><span className="text-gray-400">Y-Axis:</span> {chartRecommendation.configuration.yAxis}</li>
                )}
                {chartRecommendation.configuration.layers && chartRecommendation.configuration.layers.length > 0 && (
                  <li>
                    <span className="text-gray-400">Layers:</span>
                    <ul className="ml-4 mt-1">
                      {chartRecommendation.configuration.layers.map((layer, index) => (
                        <li key={index}>• {layer}</li>
                      ))}
                    </ul>
                  </li>
                )}
                {chartRecommendation.configuration.encodings && Object.keys(chartRecommendation.configuration.encodings).length > 0 && (
                  <li>
                    <span className="text-gray-400">Encodings:</span>
                    <ul className="ml-4 mt-1">
                      {Object.entries(chartRecommendation.configuration.encodings).map(([key, value], index) => (
                        <li key={index}>• {value}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
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
          
          <div className="mt-4 flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={useThoughtSpotData}
                onChange={toggleThoughtSpotData}
              />
              <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-300">
                Use ThoughtSpot Data
              </span>
            </label>
          </div>
        </div>
      </header>
      
      {chartRecommendation && renderChartRecommendation()}
      
      <div className="flex-1 flex overflow-hidden">
        <div className="editor-container w-1/2 overflow-auto">
          <Editor code={code} onChange={setCode} />
        </div>
        <div className="preview-container w-1/2 overflow-auto">
          {useThoughtSpotData ? (
            <ChartRenderer code={code} useThoughtSpotData={true} />
          ) : (
            <Preview code={code} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
