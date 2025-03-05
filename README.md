# Muze Studio AI

A custom chart creator for ThoughtSpot using Muze. This application allows you to create and preview Muze charts with a live editor.

## Features

- Interactive code editor with syntax highlighting
- Live chart preview with a "Run" button
- Split-pane interface for easy editing and previewing
- Dark/light mode support

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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy from the Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Select "Vite" as the framework preset
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

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

## Usage

1. Edit your Muze chart code in the editor on the left
2. Click the "Run" button to see the preview on the right
3. Make sure your code includes a `createChart(container)` function that will be called with the chart container element

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Muze](https://muzejs.org/) - Data visualization library
- [Split.js](https://split.js.org/) - Resizable split views

## License

This project is licensed under the MIT License - see the LICENSE file for details.
