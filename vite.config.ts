import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'test-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          console.log('Request URL:', req.url);
          
          if (req.url === '/test') {
            console.log('Serving test route');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(`
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>AEF Calculator Test</title>
                  <link rel="stylesheet" href="/src/index.css" />
                </head>
                <body class="bg-gray-100">
                  <div id="root"></div>
                  <script type="module">
                    window.addEventListener('error', (event) => {
                      console.error('Global error:', event.error);
                    });
                  </script>
                  <script type="module" src="/src/test-app.tsx"></script>
                </body>
              </html>
            `.trim());
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  logLevel: 'info',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    css: true,
    mockReset: true,
  },
});
