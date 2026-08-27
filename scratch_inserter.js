const fs = require('fs');

const floorGeoFile = 'd:/project_CSE310/MyCampusApp/src/utils/floorGeometry.ts';
const generatedFile = 'd:/project_CSE310/MyCampusApp/scratch_parser2.ts';

let floorGeoContent = fs.readFileSync(floorGeoFile, 'utf-8');
const generatedContent = fs.readFileSync(generatedFile, 'utf-8');

// Replace "export const B8_1" with "const B8_1"
const newContentToInsert = generatedContent.replace(/export const/g, 'const');

const insertToken = '// ================================================================';
if (floorGeoContent.includes(insertToken)) {
  floorGeoContent = floorGeoContent.replace(insertToken, newContentToInsert + '\n\n' + insertToken);
} else {
  console.log('Error: token not found');
}

// Add to FLOOR_GEOMETRY export
const exportMatch = /export const FLOOR_GEOMETRY: FloorGeometryMap = \{([\s\S]+?)\};/;
const existingExports = floorGeoContent.match(exportMatch)[1];

const newExports = `
  b8: {
    G: B8_G,
    '1': B8_1,
    '2': B8_2,
    '3': B8_3,
  },
  b10: {
    G: B10_G,
    '1': B10_1,
    '2': B10_2,
    '3': B10_3,
  },
`;

floorGeoContent = floorGeoContent.replace(existingExports, existingExports + newExports);

fs.writeFileSync(floorGeoFile, floorGeoContent);
console.log('Inserted geometries and updated export map!');
