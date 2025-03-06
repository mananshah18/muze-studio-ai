import React, { useRef, useState, useEffect } from "react";
import { transformCode } from "../utils/codeTransformer";
import {
  ChartConfig,
  ChartModel,
  ColumnType,
  Query,
  getChartContext,
} from "@thoughtspot/ts-chart-sdk";
import muze from "@viz/muze";
import "@viz/muze/muze.css";
interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [muzeVersion, setMuzeVersion] = useState(muze.version);

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
            <link rel="stylesheet" href="/lib/muze.css">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                display: flex;
                flex-direction: column;
                height: 100vh;
              }
              #chart {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .error-container {
                color: red;
                padding: 20px;
              }
              .muze-version {
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 12px;
                color: #666;
                background: rgba(255,255,255,0.8);
                padding: 2px 5px;
                border-radius: 3px;
              }
            </style>
            <!-- Load D3.js first (Muze dependency) -->
            <script src="https://d3js.org/d3.v5.min.js"></script>
            
            <!-- Load Muze from local file -->
            <script type="module" src="/lib/muze.js"></script>
          </head>
          <body>
            <div id="chart"></div>
            
            <script type="module">
              import muze from "/lib/muze.js";

              // Check if Muze is available
              if (typeof muze === 'undefined') {
                document.body.innerHTML = '<div class="error-container"><h2>Error: Muze library not loaded</h2><p>The Muze visualization library could not be loaded. Please check your internet connection and try again.</p></div>' + document.body.innerHTML;
                window.parent.postMessage({ type: 'error-detected' }, '*');
              } else {
                // Add version info to the page
                try {
                  const muzeInstance = muze;
                  const versionInfo = muzeInstance.version || 'Unknown';
                  
                  const versionEl = document.createElement('div');
                  versionEl.className = 'muze-version';
                  versionEl.textContent = 'Muze v' + versionInfo;
                  document.body.appendChild(versionEl);
                  
                  // Send version back to parent
                  window.parent.postMessage({ type: 'muze-version', version: versionInfo }, '*');
                  
                  // Create the viz object with Muze and data functions
                  window.viz = {
                    muze: muzeInstance,
                    getDataFromSearchQuery: function() {
                      const data = [
                        { "Category": "Furniture", "Total Sales": 1200 },
                        { "Category": "Office Supplies", "Total Sales": 900 },
                        { "Category": "Technology", "Total Sales": 1500 },
                        { "Category": "Clothing", "Total Sales": 800 },
                        { "Category": "Books", "Total Sales": 600 }
                      ];
                      return data;
                    }
                  };
                  
                  // Execute the user's code
                  try {
                    ${transformedCode}
                  } catch (error) {
                    console.error('Error executing user code:', error);
                    
                    document.getElementById('chart').innerHTML = 
                      '<div class="error-container">' + 
                      '<h3>Error rendering chart:</h3>' + 
                      '<pre>' + error.message + '</pre></div>';
                    
                    window.parent.postMessage({ type: 'error', message: error.message }, '*');
                  }
                } catch (e) {
                  console.error('Error initializing Muze:', e);
                  window.parent.postMessage({ type: 'error', message: e.message }, '*');
                }
              }
            </script>
          </body>
        </html>
      `;

      // Set the srcdoc attribute
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;

      // Add a load event listener to the iframe to capture console logs
      iframe.onload = () => {
        if (iframe.contentWindow) {
          // Listen for messages from the iframe
          const messageHandler = (event: MessageEvent) => {
            if (event.data && event.data.type === "muze-version") {
              setMuzeVersion(event.data.version);
            } else if (event.data && event.data.type === "error") {
              setError(event.data.message);
            }
          };

          window.addEventListener("message", messageHandler);

          return () => {
            window.removeEventListener("message", messageHandler);
          };
        }
      };
    } catch (error) {
      console.error("Error in preview component:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="h-full w-full bg-gray-800 p-2" ref={containerRef}>
      <div className="bg-gray-700 p-2 mb-2 rounded flex justify-between items-center">
        <div className="text-xs text-gray-300">
          Muze Version: <span className="font-mono">{muzeVersion}</span>
        </div>
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
      </div>
    </div>
  );
};

export default Preview;
