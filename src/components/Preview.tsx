import React, { useRef, useState, useEffect } from 'react';
import { transformCode } from '../utils/codeTransformer';
import { ChartConfig, ChartModel, ColumnType, Query, getChartContext } from '@thoughtspot/ts-chart-sdk';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-execute code when component mounts
  useEffect(() => {
    executeCode();
  }, []);

  const executeCode = () => {
    if (!containerRef.current || !iframeRef.current) return;
    setError(null);

    try {
      // Transform the code to be executable in the iframe
      const transformedCode = transformCode(code);
      
      // Create the HTML content for the iframe
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chart Preview</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
              }
              #chart {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .error-container {
                color: red;
                padding: 20px;
              }
            </style>
            <!-- Load Muze from CDN -->
            <script src="https://cdn.jsdelivr.net/npm/@viz/muze@latest/dist/muze.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@thoughtspot/ts-chart-sdk/dist/ts-chart-sdk.umd.js"></script>
          </head>
          <body>
            <div id="chart"></div>
            <script>
              // Initialize Muze immediately
              window.Muze = muze();
              
              // Create a mock implementation of the ThoughtSpot Chart SDK
              window.viz = {
                muze: window.Muze,
                getDataFromSearchQuery: function() {
                  // Sample data that mimics ThoughtSpot's data format
                  return [
                    { "Category": "Furniture", "Total Sales": 1200 },
                    { "Category": "Office Supplies", "Total Sales": 900 },
                    { "Category": "Technology", "Total Sales": 1500 },
                    { "Category": "Clothing", "Total Sales": 800 },
                    { "Category": "Books", "Total Sales": 600 }
                  ];
                }
              };
              
              // Initialize ThoughtSpot Chart SDK context
              const initChartContext = async () => {
                try {
                  // This is a simplified version - in a real implementation, 
                  // this would connect to ThoughtSpot's backend
                  const chartModel = {
                    columns: [
                      { name: "Category", type: "DIMENSION" },
                      { name: "Total Sales", type: "MEASURE" }
                    ],
                    data: [{
                      data: [
                        {
                          columnName: "Category",
                          dataValue: ["Furniture", "Office Supplies", "Technology", "Clothing", "Books"]
                        },
                        {
                          columnName: "Total Sales",
                          dataValue: [1200, 900, 1500, 800, 600]
                        }
                      ]
                    }]
                  };
                  
                  // Execute the user's code
                  try {
                    console.log("Executing code:", ${JSON.stringify(transformedCode)});
                    ${transformedCode}
                    console.log("Code execution completed");
                  } catch (error) {
                    console.error('Chart rendering error:', error);
                    document.getElementById('chart').innerHTML = 
                      '<div class="error-container">' + 
                      '<h3>Error rendering chart:</h3>' + 
                      '<pre>' + error.message + '</pre></div>';
                  }
                } catch (error) {
                  console.error('Error initializing chart context:', error);
                  document.getElementById('chart').innerHTML = 
                    '<div class="error-container">' + 
                    '<h3>Error initializing chart context:</h3>' + 
                    '<pre>' + error.message + '</pre></div>';
                }
              };
              
              // Execute with a small delay to ensure everything is initialized
              setTimeout(initChartContext, 300);
            </script>
          </body>
        </html>
      `;
      
      // Set the srcdoc attribute
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
      
    } catch (error) {
      console.error('Error in preview component:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="h-full w-full bg-gray-800 p-2" ref={containerRef}>
      <div className="bg-gray-700 p-2 mb-2 rounded flex justify-end items-center">
        <button 
          onClick={executeCode}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Run
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="h-[calc(100%-3rem)] bg-white rounded">
        <iframe 
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Chart Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Preview; 