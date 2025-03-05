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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Auto-execute code when component mounts
  useEffect(() => {
    executeCode();
  }, []);

  // Function to receive messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'debug-info') {
        setDebugInfo(event.data.content);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const executeCode = () => {
    if (!containerRef.current || !iframeRef.current) return;
    setError(null);
    setDebugInfo(null);

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
                height: 70vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .error-container {
                color: red;
                padding: 20px;
              }
              .debug-container {
                padding: 10px;
                background-color: #f0f0f0;
                border-top: 1px solid #ccc;
                font-family: monospace;
                font-size: 12px;
                overflow: auto;
                max-height: 30vh;
              }
            </style>
            <!-- Load Muze from CDN -->
            <script src="https://cdn.jsdelivr.net/npm/@viz/muze@latest/dist/muze.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@thoughtspot/ts-chart-sdk/dist/ts-chart-sdk.umd.js"></script>
          </head>
          <body>
            <div id="chart"></div>
            <div id="debug" class="debug-container"></div>
            <script>
              // Debug function to log information
              function debugLog(message, data) {
                console.log(message, data);
                const debugEl = document.getElementById('debug');
                const logItem = document.createElement('div');
                logItem.innerHTML = '<strong>' + message + '</strong>: ' + JSON.stringify(data);
                debugEl.appendChild(logItem);
                
                // Also send to parent window
                window.parent.postMessage({
                  type: 'debug-info',
                  content: debugEl.innerHTML
                }, '*');
              }
            
              // Initialize Muze immediately
              window.Muze = muze();
              debugLog('Muze initialized', { version: window.Muze.version });
              
              // Create a mock implementation of the ThoughtSpot Chart SDK
              window.viz = {
                muze: window.Muze,
                getDataFromSearchQuery: function() {
                  // Sample data that mimics ThoughtSpot's data format
                  const data = [
                    { "Category": "Furniture", "Total Sales": 1200 },
                    { "Category": "Office Supplies", "Total Sales": 900 },
                    { "Category": "Technology", "Total Sales": 1500 },
                    { "Category": "Clothing", "Total Sales": 800 },
                    { "Category": "Books", "Total Sales": 600 }
                  ];
                  debugLog('getDataFromSearchQuery called', data);
                  return data;
                }
              };
              debugLog('viz object created', window.viz);
              
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
                  debugLog('chartModel created', chartModel);
                  
                  // Execute the user's code
                  try {
                    debugLog('Executing code', ${JSON.stringify(transformedCode)});
                    
                    // Create a function to execute the code in a controlled environment
                    const executeUserCode = new Function('debugLog', \`
                      try {
                        ${transformedCode}
                        return { success: true };
                      } catch (e) {
                        return { success: false, error: e.message };
                      }
                    \`);
                    
                    const result = executeUserCode(debugLog);
                    debugLog('Code execution result', result);
                    
                    if (!result.success) {
                      throw new Error(result.error);
                    }
                  } catch (error) {
                    console.error('Chart rendering error:', error);
                    debugLog('Chart rendering error', { message: error.message, stack: error.stack });
                    document.getElementById('chart').innerHTML = 
                      '<div class="error-container">' + 
                      '<h3>Error rendering chart:</h3>' + 
                      '<pre>' + error.message + '</pre></div>';
                  }
                } catch (error) {
                  console.error('Error initializing chart context:', error);
                  debugLog('Error initializing chart context', { message: error.message, stack: error.stack });
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
      <div className="h-[calc(100%-3rem)] bg-white rounded flex flex-col">
        <iframe 
          ref={iframeRef}
          className="w-full flex-grow border-0"
          title="Chart Preview"
          sandbox="allow-scripts allow-same-origin"
        />
        {debugInfo && (
          <div 
            className="bg-gray-100 border-t border-gray-300 p-2 text-xs font-mono overflow-auto"
            style={{ maxHeight: '30%' }}
            dangerouslySetInnerHTML={{ __html: debugInfo }}
          />
        )}
      </div>
    </div>
  );
};

export default Preview; 