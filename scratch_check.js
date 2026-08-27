const fs = require('fs');

const files = [
  'assets/B10/Floor_G.svg',
  'assets/B10/Floor_2.svg',
  'assets/B10/Floor_3.svg',
];

for (const file of files) {
  console.log('=== ' + file + ' ===');
  const content = fs.readFileSync(file, 'utf-8');
  
  // Find all elements with id and fill
  const tagRegex = /<(?:rect|path)\s+([^>]+)\/?>/g;
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    const attrs = m[1];
    const idMatch = attrs.match(/(?:^|\s)id="([^"]+)"/);
    const fillMatch = attrs.match(/(?:^|\s)fill="([^"]+)"/);
    if (idMatch && fillMatch) {
      const id = idMatch[1];
      const fill = fillMatch[1];
      // Only show room-colored elements
      if (fill === '#FF8D28') {
        console.log('  ROOM: id=' + id + ' fill=' + fill);
      }
    }
  }
  console.log('');
}
