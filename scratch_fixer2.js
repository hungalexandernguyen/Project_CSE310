const fs = require('fs');
const path = require('path');

const ROOM_FILL = '#FF8D28';
const HALL_FILL = '#AC7F5E';
const WC_FILLS  = ['#34C759', '#FFCC00'];
const STAIR_FILL = '#FF383C';
const ELEV_FILL  = '#FF2D55';

function getTypeFromFill(fill) {
  if (!fill) return null;
  fill = fill.toUpperCase();
  if (fill === HALL_FILL) return 'hall';
  if (WC_FILLS.includes(fill)) return 'wc';
  if (fill === STAIR_FILL) return 'stairs';
  if (fill === ELEV_FILL)  return 'elevator';
  if (fill === ROOM_FILL)  return 'room';
  return null; 
}

function cleanId(rawId) {
  return rawId.replace(/_\d+$/, '');
}

function parseSvg(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const shapes = [];
  
  // A helper to extract attributes without requiring a leading space
  const getAttr = (str, attr) => {
    const regex = new RegExp(`(?:^|\\s)${attr}="([^"]+)"`);
    const match = str.match(regex);
    return match ? match[1] : null;
  };

  const rectTagRegex = /<rect\s+([^>]+)\/?>/g;
  let m;
  while ((m = rectTagRegex.exec(content)) !== null) {
    const attrs = m[1];
    const id = getAttr(attrs, 'id');
    const fill = getAttr(attrs, 'fill');
    if (!id || !fill) continue;
    
    const type = getTypeFromFill(fill);
    if (!type) continue;
    
    let x = parseFloat(getAttr(attrs, 'x')) || 0;
    let y = parseFloat(getAttr(attrs, 'y')) || 0;
    let w = parseFloat(getAttr(attrs, 'width')) || 0;
    let h = parseFloat(getAttr(attrs, 'height')) || 0;
    
    const transform = getAttr(attrs, 'transform');
    if (transform && transform.startsWith('matrix')) {
      const matchMat = transform.match(/matrix\(([^)]+)\)/);
      if (matchMat) {
        const parts = matchMat[1].split(/[ ,]+/).map(parseFloat);
        const [a, b, c, d, e, f] = parts;
        const pts = [
          { px: x, py: y },
          { px: x + w, py: y },
          { px: x, py: y + h },
          { px: x + w, py: y + h }
        ].map(p => ({
          x: a * p.px + c * p.py + e,
          y: b * p.px + d * p.py + f
        }));
        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
        x = Math.min(...xs);
        y = Math.min(...ys);
        w = Math.max(...xs) - x;
        h = Math.max(...ys) - y;
      }
    } else if (transform && transform.startsWith('rotate')) {
       const matchRot = transform.match(/rotate\(([^)]+)\)/);
       if (matchRot) {
         const parts = matchRot[1].split(/[ ,]+/).map(parseFloat);
         if (parts.length === 3 && Math.abs(parts[0]) > 170) {
            const [deg, cx, cy] = parts;
            x = cx - (x + w - cx);
            y = cy - (y + h - cy);
         }
       }
    }

    shapes.push({
      rawId: id,
      type,
      x: Math.round(x), y: Math.round(y),
      w: Math.round(w), h: Math.round(h),
    });
  }
  
  const pathTagRegex = /<path\s+([^>]+)\/?>/g;
  while ((m = pathTagRegex.exec(content)) !== null) {
    const attrs = m[1];
    const id = getAttr(attrs, 'id');
    const fill = getAttr(attrs, 'fill');
    if (!id || !fill) continue;
    
    const type = getTypeFromFill(fill);
    if (!type) continue; 
    
    const d = getAttr(attrs, 'd');
    if (!d) continue;

    const coords = d.match(/-?[0-9.]+/g);
    if (coords && coords.length >= 4) {
      let xs = [];
      let ys = [];
      let currentX = 0, currentY = 0;
      let cmds = d.match(/[MLHVZ][^MLHVZ]*/gi) || [];
      
      for (const cmdStr of cmds) {
         const cmd = cmdStr[0].toUpperCase();
         const nums = (cmdStr.slice(1).match(/-?[0-9.]+/g) || []).map(parseFloat);
         if (cmd === 'M' || cmd === 'L') {
            for (let i = 0; i < nums.length; i+=2) {
               currentX = nums[i];
               currentY = nums[i+1];
               xs.push(currentX); ys.push(currentY);
            }
         } else if (cmd === 'H') {
            if (nums.length > 0) {
                currentX = nums[0];
                xs.push(currentX);
            }
         } else if (cmd === 'V') {
            if (nums.length > 0) {
                currentY = nums[0];
                ys.push(currentY);
            }
         }
      }
      
      if (xs.length > 0 && ys.length > 0) {
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        shapes.push({
          rawId: id,
          type,
          x: Math.round(minX),
          y: Math.round(minY),
          w: Math.round(maxX - minX),
          h: Math.round(maxY - minY),
        });
      }
    }
  }
  
  // Filter out WC text labels (small path-based text, not real WC rooms)
  // Real WC rooms are at least 150px wide; text labels are ~100x50px
  const filtered = shapes.filter(s => {
    if (s.type === 'wc' && s.w < 150 && s.h < 100) return false;
    return true;
  });

  const usedIds = new Set();
  for (const s of filtered) {
    if (s.type === 'room') {
      s.label = cleanId(s.rawId);
      const suffix = s.y < 400 ? '_top' : '_bot';
      let id = s.label + suffix;
      if (usedIds.has(id)) id += '_' + Math.random().toString(36).substr(2, 4);
      usedIds.add(id);
      s.id = id;
    } else {
      s.id = s.rawId;
      if (usedIds.has(s.id)) s.id += '_' + Math.random().toString(36).substr(2, 4);
      usedIds.add(s.id);
    }
  }
  
  return filtered;
}

const buildings = ['B8', 'B10'];
const baseDir = 'd:/project_CSE310/MyCampusApp/assets';
const results = {};

for (const b of buildings) {
  const dir = path.join(baseDir, b);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  for (const file of files) {
    const floor = file.replace('.svg', '').replace('Floor_', '');
    const varName = `${b}_${floor}`;
    const shapes = parseSvg(path.join(dir, file));
    
    shapes.sort((a, bb) => {
      const order = { room: 0, hall: 1, wc: 2, stairs: 3, elevator: 4 };
      if (order[a.type] !== order[bb.type]) return order[a.type] - order[bb.type];
      if (a.type === 'room' && bb.type === 'room') {
        if (a.y < 400 && bb.y >= 400) return -1;
        if (a.y >= 400 && bb.y < 400) return 1;
        return bb.x - a.x;
      }
      return 0;
    });
    
    results[varName] = shapes;
  }
}

let geo = fs.readFileSync('d:/project_CSE310/MyCampusApp/src/utils/floorGeometry.ts', 'utf-8');

for (const [varName, shapes] of Object.entries(results)) {
  let block = `const ${varName}: FloorShape[] = [\n`;
  for (const s of shapes) {
    if (s.type === 'room') {
      block += `  { id: '${s.id}', type: '${s.type}', x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h}, label: '${s.label}' },\n`;
    } else {
      block += `  { id: '${s.id}', type: '${s.type}', x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} },\n`;
    }
  }
  block += `]`;
  
  const regex = new RegExp(`const ${varName}: FloorShape\\[\\] = \\[[\\s\\S]*?\\]`);
  if (geo.match(regex)) {
    geo = geo.replace(regex, block);
    console.log(`Replaced ${varName} (${shapes.length} shapes)`);
  } else {
    console.log(`NOT FOUND: ${varName}`);
  }
}

fs.writeFileSync('d:/project_CSE310/MyCampusApp/src/utils/floorGeometry.ts', geo);
console.log('\\nDone!');
