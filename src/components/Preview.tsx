import React, { useRef, useState } from 'react';
import { transformCode } from '../utils/codeTransformer';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

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
            <script>
              // Initialize Muze and ThoughtSpot integration
              document.addEventListener('DOMContentLoaded', function() {
                if (typeof muze !== 'undefined') {
                  window.Muze = muze();
                  
                  // Create the viz object that mimics ThoughtSpot's API
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
                }
              });
            </script>
          </head>
          <body>
            <div id="chart"></div>
            <script>
              // Wait for Muze to be available
              function waitForMuze(callback) {
                if (window.Muze && window.viz) {
                  callback();
                } else {
                  setTimeout(function() { waitForMuze(callback); }, 100);
                }
              }
              
              waitForMuze(function() {
                try {
                  // Execute the code directly
                  ${transformedCode}
                } catch (error) {
                  document.getElementById('chart').innerHTML = 
                    '<div class="error-container">' + 
                    '<h3>Error rendering chart:</h3>' + 
                    '<pre>' + error.message + '</pre></div>';
                  console.error('Chart rendering error:', error);
                }
              });
            </script>
          </body>
        </html>
      `;
      
      // Set the srcdoc attribute instead of using document.write
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