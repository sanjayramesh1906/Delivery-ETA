import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, 'public');

// Source paths
const map1Source = path.resolve(__dirname, '../delhivery_network_map.html');
const map2Source = path.resolve(__dirname, '../delhivery_interactive_network_IDS.html');
const utilsSource = path.resolve(__dirname, '../../backend/lib/bindings/utils.js');

// Destination paths
const map1Dest = path.resolve(publicDir, 'delhivery_network_map.html');
const map2Dest = path.resolve(publicDir, 'delhivery_interactive_network_IDS.html');
const utilsDest = path.resolve(publicDir, 'lib/bindings/utils.js');

// Ensure destination directories exist
fs.mkdirSync(path.dirname(utilsDest), { recursive: true });

// Copy files
try {
  if (fs.existsSync(map1Source)) {
    fs.copyFileSync(map1Source, map1Dest);
    console.log('Copied delhivery_network_map.html to public/');
  } else {
    console.warn('Warning: delhivery_network_map.html not found at', map1Source);
  }

  if (fs.existsSync(map2Source)) {
    fs.copyFileSync(map2Source, map2Dest);
    console.log('Copied delhivery_interactive_network_IDS.html to public/');
  } else {
    console.warn('Warning: delhivery_interactive_network_IDS.html not found at', map2Source);
  }

  if (fs.existsSync(utilsSource)) {
    fs.copyFileSync(utilsSource, utilsDest);
    console.log('Copied utils.js to public/lib/bindings/');
  } else {
    console.warn('Warning: utils.js not found at', utilsSource);
  }
} catch (error) {
  console.error('Error copying assets:', error);
}
