import FloorGB11 from '../../assets/B11/Floor_G_B11.svg';
import Floor1B11 from '../../assets/B11/Floor_1_B11.svg';
import Floor2B11 from '../../assets/B11/Floor_2_B11.svg';
import Floor3B11 from '../../assets/B11/Floor_3_B11.svg';

import FloorGB8 from '../../assets/B8/Floor_G.svg';
import Floor1B8 from '../../assets/B8/Floor_1.svg';
import Floor2B8 from '../../assets/B8/Floor_2.svg';
import Floor3B8 from '../../assets/B8/Floor_3.svg';

import FloorGB10 from '../../assets/B10/Floor_G.svg';
import Floor1B10 from '../../assets/B10/Floor_1.svg';
import Floor2B10 from '../../assets/B10/Floor_2.svg';
import Floor3B10 from '../../assets/B10/Floor_3.svg';

// viewBox thực tế lấy từ thuộc tính viewBox của mỗi file SVG
export const INDOOR_VIEWBOXES: Record<string, string> = {
  b11: '0 0 3047 797',
  b8: '0 0 2971 786',
  b10: '0 0 2979 804',
};

export const INDOOR_MAPS: Record<string, Record<string, any>> = {
  b11: {
    'G': FloorGB11,
    '1': Floor1B11,
    '2': Floor2B11,
    '3': Floor3B11,
  },
  b8: {
    'G': FloorGB8,
    '1': Floor1B8,
    '2': Floor2B8,
    '3': Floor3B8,
  },
  b10: {
    'G': FloorGB10,
    '1': Floor1B10,
    '2': Floor2B10,
    '3': Floor3B10,
  },
};
