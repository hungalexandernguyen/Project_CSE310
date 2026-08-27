const fs = require('fs');
const path = require('path');

const buildings = ['B8', 'B10'];

const getType = (id, fill) => {
  if (!id) return 'room';
  id = id.toLowerCase();
  if (id.includes('hall')) return 'hall';
  if (id.includes('wc')) return 'wc';
  if (id.includes('stair')) return 'stairs';
  if (id.includes('elev')) return 'elevator';
  if (fill === '#AC7F5E' || fill === '#ac7f5e') return 'hall';
  if (fill === '#34C759' || fill === '#34c759' || fill === '#FFCC00' || fill === '#ffcc00') return 'wc';
  if (fill === '#FF383C' || fill === '#ff383c') return 'stairs';
  if (fill === '#FF2D55' || fill === '#ff2d55') return 'elevator';
  return 'room';
};

function parseSvg(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rectRegex = /<rect\s+id="([^"]+)"\s+x="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"(?:\s+transform="rotate\([^"]+\)")?\s+fill="([^"]+)"/g;
  const pathRectRegex = /<path\s+id="([^"]+)"\s+d="M([0-9.]+)\s+([0-9.]+)H([0-9.]+)V([0-9.]+)H([0-9.]+)V([0-9.]+)Z"\s+fill="([^"]+)"/g;
  
  const shapes = [];
  let match;
  
  while ((match = rectRegex.exec(content)) !== null) {
    let x = parseFloat(match[2]);
    let y = parseFloat(match[3]);
    let w = parseFloat(match[4]);
    let h = parseFloat(match[5]);
    
    if (content.includes('transform="rotate(-179') || content.includes('transform="rotate(-180')) {
       x = x - w;
       y = y - h;
    }

    shapes.push({
      originalId: match[1],
      type: getType(match[1], match[6]),
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h)
    });
  }
  
  while ((match = pathRectRegex.exec(content)) !== null) {
    const x1 = Math.round(parseFloat(match[2]));
    const y1 = Math.round(parseFloat(match[3]));
    const x2 = Math.round(parseFloat(match[4]));
    const y2 = Math.round(parseFloat(match[5]));
    
    shapes.push({
      originalId: match[1],
      type: getType(match[1], match[8]),
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.abs(x2 - x1),
      h: Math.abs(y2 - y1)
    });
  }
  
  for (const shape of shapes) {
    if (shape.type === 'room') {
      let label = shape.originalId;
      if (label.includes('_')) label = label.split('_')[0]; // Remove _2, _3 etc
      shape.label = label;
      
      // Ensure unique ID
      shape.id = label + (shape.y < 400 ? '_top' : '_bot');
    } else {
      shape.id = shape.originalId;
    }
  }
  
  // Deduplicate IDs
  const seenIds = new Set();
  const dedupedShapes = [];
  for (const shape of shapes) {
     if (seenIds.has(shape.id)) {
        shape.id = shape.id + '_' + Math.random().toString(36).substr(2, 5);
     }
     seenIds.add(shape.id);
     dedupedShapes.push(shape);
  }
  
  return dedupedShapes;
}

const baseDir = 'd:/project_CSE310/MyCampusApp/assets';
let out = '';

for (const b of buildings) {
  const dir = path.join(baseDir, b);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  
  for (const file of files) {
    const floor = file.replace('.svg', '').replace('Floor_', '');
    const varName = `${b}_${floor}`;
    out += `\nconst ${varName}: FloorShape[] = [\n`;
    
    const shapes = parseSvg(path.join(dir, file));
    
    // Sort shapes: rooms first (top then bottom), then others
    shapes.sort((a, b) => {
       if (a.type === 'room' && b.type === 'room') {
          if (a.y < 400 && b.y >= 400) return -1;
          if (a.y >= 400 && b.y < 400) return 1;
          return b.x - a.x; // Right to left
       }
       if (a.type === 'room') return -1;
       if (b.type === 'room') return 1;
       return 0;
    });
    
    for (const s of shapes) {
      if (s.type === 'room') {
         out += `  { id: '${s.id}', type: '${s.type}', x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h}, label: '${s.label}' },\n`;
      } else {
         out += `  { id: '${s.id}', type: '${s.type}', x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} },\n`;
      }
    }
    
    out += `];\n`;
  }
}

// Replace in floorGeometry.ts
let floorGeoContent = fs.readFileSync('d:/project_CSE310/MyCampusApp/src/utils/floorGeometry.ts', 'utf-8');

// We need to replace the old B8 and B10 arrays
// The arrays start with "const B8_1" and end with "];"
for (const b of buildings) {
  for (const f of ['G', '1', '2', '3']) {
    const varName = `${b}_${f}`;
    const regex = new RegExp(`const ${varName}: FloorShape\\[\\] = \\[\\s*([\\s\\S]*?)\\s*\\];`, 'g');
    
    // Extract what we generated for this varName
    const genRegex = new RegExp(`const ${varName}: FloorShape\\[\\] = \\[[\\s\\S]*?\\];`);
    const genMatch = out.match(genRegex);
    if (genMatch) {
       if (floorGeoContent.match(regex)) {
         floorGeoContent = floorGeoContent.replace(regex, genMatch[0]);
       } else {
         console.log('Could not find', varName, 'in floorGeometry.ts');
       }
    }
  }
}

fs.writeFileSync('d:/project_CSE310/MyCampusApp/src/utils/floorGeometry.ts', floorGeoContent);
console.log('Replaced correctly!');
