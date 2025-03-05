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
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Auto-execute code when component mounts
  useEffect(() => {
    executeCode();
  }, []);

  const executeCode = () => {
    if (!containerRef.current || !iframeRef.current) return;
    setError(null);
    setDebugInfo('');

    try {
      // Transform the code to be executable in the iframe
      const transformedCode = transformCode(code);
      
      // Add our own debug logs to see what's happening
      console.log("Transformed code:", transformedCode);
      
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
                display: flex;
                flex-direction: column;
                height: 100vh;
              }
              #chart {
                width: 100%;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-bottom: 1px solid #ccc;
              }
              #fallback-chart {
                width: 100%;
                height: 200px;
                margin-top: 20px;
                border-top: 1px solid #ccc;
                padding-top: 10px;
              }
              #debug {
                padding: 10px;
                background-color: #f0f0f0;
                font-family: monospace;
                font-size: 12px;
                overflow: auto;
                max-height: 30vh;
              }
              .error-container {
                color: red;
                padding: 20px;
              }
              .section-title {
                font-size: 14px;
                font-weight: bold;
                margin: 10px 0;
                color: #333;
                text-align: center;
              }
            </style>
            <!-- Load Muze from CDN -->
            <script src="https://cdn.jsdelivr.net/npm/@viz/muze@latest/dist/muze.js"></script>
          </head>
          <body>
            <div class="section-title">User Chart</div>
            <div id="chart"></div>
            
            <div class="section-title">Fallback Chart (Always Renders)</div>
            <div id="fallback-chart"></div>
            
            <div id="debug"></div>
            <script>
              // Simple debug function that writes to the debug div
              function debugLog(message, data) {
                const debugEl = document.getElementById('debug');
                const logItem = document.createElement('div');
                
                // Format the message and data
                let dataStr = '';
                try {
                  dataStr = JSON.stringify(data, null, 2);
                } catch (e) {
                  dataStr = String(data);
                }
                
                logItem.innerHTML = '<strong>' + message + '</strong>: ' + dataStr;
                debugEl.appendChild(logItem);
                
                // Also log to console
                console.log(message, data);
              }
              
              // Initialize Muze
              let muzeInstance;
              try {
                muzeInstance = muze();
                debugLog('Muze initialized', { version: muzeInstance.version });
                
                // Create a fallback chart that always renders
                try {
                  debugLog('Creating fallback chart', {});
                  
                  // Sample data for the fallback chart
                  const fallbackData = [
                    { "Category": "Furniture", "Sales": 1200 },
                    { "Category": "Office Supplies", "Sales": 900 },
                    { "Category": "Technology", "Sales": 1500 },
                    { "Category": "Clothing", "Sales": 800 },
                    { "Category": "Books", "Sales": 600 }
                  ];
                  
                  // Create the canvas for the fallback chart
                  const fallbackCanvas = muzeInstance.canvas();
                  
                  // Configure and render the fallback chart
                  fallbackCanvas
                    .data(fallbackData)
                    .rows(["Sales"])
                    .columns(["Category"])
                    .mount("#fallback-chart");
                  
                  debugLog('Fallback chart rendered', { target: '#fallback-chart' });
                } catch (fallbackError) {
                  debugLog('Error rendering fallback chart', { 
                    message: fallbackError.message,
                    stack: fallbackError.stack
                  });
                }
              } catch (e) {
                debugLog('Error initializing Muze', e.message);
              }
              
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
                  debugLog('getDataFromSearchQuery called', data);
                  return data;
                }
              };
              
              // Make debugLog available globally
              window.debugLog = debugLog;
              
              // Execute the user's code
              try {
                debugLog('Starting user code execution', {});
                
                ${transformedCode}
                
                debugLog('User code execution completed', {});
              } catch (error) {
                debugLog('Error executing user code', { 
                  message: error.message,
                  stack: error.stack
                });
                
                document.getElementById('chart').innerHTML = 
                  '<div class="error-container">' + 
                  '<h3>Error rendering chart:</h3>' + 
                  '<pre>' + error.message + '</pre></div>';
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
          // Try to access the debug div after the iframe loads
          setTimeout(() => {
            try {
              const debugContent = iframe.contentDocument?.getElementById('debug')?.innerHTML;
              if (debugContent) {
                setDebugInfo(debugContent);
              } else {
                setDebugInfo('No debug information available');
              }
            } catch (error) {
              console.error('Error accessing iframe content:', error);
              setDebugInfo('Error accessing debug information: ' + (error instanceof Error ? error.message : String(error)));
            }
          }, 1000); // Give it a second to render
        }
      };
      
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
        <div 
          className="bg-gray-100 border-t border-gray-300 p-2 text-xs font-mono overflow-auto"
          style={{ maxHeight: '30%', minHeight: '100px' }}
          dangerouslySetInnerHTML={{ __html: debugInfo }}
        />
      </div>
    </div>
  );
};

export default Preview; 