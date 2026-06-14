import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-parent-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          
          if (url.includes('/delhivery_network_map.html')) {
            const filePath = path.resolve(__dirname, '../delhivery_network_map.html');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/html');
              res.end(fs.readFileSync(filePath));
              return;
            }
          } 
          
          if (url.includes('/delhivery_interactive_network_IDS.html')) {
            const filePath = path.resolve(__dirname, '../delhivery_interactive_network_IDS.html');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/html');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          
          if (url.includes('/lib/bindings/utils.js')) {
            const filePath = path.resolve(__dirname, '../../backend/lib/bindings/utils.js');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/javascript');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          
          next();
        });
      }
    }
  ],
})

