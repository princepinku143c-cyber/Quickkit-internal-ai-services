
import path from 'path';
import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const forbiddenGeminiEnvNames = ['GEMINI_API_KEY', 'API_KEY', 'VITE_GEMINI_API_KEY', 'VITE_API_KEY'];
    const configuredGeminiEnvNames = forbiddenGeminiEnvNames.filter((name) => {
      const value = env[name] || process.env[name];
      return typeof value === 'string' && value.trim().length > 0;
    });
    if (configuredGeminiEnvNames.length > 0) {
      throw new Error(
        `Refusing to build a browser bundle with Gemini credential environment variable(s): ${configuredGeminiEnvNames.join(', ')}. Use the in-app Credential Vault (BYO key) or an authenticated server-side proxy.`
      );
    }
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        chunkSizeWarningLimit: 900,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
              icons: ['lucide-react'],
            },
          },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});