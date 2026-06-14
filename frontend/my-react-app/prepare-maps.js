import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const majorHubIds = new Set([
  'IND000000ACB', 'IND562132AAA', 'IND501359AAE', 'IND712311AAA',
  'IND160002AAC', 'IND411033AAA', 'IND131028AAB', 'IND209304AAA',
  'IND302014AAA', 'IND382430AAB', 'IND462022AAA', 'IND751002AAB',
  'IND000000ACA', 'IND521225AAB', 'IND474003AAA', 'IND248001AAA',
  'IND125001AAA'
]);

const majorCoords = {
  'IND000000ACB': { x: 450, y: 740 }, // Bengaluru Hub
  'IND562132AAA': { x: 310, y: 560 }, // Mumbai Linehaul Hub
  'IND501359AAE': { x: 480, y: 600 }, // Hyderabad Central
  'IND712311AAA': { x: 740, y: 440 }, // Kolkata Gateway
  'IND160002AAC': { x: 430, y: 180 }, // Chandigarh Dispatch
  'IND411033AAA': { x: 340, y: 580 }, // Pune Fulfillment
  'IND131028AAB': { x: 435, y: 250 }, // Sonipat Linehaul
  'IND209304AAA': { x: 530, y: 330 }, // Kanpur Center
  'IND302014AAA': { x: 350, y: 320 }, // Jaipur Sorting
  'IND382430AAB': { x: 270, y: 460 }, // Ahmedabad Hub
  'IND462022AAA': { x: 450, y: 460 }, // Bhopal Distribution
  'IND751002AAB': { x: 670, y: 530 }, // Bhubaneswar Delivery
  'IND000000ACA': { x: 500, y: 760 }, // Chennai Hub
  'IND521225AAB': { x: 510, y: 650 }, // Vijayawada Center
  'IND474003AAA': { x: 460, y: 360 }, // Gwalior Gateway
  'IND248001AAA': { x: 480, y: 160 }, // Dehradun Delivery
  'IND125001AAA': { x: 390, y: 240 }  // Hisar Sorting
};

function filterHtmlNetworkData(content) {
  // 1. Filter Nodes
  const nodesMatchStart = 'nodes = new vis.DataSet(';
  const nodesStartIdx = content.indexOf(nodesMatchStart);
  if (nodesStartIdx !== -1) {
    const jsonStart = nodesStartIdx + nodesMatchStart.length;
    const nodesEndIdx = content.indexOf(');', jsonStart);
    if (nodesEndIdx !== -1) {
      const jsonStr = content.substring(jsonStart, nodesEndIdx);
      try {
        let originalNodes;
        try {
          originalNodes = JSON.parse(jsonStr);
        } catch (e) {
          originalNodes = new Function("return " + jsonStr)();
        }
        
        if (Array.isArray(originalNodes)) {
          const filteredNodes = originalNodes
            .filter(node => node && typeof node === 'object' && majorHubIds.has(node.id))
            .map(node => {
              const coords = majorCoords[node.id];
              return {
                ...node,
                x: coords ? coords.x : 250,
                y: coords ? coords.y : 250,
                fixed: { x: true, y: true },
                font: { size: 14, color: '#f3f4f6', face: 'system-ui' }
              };
            });
          const newNodesStr = JSON.stringify(filteredNodes);
          content = content.substring(0, jsonStart) + newNodesStr + content.substring(nodesEndIdx);
        }
      } catch (e) {
        console.error('Error pre-filtering nodes:', e);
      }
    }
  }

  // 2. Filter Edges
  const edgesMatchStart = 'edges = new vis.DataSet(';
  const edgesStartIdx = content.indexOf(edgesMatchStart);
  if (edgesStartIdx !== -1) {
    const jsonStart = edgesStartIdx + edgesMatchStart.length;
    const edgesEndIdx = content.indexOf(');', jsonStart);
    if (edgesEndIdx !== -1) {
      const jsonStr = content.substring(jsonStart, edgesEndIdx);
      try {
        let originalEdges;
        try {
          originalEdges = JSON.parse(jsonStr);
        } catch (e) {
          originalEdges = new Function("return " + jsonStr)();
        }
        
        if (Array.isArray(originalEdges)) {
          const filteredEdges = originalEdges
            .filter(edge => edge && typeof edge === 'object' && majorHubIds.has(edge.from) && majorHubIds.has(edge.to))
            .map(edge => ({
              ...edge,
              width: 3,
              color: { color: 'rgba(56, 189, 248, 0.45)', hover: '#38BDF8', highlight: '#F97316' },
              smooth: { type: 'curvedCW', roundness: 0.15 }
            }));
          const newEdgesStr = JSON.stringify(filteredEdges);
          content = content.substring(0, jsonStart) + newEdgesStr + content.substring(edgesEndIdx);
        }
      } catch (e) {
        console.error('Error pre-filtering edges:', e);
      }
    }
  }

  return content;
}

function processFile(srcName, destName) {
  const srcPath = path.resolve(__dirname, '../', srcName);
  const destPath = path.resolve(__dirname, 'public', destName);
  
  // Ensure public folder exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcPath)) {
    console.log(`Processing and copying ${srcName} -> ${destName}`);
    let content = fs.readFileSync(srcPath, 'utf-8');
    
    // Filter nodes/edges
    content = filterHtmlNetworkData(content);
    
    // Inject client-side trigger
    content = content.replace('data = {nodes: nodes, edges: edges};', 'if (typeof positionNodesLikeIndiaMap === "function") { positionNodesLikeIndiaMap(); }\n                  data = {nodes: nodes, edges: edges};');
    
    // Disable physics
    content = content.replace(/"physics":\s*\{\s*"enabled":\s*true/, '"physics": {\n        "enabled": false');
    
    // Hide progress bar in CSS
    content = content.replace(/#loadingBar\s*\{/, '#loadingBar {\n                 display: none;');
    
    // Hide progress bar in JS
    content = content.replace(/var\s+container\s*=\s*document\.getElementById\(\s*['"]mynetwork['"]\s*\)\s*;/, 'var container = document.getElementById(\'mynetwork\');\n                  if (document.getElementById(\'loadingBar\')) { document.getElementById(\'loadingBar\').style.display = \'none\'; }');
    
    fs.writeFileSync(destPath, content, 'utf-8');
  } else {
    console.warn(`Source file not found: ${srcPath}`);
  }
}

// 1. Process network maps into public/
processFile('delhivery_network_map.html', 'delhivery_network_map.html');
processFile('delhivery_interactive_network_IDS.html', 'delhivery_interactive_network_IDS.html');

// 2. Copy utils.js into public/lib/bindings/
const utilsSrc = path.resolve(__dirname, '../../backend/lib/bindings/utils.js');
const utilsDest = path.resolve(__dirname, 'public/lib/bindings/utils.js');

const utilsDestDir = path.dirname(utilsDest);
if (!fs.existsSync(utilsDestDir)) {
  fs.mkdirSync(utilsDestDir, { recursive: true });
}

if (fs.existsSync(utilsSrc)) {
  console.log(`Copying utils.js -> public/lib/bindings/utils.js`);
  fs.copyFileSync(utilsSrc, utilsDest);
} else {
  console.warn(`utils.js not found at ${utilsSrc}`);
}
console.log('Static map preparation completed successfully.');
