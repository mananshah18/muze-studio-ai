import React, { useEffect, useState } from 'react';
import { mockContext, transformDataForMuze, createMuzeSchema } from '../thoughtspot';
import { Preview } from './index';

interface ChartRendererProps {
  code: string;
  useThoughtSpotData?: boolean;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  code, 
  useThoughtSpotData = false 
}) => {
  const [processedCode, setProcessedCode] = useState<string>(code);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      console.log("No code available");
      return;
    }

    console.log("Starting chart rendering process");
    console.log(`Using ThoughtSpot data: ${useThoughtSpotData}`);

    // Reset error state
    setError(null);

    try {
      // Process the code to include ThoughtSpot data if needed
      let finalCode = code;
      
      if (useThoughtSpotData) {
        console.log("Transforming ThoughtSpot data");
        try {
          const thoughtSpotData = transformDataForMuze(mockContext.getChartModel());
          const schema = createMuzeSchema(mockContext.getChartModel());
          console.log(`Transformed data has ${thoughtSpotData.length} rows`);
          
          // Modify the code to use ThoughtSpot data
          finalCode = `// Using ThoughtSpot data
const thoughtSpotData = ${JSON.stringify(thoughtSpotData, null, 2)};
const schema = ${JSON.stringify(schema, null, 2)};
const { muze, getDataFromSearchQuery } = viz;

// Override getDataFromSearchQuery to use ThoughtSpot data
viz.getDataFromSearchQuery = function() {
  console.log("Using ThoughtSpot data instead of search query");
  const DataModel = muze.DataModel;
  const formattedData = DataModel.loadDataSync(thoughtSpotData, schema);
  return new DataModel(formattedData);
};

// Original chart code
${code}`;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`Error transforming ThoughtSpot data: ${errorMessage}`);
          setError(`Error transforming ThoughtSpot data: ${errorMessage}`);
          return;
        }
      }
      
      setProcessedCode(finalCode);
      console.log("Code processed successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error processing code: ${errorMessage}`);
      setError(`Error processing code: ${errorMessage}`);
    }
  }, [code, useThoughtSpotData]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 text-sm z-10">
          Error: {error}
        </div>
      )}
      <Preview code={processedCode} />
    </div>
  );
};

export default ChartRenderer; 