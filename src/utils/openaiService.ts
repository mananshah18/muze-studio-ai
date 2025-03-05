// Import OpenAI types manually since we're using it in the browser
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message?: {
    content: string;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

// Mock OpenAI client for development
// In production, you would use the actual OpenAI client
const openai = {
  chat: {
    completions: {
      create: async (options: {
        model: string;
        messages: OpenAIMessage[];
        temperature: number;
        max_tokens: number;
      }): Promise<OpenAIResponse> => {
        console.log('OpenAI API call with:', options);
        
        // For development, return a mock response
        // In production, this would be an actual API call
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
          console.warn('No valid API key found. Using mock response.');
          return mockOpenAIResponse(options.messages[options.messages.length - 1].content);
        }
        
        try {
          // In production, make the actual API call
          // For now, we'll use a mock response
          return mockOpenAIResponse(options.messages[options.messages.length - 1].content);
        } catch (error) {
          console.error('Error calling OpenAI API:', error);
          throw new Error('Failed to call OpenAI API');
        }
      }
    }
  }
};

// Mock response function for development
function mockOpenAIResponse(query: string): OpenAIResponse {
  // Simple mock response based on the query
  let mockCode = '';
  
  if (query.toLowerCase().includes('bar chart')) {
    mockCode = `// Get the Muze library and data function
const { muze, getDataFromSearchQuery } = viz;

// Get data from ThoughtSpot
const data = getDataFromSearchQuery();

// Create and configure the chart
muze.canvas()
  .rows(["Sales"])
  .columns(["Category"])
  .layers([
    {
      mark: "bar",
      encoding: {
        color: "Category"
      }
    }
  ])
  .data(data)
  .mount("#chart");`;
  } else if (query.toLowerCase().includes('line chart')) {
    mockCode = `// Get the Muze library and data function
const { muze, getDataFromSearchQuery } = viz;

// Get data from ThoughtSpot
const data = getDataFromSearchQuery();

// Create and configure the chart
muze.canvas()
  .rows(["Sales"])
  .columns(["Month"])
  .layers([
    {
      mark: "line",
      encoding: {
        color: "Category"
      }
    }
  ])
  .data(data)
  .mount("#chart");`;
  } else {
    mockCode = `// Get the Muze library and data function
const { muze, getDataFromSearchQuery } = viz;

// Get data from ThoughtSpot
const data = getDataFromSearchQuery();

// Create and configure the chart
muze.canvas()
  .rows(["Category"])
  .columns(["Total Sales"])
  .data(data)
  .mount("#chart");`;
  }
  
  return {
    choices: [
      {
        message: {
          content: mockCode
        }
      }
    ]
  };
}

// System prompt for the OpenAI API
const SYSTEM_PROMPT = `Introduction: You are an expert in generating JavaScript code using the Muze library for creating exploratory data visualizations within ThoughtSpot's environment. Your output must always use the ThoughtSpot data model integration and follow the Muze API as documented on https://cyoc-documentation-site.vercel.app/muze/toc. Do not create sample data; always retrieve data via ThoughtSpot's helper function. Use the examples below as templates and adapt based on user input.

Core Concepts:
DataModel Purpose: The DataModel is Muze's foundation for data retrieval and transformation. In our setup, no sample data is generated. Instead, always fetch data from ThoughtSpot using the provided helper.
Usage: Always begin your code with:
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

Then, if needed, define a schema (an example is shown below):
const schema = [
  { name: 'YourDimension', type: 'dimension' },
  { name: 'YourMeasure', type: 'measure', defAggFn: 'sum' }
];
const DataModel = muze.DataModel;
const dm = new DataModel(data, schema);

Reference: https://cyoc-documentation-site.vercel.app/muze/data-model

Layers Purpose: Layers define how the data is visually represented (e.g., as columns, lines, areas, etc.) and allow stacking or overlaying of elements.
Reference: https://cyoc-documentation-site.vercel.app/muze/layers

Axes (Rows and Columns) Purpose: Axes bind fields to the chart's rows (Y‑axis) and columns (X‑axis), enabling layout configuration.
Reference: https://cyoc-documentation-site.vercel.app/muze/axes

Encodings (Color, Size, Shape) Purpose: Encodings visually differentiate data by mapping fields to attributes such as color, size, or shape.
Reference: https://cyoc-documentation-site.vercel.app/muze/encodings

Interactivity Purpose: Enables events (e.g., click, hover) and cross-chart interactions.
Reference: https://cyoc-documentation-site.vercel.app/muze/interactivity

Environment Purpose: The Environment object enables sharing of global configurations (themes, layouts) among charts.
Reference: https://cyoc-documentation-site.vercel.app/muze/environment

Styling Purpose: Customize chart appearance via CSS classes or external stylesheets.
Reference: https://cyoc-documentation-site.vercel.app/muze/styling

Chart Examples:
Example 1: Hundred Percent Stacked Area Chart
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Stacked-Area-Chart
  const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();
  
  const ColumnField = "Year";
  const RowField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .color(ColorField)
    .layers([
      {
        mark: "area",
        transform: { 
          type: "stack",
        },
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart

Example 2: Stacked Bar Chart
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Stacked-Bar-Chart
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Year";
  const RowField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .layers([
      {
        mark: "bar",
        encoding:{
          color: ColorField,
        },
        transform: { 
          type: "stack",
        },
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart

Example 3: Donut Chart
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Donut-Chart
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();
  
  const AngleField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .layers([
      {
        mark: "arc",
        encoding: {
          angle: AngleField,
          radius: {
            range: function range(_range) {
              return [_range[0] + 100, _range[1]];
            },
          },
        },
      },
    ])
    .color(ColorField)
    .data(data)
    .mount("#chart") // mount your chart`;

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