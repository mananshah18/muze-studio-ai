// OpenAI Service

import OpenAI from 'openai';
import { SYSTEM_PROMPT, EXPERIMENTAL_PROMPTS } from './promptConfig';
import { getCurrentPromptKey } from './promptSwitcher';

// Constants
const API_TIMEOUT = 30000; // 30 seconds timeout for API calls
const DEFAULT_FALLBACK_CODE = `
// Fallback chart code
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

// Simple bar chart
muze
  .canvas()
  .data(data)
  .rows(['Category'])
  .columns(['Value'])
  .mount('#chart');
`;

// Types for chart recommendation
export interface ChartRecommendation {
  chartType: string;
  rationale: string;
  configuration: {
    xAxis?: string;
    yAxis?: string;
    layers?: string[];
    encodings?: Record<string, string>;
    [key: string]: any;
  };
}

// Get the current prompt from the EXPERIMENTAL_PROMPTS object
const getCurrentPrompt = () => {
  try {
    const promptKey = getCurrentPromptKey();
    console.log(`[OpenAI Service] Using prompt key: ${promptKey}`);
    return EXPERIMENTAL_PROMPTS[promptKey] || SYSTEM_PROMPT;
  } catch (error) {
    console.error('[OpenAI Service] Error getting prompt:', error);
    return SYSTEM_PROMPT;
  }
};

/**
 * Extracts chart recommendation information from the LLM response
 * @param response The raw response from OpenAI
 * @returns The extracted chart recommendation or null if not found
 */
function extractChartRecommendation(response: string): ChartRecommendation | null {
  try {
    console.log(`[OpenAI Service] Extracting chart recommendation from response`);
    
    // Check if the response contains a chart recommendation section
    if (!response.includes('Chart Recommendation:')) {
      console.log('[OpenAI Service] No chart recommendation found in response');
      return null;
    }
    
    // Extract the chart recommendation section
    const recommendationRegex = /Chart Recommendation:[\s\S]*?Configuration Details:[\s\S]*?(?=```|$)/;
    const recommendationMatch = response.match(recommendationRegex);
    
    if (!recommendationMatch) {
      console.log('[OpenAI Service] Could not extract chart recommendation section');
      return null;
    }
    
    const recommendationText = recommendationMatch[0];
    
    // Extract chart type
    const chartTypeRegex = /Recommended Chart Type:\s*(.*?)(?:\n|$)/;
    const chartTypeMatch = recommendationText.match(chartTypeRegex);
    const chartType = chartTypeMatch ? chartTypeMatch[1].trim() : 'Unknown Chart Type';
    
    // Extract rationale
    const rationaleRegex = /Rationale:\s*(.*?)(?:\n\n|\n[^-\s]|$)/s;
    const rationaleMatch = recommendationText.match(rationaleRegex);
    const rationale = rationaleMatch ? rationaleMatch[1].trim() : '';
    
    // Extract configuration details
    const configuration: ChartRecommendation['configuration'] = {};
    
    // Extract x-axis
    const xAxisRegex = /x-axis:\s*(.*?)(?:\n|$)/;
    const xAxisMatch = recommendationText.match(xAxisRegex);
    if (xAxisMatch) {
      configuration.xAxis = xAxisMatch[1].trim();
    }
    
    // Extract y-axis
    const yAxisRegex = /y-axis:\s*(.*?)(?:\n|$)/;
    const yAxisMatch = recommendationText.match(yAxisRegex);
    if (yAxisMatch) {
      configuration.yAxis = yAxisMatch[1].trim();
    }
    
    // Extract layers/encodings
    const layersRegex = /Layers\/Encodings:([\s\S]*?)(?=\n\n|\n[^-\s]|$)/;
    const layersMatch = recommendationText.match(layersRegex);
    if (layersMatch) {
      const layersText = layersMatch[1];
      const layers: string[] = [];
      const encodings: Record<string, string> = {};
      
      // Extract individual layer/encoding items
      const itemRegex = /-\s*(.*?)(?:\n|$)/g;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(layersText)) !== null) {
        const item = itemMatch[1].trim();
        
        // Check if it's a color encoding
        if (item.toLowerCase().includes('color:')) {
          encodings.color = item;
        } 
        // Check if it's a size encoding
        else if (item.toLowerCase().includes('size:')) {
          encodings.size = item;
        }
        // Check if it's a shape encoding
        else if (item.toLowerCase().includes('shape:')) {
          encodings.shape = item;
        }
        // Otherwise, treat as a general layer
        else {
          layers.push(item);
        }
      }
      
      if (layers.length > 0) {
        configuration.layers = layers;
      }
      
      if (Object.keys(encodings).length > 0) {
        configuration.encodings = encodings;
      }
    }
    
    return {
      chartType,
      rationale,
      configuration
    };
  } catch (error) {
    console.error('[OpenAI Service] Error extracting chart recommendation:', error);
    return null;
  }
}

/**
 * Processes the OpenAI response to extract only the code part
 * @param response The raw response from OpenAI
 * @returns The extracted code
 */
function extractCodeFromResponse(response: string): string {
  try {
    console.log(`[OpenAI Service] Extracting code from response (${response.length} chars)`);
    
    // If the response is already just code, return it as is
    if (response.trim().startsWith('const') || response.trim().startsWith('// Get')) {
      console.log('[OpenAI Service] Response appears to be pure code, returning as is');
      return response;
    }
    
    // Try to extract code blocks with JavaScript/JS markers
    const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      console.log('[OpenAI Service] Found code block with language marker');
      return match[1].trim();
    }
    
    // Try to extract any code blocks (without language markers)
    const genericCodeBlockRegex = /```([\s\S]*?)```/;
    const genericMatch = response.match(genericCodeBlockRegex);
    
    if (genericMatch && genericMatch[1]) {
      console.log('[OpenAI Service] Found generic code block');
      return genericMatch[1].trim();
    }
    
    // Look for code that starts with common JavaScript patterns
    const jsPatternRegex = /((?:const|let|var|\/\/|\/\*|\*\/|function|muze)\s*[\s\S]*)/;
    const jsMatch = response.match(jsPatternRegex);
    
    if (jsMatch && jsMatch[1]) {
      console.log('[OpenAI Service] Found code using JS pattern matching');
      return jsMatch[1].trim();
    }
    
    // If no code block found, return the original response
    console.log('[OpenAI Service] No code block found, returning original response');
    return response;
  } catch (error) {
    console.error('[OpenAI Service] Error extracting code:', error);
    return response; // Return the original response in case of error
  }
}

/**
 * Validates that the extracted code is valid JavaScript
 * @param code The code to validate
 * @returns The validated code or throws an error
 */
function validateCode(code: string): string {
  try {
    console.log('[OpenAI Service] Validating extracted code');
    
    // Check if the code contains essential Muze chart elements
    if (!code.includes('muze') || !code.includes('canvas') || !code.includes('mount')) {
      console.warn('[OpenAI Service] Warning: Code may not be valid Muze chart code');
      
      // If it doesn't look like Muze code, wrap it in a basic template
      if (!code.includes('muze.canvas()') && !code.includes('mount("#chart")')) {
        console.log('[OpenAI Service] Wrapping code in basic Muze template');
        return `// Generated code wrapped in template
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

// Original code from AI:
${code}

// If the above code doesn't create a chart, here's a fallback:
if (!document.querySelector('#chart canvas')) {
  muze
    .canvas()
    .data(data)
    .rows(['Category'])
    .columns(['Value'])
    .mount('#chart');
}`;
      }
    }
    
    // Check for common syntax errors
    try {
      // This will throw if there's a syntax error
      new Function(code);
      console.log('[OpenAI Service] Code validation passed');
      return code;
    } catch (error) {
      console.error('[OpenAI Service] Code validation failed:', error);
      // Return the code anyway, but with a warning comment
      return `// Warning: The generated code may contain syntax errors
// Error: ${error instanceof Error ? error.message : 'Unknown error'}
// You may need to fix the code manually

${code}`;
    }
  } catch (error) {
    console.error('[OpenAI Service] Error in code validation:', error);
    return code; // Return the original code in case of error
  }
}

/**
 * Creates a promise that rejects after a specified timeout
 * @param ms Timeout in milliseconds
 * @returns A promise that rejects after the timeout
 */
function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Makes a direct fetch request to Azure OpenAI API with timeout
 * @param query The natural language query
 * @param apiKey The Azure OpenAI API key
 * @param endpoint The Azure OpenAI endpoint
 * @param deploymentId The Azure OpenAI deployment ID
 * @param apiVersion The Azure OpenAI API version
 * @returns An object containing the generated code and chart recommendation
 */
async function callAzureOpenAI(
  query: string,
  apiKey: string,
  endpoint: string,
  deploymentId: string,
  apiVersion: string
): Promise<{ code: string; recommendation: ChartRecommendation | null }> {
  try {
    const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
    
    console.log('[OpenAI Service] Making request to Azure OpenAI:', url);
    
    // Create the fetch promise
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: getCurrentPrompt() },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    // Race the fetch promise against a timeout
    const response = await Promise.race([
      fetchPromise,
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OpenAI Service] Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[OpenAI Service] Azure OpenAI response received');
    
    const generatedContent = data.choices[0]?.message?.content || '';
    const recommendation = extractChartRecommendation(generatedContent);
    const extractedCode = extractCodeFromResponse(generatedContent);
    const validatedCode = validateCode(extractedCode);
    
    return {
      code: validatedCode,
      recommendation
    };
  } catch (error) {
    console.error('[OpenAI Service] Error in Azure OpenAI call:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Generates Muze chart code based on a natural language query using OpenAI
 * @param query The natural language query describing the desired chart
 * @returns An object containing the generated code and chart recommendation
 */
export async function generateChartCode(query: string): Promise<{ code: string; recommendation: ChartRecommendation | null }> {
  try {
    console.log('[OpenAI Service] Generating chart code for query:', query);
    
    // Debug all environment variables
    console.log('[OpenAI Service] Environment variables:', {
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'Exists (not showing for security)' : 'Not found',
      VITE_OPENAI_ENDPOINT: import.meta.env.VITE_OPENAI_ENDPOINT,
      VITE_OPENAI_API_TYPE: import.meta.env.VITE_OPENAI_API_TYPE,
      VITE_OPENAI_DEPLOYMENT_ID: import.meta.env.VITE_OPENAI_DEPLOYMENT_ID,
      VITE_OPENAI_API_VERSION: import.meta.env.VITE_OPENAI_API_VERSION,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = import.meta.env.VITE_OPENAI_ENDPOINT;
    const apiType = import.meta.env.VITE_OPENAI_API_TYPE;
    const deploymentId = import.meta.env.VITE_OPENAI_DEPLOYMENT_ID;
    const apiVersion = import.meta.env.VITE_OPENAI_API_VERSION || '2024-08-01-preview';
    
    console.log('[OpenAI Service] Configuration:', {
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiType,
      endpoint,
      deploymentId,
      apiVersion
    });
    
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    let result: { code: string; recommendation: ChartRecommendation | null } = {
      code: '',
      recommendation: null
    };
    
    try {
      if (apiType === 'azure') {
        if (!endpoint) {
          throw new Error('Azure OpenAI endpoint is not configured. Please set VITE_OPENAI_ENDPOINT in your .env file.');
        }
        
        if (!deploymentId) {
          throw new Error('Azure OpenAI deployment ID is not configured. Please set VITE_OPENAI_DEPLOYMENT_ID in your .env file.');
        }
        
        // Use direct fetch for Azure OpenAI
        result = await callAzureOpenAI(query, apiKey, endpoint, deploymentId, apiVersion);
      } else {
        // For standard OpenAI API
        const openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Only for client-side use
        });
        
        console.log('[OpenAI Service] OpenAI client initialized');
        
        // Create the OpenAI API call promise
        const apiCallPromise = openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: getCurrentPrompt() },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });
        
        // Race the API call against a timeout
        const response = await Promise.race([
          apiCallPromise,
          timeoutPromise(API_TIMEOUT)
        ]);
        
        console.log('[OpenAI Service] Response received from OpenAI');
        
        const rawContent = response.choices[0]?.message?.content || '';
        const recommendation = extractChartRecommendation(rawContent);
        const extractedCode = extractCodeFromResponse(rawContent);
        const validatedCode = validateCode(extractedCode);
        
        result = {
          code: validatedCode,
          recommendation
        };
      }
    } catch (error) {
      console.error('[OpenAI Service] Error during API call:', error);
      
      // Return fallback code in case of API error
      console.log('[OpenAI Service] Using fallback code due to API error');
      return {
        code: `// Error occurred while generating chart code: ${error instanceof Error ? error.message : 'Unknown error'}
// Using fallback chart code instead
${DEFAULT_FALLBACK_CODE}`,
        recommendation: null
      };
    }
    
    if (!result.code || result.code.trim() === '') {
      console.warn('[OpenAI Service] Generated code is empty, using fallback');
      return {
        code: DEFAULT_FALLBACK_CODE,
        recommendation: result.recommendation
      };
    }
    
    console.log('[OpenAI Service] Final generated code length:', result.code.length);
    return result;
  } catch (error) {
    console.error('[OpenAI Service] Error generating chart code:', error);
    console.error('[OpenAI Service] Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Always return fallback code instead of throwing
    return {
      code: `// Error occurred while generating chart code: ${error instanceof Error ? error.message : 'Unknown error'}
// Using fallback chart code instead
${DEFAULT_FALLBACK_CODE}`,
      recommendation: null
    };
  }
} 