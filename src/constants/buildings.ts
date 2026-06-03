export type Building = {
  id: string;
  title: string;       // Short code shown on marker pin
  label: string;       // Full display name shown in the list
  coordinate: { latitude: number; longitude: number };
  description: string;
};

export const BUILDINGS: Building[] = [
  {
    id: 'b3',
    title: 'B3',
    label: 'Block 3',
    coordinate: { latitude: 11.05251, longitude: 106.667652 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'b8',
    title: 'B8',
    label: 'Block 8',
    coordinate: { latitude: 11.054710, longitude: 106.666477 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'b9',
    title: 'B9',
    label: 'Block 9',
    coordinate: { latitude: 11.054120, longitude: 106.664998 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'b10',
    title: 'B10',
    label: 'Block 10',
    coordinate: { latitude: 11.053615, longitude: 106.665175 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'b11',
    title: 'B11',
    label: 'Block 11 (IT)',
    coordinate: { latitude: 11.054111, longitude: 106.666735 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'canteen',
    title: 'CANTEEN',
    label: 'Canteen',
    coordinate: { latitude: 11.055053, longitude: 106.667248 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'library',
    title: 'LIBRARY',
    label: 'Library',
    coordinate: { latitude: 11.053667, longitude: 106.667484 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'recruit',
    title: 'recruit',
    label: 'Recruitment Office',
    coordinate: { latitude: 11.052054, longitude: 106.667976 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'parking',
    title: 'PARKING',
    label: 'Parking Zone 1',
    coordinate: { latitude: 11.05399, longitude: 106.667718 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'parking2',
    title: 'PARKING2',
    label: 'Parking Zone 2',
    coordinate: { latitude: 11.05218, longitude: 106.668420 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'parking3',
    title: 'PARKING3',
    label: 'Parking Zone 3',
    coordinate: { latitude: 11.054900, longitude: 106.664941 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
  {
    id: 'parking4',
    title: 'PARKING4',
    label: 'Parking Zone 4',
    coordinate: { latitude: 11.055177, longitude: 106.666398 },
    description: 'Trường Đại học Quốc tế Miền Đông',
  },
];
