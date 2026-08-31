// Requirements
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { hashEnHtml } from './src/api/helpers/viteHashPlugin.js';


// Constants
const __dirname = dirname(fileURLToPath(import.meta.url));


// Internal
const loadEnvFile = (filePath) => {
    const env = {};
    try {
        const content = readFileSync(filePath, 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
        }
    } catch {
        console.warn(`Could not load env file: ${filePath}`);
    }
    return env;
};


// Exported
export default defineConfig(({ mode }) => {
    const envName = mode === 'production' ? 'production' : 'development';
    const env = loadEnvFile(resolve(__dirname, `./variables/admin.${envName}.env`));

    return {
        root: 'src/admin',
        plugins: [react(), hashEnHtml()],
        build: {
            outDir: resolve(__dirname, 'distribution/admin'),
            emptyOutDir: true,
            assetsDir: '.',
            assetsInlineLimit: 1024 * 1024,
            rollupOptions: {
                output: {
                    entryFileNames: 'admin.index.js',
                    chunkFileNames: 'admin.[name].js',
                    assetFileNames: 'admin.[name][extname]',
                },
            },
        },
        server: {
            host: '127.0.0.1',
            port: 3001,
            open: '/login',
        },
        define: Object.fromEntries(
            Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
        ),
        css: {
            postcss: resolve(__dirname, 'postcss.config.js'),
        },
    };
});
