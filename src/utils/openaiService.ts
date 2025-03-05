// OpenAI Service

import OpenAI from 'openai';

// Import OpenAI types manually since we're using it in the browser
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// System prompt for the OpenAI API (shortened for simplicity)
const SYSTEM_PROMPT = `You are an expert in generating JavaScript code using the Muze library for creating data visualizations. Always use the ThoughtSpot data model integration and follow the Muze API. Always begin your code with:
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

Then create a chart using methods like .rows(), .columns(), .layers(), .data(), and .mount("#chart").`;

/**
 * Processes the OpenAI response to extract only the code part
 * @param response The raw response from OpenAI
 * @returns The extracted code
 */
function extractCodeFromResponse(response: string): string {
  // If the response is already just code, return it as is
  if (response.trim().startsWith('const') || response.trim().startsWith('// Get')) {
    return response;
  }
  
  // Try to extract code blocks
  const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)```/;
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code block found, return the original response
  return response;
}

/**
 * Generates Muze chart code based on a natural language query using OpenAI
 * @param query The natural language query describing the desired chart
 * @returns The generated Muze chart code
 */
export async function generateChartCode(query: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for client-side use
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    const generatedCode = response.choices[0]?.message?.content || '';
    return extractCodeFromResponse(generatedCode);
  } catch (error) {
    console.error('Error generating chart code:', error);
    throw new Error('Failed to generate chart code. Please try again.');
  }
}
