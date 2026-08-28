const fs = require('fs');
const geometryContent = fs.readFileSync('src/utils/floorGeometry.ts', 'utf-8');
const graphContent = fs.readFileSync('src/utils/indoor_graph.ts', 'utf-8');

// A very naive script to just generate the string for missing rooms.
const floorMaps = {
  G: { var: 'B11_G', yDoorTop: 'B11_G1.top', yDoorBot: 'B11_G1.bot' },
  1: { var: 'B11_1', yDoorTop: 'B11_G1.top', yDoorBot: 'B11_G1.bot' },
  2: { var: 'B11_2', yDoorTop: 'B11_23.top', yDoorBot: 'B11_23.bot' },
  3: { var: 'B11_3', yDoorTop: 'B11_23.top', yDoorBot: 'B11_23.bot' },
};

function extractShapes(varName) {
  const startIdx = geometryContent.indexOf(`const ${varName}: FloorShape[] = [`);
  if (startIdx === -1) return [];
  const endIdx = geometryContent.indexOf('];', startIdx);
  const block = geometryContent.slice(startIdx, endIdx);
  
  const shapes = [];
  const regex = /{ id:\s*'([^']+)', type:\s*'([^']+)', x:\s*([\d.]+), y:\s*([\d.]+), w:\s*([\d.]+), h:\s*([\d.]+)(?:, label:\s*'([^']+)')? }/g;
  let match;
  while ((match = regex.exec(block)) !== null) {
    shapes.push({
      id: match[1],
      type: match[2],
      x: parseFloat(match[3]),
      y: parseFloat(match[4]),
      w: parseFloat(match[5]),
      h: parseFloat(match[6]),
      label: match[7]
    });
  }
  return shapes;
}

let newNodes = '';
for (const [floor, config] of Object.entries(floorMaps)) {
  const shapes = extractShapes(config.var);
  const rooms = shapes.filter(s => s.type === 'room');
  
  for (const r of rooms) {
    const roomId = `room_${floor}_${r.id}`;
    if (!graphContent.includes(`'${roomId}'`)) {
      const cx = Math.round(r.x + r.w / 2);
      const cy = Math.round(r.y + r.h / 2);
      
      const isTop = cy < 300; // Top rooms are around y=100
      const doorY = isTop ? config.yDoorTop : config.yDoorBot;
      const doorId = `door_${floor}_${r.id}`;
      
      newNodes += `  '${roomId}': { id:'${roomId}', buildingId:'b11', floor:'${floor}', x:${cx}, y:${cy}, type:'room', label:'Phòng ${r.label || r.id}' },\n`;
      newNodes += `  '${doorId}': { id:'${doorId}', buildingId:'b11', floor:'${floor}', x:${cx}, y:${doorY}, type:'waypoint' },\n`;
    }
  }
}

fs.writeFileSync('missing_b11_nodes.txt', newNodes);
console.log("Done generating missing_b11_nodes.txt");
