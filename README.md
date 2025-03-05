# Muze Studio AI

A custom chart creator for ThoughtSpot using Muze. This application allows you to create and preview Muze charts with a live editor and generate charts from natural language descriptions using OpenAI.

## Features

- Interactive code editor with syntax highlighting
- Live chart preview with a "Run" button
- Split-pane interface for easy editing and previewing
- Dark/light mode support
- **Natural language chart generation** using OpenAI

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- OpenAI API key (for natural language chart generation)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mananshah18/muze-studio-ai.git
cd muze-studio-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `VITE_OPENAI_API_KEY=your_api_key_here`
   - You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy from the Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Select "Vite" as the framework preset
6. Add your OpenAI API key as an environment variable:
   - Name: `VITE_OPENAI_API_KEY`
   - Value: Your OpenAI API key
7. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory with environment variables:
```bash
vercel --env VITE_OPENAI_API_KEY=your_api_key_here
```

4. For production deployment:
```bash
vercel --prod --env VITE_OPENAI_API_KEY=your_api_key_here
```

## Usage

### Manual Chart Creation

1. Edit your Muze chart code in the editor on the left
2. Click the "Run" button to see the preview on the right
3. Make sure your code includes a `createChart(container)` function that will be called with the chart container element

### Natural Language Chart Generation

1. Enter a natural language description of the chart you want to create in the search bar at the top
2. Examples:
   - "Create a bar chart showing sales by category"
   - "Show me a line chart of monthly revenue"
   - "Generate a donut chart of market share by region"
3. Click the "Generate Chart" button or press Enter
4. The generated code will appear in the editor and the chart will be rendered in the preview panel

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Muze](https://muzejs.org/) - Data visualization library
- [Split.js](https://split.js.org/) - Resizable split views
- [OpenAI API](https://platform.openai.com/) - Natural language processing

## License

This project is licensed under the MIT License - see the LICENSE file for details.
