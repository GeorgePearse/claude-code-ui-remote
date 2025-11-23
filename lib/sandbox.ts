import { Sandbox } from '@e2b/code-interpreter';

export async function createGraphSandbox(code: string, dependencies: string[], onLog?: (message: string) => void) {
  console.log('Starting sandbox creation...');
  onLog?.('Starting sandbox creation...');
  const sandbox = await Sandbox.create();
  console.log('Sandbox created:', sandbox.sandboxId);
  onLog?.('Sandbox created...');

  // 1. Write package.json
  const packageJson = {
    "name": "graph-app",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "latest",
      "clsx": "latest",
      "tailwind-merge": "latest",
      ...dependencies.reduce((acc, dep) => ({ ...acc, [dep]: "latest" }), {})
    },
    "devDependencies": {
      "@types/react": "^18.2.66",
      "@types/react-dom": "^18.2.22",
      "@vitejs/plugin-react": "^4.2.1",
      "autoprefixer": "^10.4.19",
      "postcss": "^8.4.38",
      "tailwindcss": "^3.4.3",
      "vite": "^5.2.0"
    }
  };

  await sandbox.files.write('/home/user/package.json', JSON.stringify(packageJson, null, 2));

  // 2. Write index.html
  const indexHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Graph App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  await sandbox.files.write('/home/user/index.html', indexHtml);

  // 3. Write vite.config.js
  const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: {
        clientPort: 443
    }
  }
})
`;
  await sandbox.files.write('/home/user/vite.config.js', viteConfig);

  // 4. Setup Tailwind
  await sandbox.files.write('/home/user/tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);

  await sandbox.files.write('/home/user/postcss.config.js', `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

  // 5. Write src/main.tsx
  const mainTsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
  await sandbox.files.makeDir('/home/user/src');
  await sandbox.files.write('/home/user/src/main.tsx', mainTsx);

  // 6. Write src/App.tsx (The Generated Code)
  await sandbox.files.write('/home/user/src/App.tsx', code);

  // 7. Write src/index.css
  await sandbox.files.write('/home/user/src/index.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;
  `);

  // 8. Install dependencies
  console.log('Installing dependencies...');
  onLog?.('Installing dependencies... (this may take a minute)');
  await sandbox.commands.run('npm install', {
    onStdout: (text) => onLog?.(text),
    onStderr: (text) => onLog?.(text),
  });

  // 9. Start Vite
  console.log('Starting dev server...');
  onLog?.('Starting dev server...');
  await sandbox.commands.run('npm run dev -- --host', { background: true });
  
  // 10. Get URL
  const url = `https://${sandbox.getHost(5173)}`;
  console.log('Sandbox URL:', url);

  return url;
}
