const fs = require('fs');
let c = fs.readFileSync('src/utils/floorGeometry.ts', 'utf-8');

c = c.replace(/id: '210_top', type: 'room', x: 1504, y: 0, w: 1080, h: 191, label: '210'/, "id: '103_top', type: 'room', x: 1504, y: 0, w: 1080, h: 191, label: '103'");
c = c.replace(/id: '211_top', type: 'room', x: 386, y: 0, w: 1032, h: 191, label: '211'/, "id: '101_top', type: 'room', x: 386, y: 0, w: 1032, h: 191, label: '101'");

c = c.replace(/id: '212_bot', type: 'room', x: 2436, y: 586, w: 232, h: 186, label: '212'/, "id: '108_bot', type: 'room', x: 2436, y: 586, w: 232, h: 186, label: '108'");
c = c.replace(/id: '108_bot', type: 'room', x: 1504, y: 585, w: 934, h: 186, label: '108'/, "id: '106_bot', type: 'room', x: 1504, y: 585, w: 934, h: 186, label: '106'");

c = c.replace(/id: '313_top', type: 'room', x: 2352, y: 24, w: 244, h: 202, label: '313'/, "id: '311_top', type: 'room', x: 2352, y: 24, w: 244, h: 202, label: '311'");
c = c.replace(/id: '311_top', type: 'room', x: 2084, y: 19, w: 268, h: 202, label: '311'/, "id: '309_top', type: 'room', x: 2084, y: 19, w: 268, h: 202, label: '309'");

fs.writeFileSync('src/utils/floorGeometry.ts', c);
console.log('Fixed labels!');
