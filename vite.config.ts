import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfeApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/main/routes/index.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
});
