import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/iss-now': {
          target: 'http://api.open-notify.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/iss-now/, '/iss-now.json')
        },
        '/api/astros': {
          target: 'http://api.open-notify.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/astros/, '/astros.json')
        },
        '/api/news': {
          target: 'https://newsapi.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/news/, '/v2/top-headlines')
        }
      }
    },
  };
});
