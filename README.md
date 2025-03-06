# Muze Studio AI

A custom chart creator for ThoughtSpot using Muze. This application allows you to create and preview Muze charts with a live editor and integrates with the ThoughtSpot Charts SDK.

## Features

- Interactive code editor with syntax highlighting
- Live chart preview with a "Run" button
- Split-pane interface for easy editing and previewing
- Dark/light mode support
- Natural language chart generation with OpenAI
- ThoughtSpot Charts SDK integration
- Chart recommendation with detailed configuration

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

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

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key and other configuration

```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## ThoughtSpot Integration

This application integrates with the ThoughtSpot Charts SDK to allow you to create custom charts that can be used in ThoughtSpot.

### Using ThoughtSpot Data

1. Toggle the "Use ThoughtSpot Data" switch in the UI
2. The chart will be rendered using sample ThoughtSpot data
3. In a real ThoughtSpot environment, the data would come from your ThoughtSpot instance

### ThoughtSpot SDK Features

- Mock ThoughtSpot context for testing
- Data transformation utilities
- Schema generation for Muze
- Event handling for ThoughtSpot integration

## Natural Language Chart Generation

1. Enter a description of the chart you want to create in the input field
2. Click "Generate Chart" to use OpenAI to generate the chart code
3. The application will provide a chart recommendation with:
   - Recommended chart type
   - Rationale for the recommendation
   - Configuration details (axes, layers, encodings)
4. The generated code will be displayed in the editor and can be further customized

## Deployment to Vercel

### Option 1: Using the Deployment Script

1. Make sure the deployment script is executable:
```bash
chmod +x deploy.sh
```

2. Run the deployment script:
```bash
./deploy.sh
```

### Option 2: Deploy from the Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - Add all variables from your `.env` file to the Vercel project settings
6. Click "Deploy"

### Option 3: Deploy using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_OPENAI_API_KEY | Your OpenAI API key | Yes |
| VITE_OPENAI_API_TYPE | Set to "azure" if using Azure OpenAI | No |
| VITE_OPENAI_ENDPOINT | Azure OpenAI endpoint URL | Only for Azure |
| VITE_OPENAI_DEPLOYMENT_ID | Azure OpenAI deployment ID | Only for Azure |
| VITE_OPENAI_API_VERSION | Azure OpenAI API version | Only for Azure |
| VITE_THOUGHTSPOT_HOST | ThoughtSpot instance URL | For production |
| VITE_THOUGHTSPOT_AUTH_TOKEN | ThoughtSpot authentication token | For production |

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Muze](https://muzejs.org/) - Data visualization library
- [Split.js](https://split.js.org/) - Resizable split views
- [OpenAI](https://openai.com/) - Natural language processing
- [ThoughtSpot Charts SDK](https://developers.thoughtspot.com/docs/?pageid=custom-chart-sdk) - Custom chart integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
