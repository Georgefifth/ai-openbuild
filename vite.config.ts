import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { queryLiveNhtsaData } from './api/nhtsa';

function nhtsaLocalApiPlugin() {
  const middleware = async (
    req: { url?: string; method?: string },
    res: {
      statusCode: number;
      setHeader: (k: string, v: string) => void;
      end: (b: string) => void;
    },
    next: () => void
  ) => {
    if (!req.url || !req.url.startsWith('/api/nhtsa')) {
      return next();
    }
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const payload = await queryLiveNhtsaData({
        vin: urlObj.searchParams.get('vin') || '',
        year: urlObj.searchParams.get('year') || '2020',
        make: urlObj.searchParams.get('make') || 'HONDA',
        model: urlObj.searchParams.get('model') || 'CR-V'
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'NHTSA error' }));
    }
  };

  return {
    name: 'nhtsa-local-api',
    configureServer(server: { middlewares: { use: (fn: typeof middleware) => void } }) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof middleware) => void } }) {
      server.middlewares.use(middleware);
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nhtsaLocalApiPlugin()],
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
});
