import { GirlyThemePreset, CustomColors } from '../types';

export interface ThemePresetOption {
  id: GirlyThemePreset;
  name: string;
  description: string;
  colors: CustomColors;
}

export const GIRLY_THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'coquette-pink',
    name: 'Coquette Baby Pink (Pinterest Default)',
    description: 'Soft ballet pink, romantic blush and creamy pastel vibes',
    colors: {
      primary: '#FF85A1',
      secondary: '#FFC2D1',
      accent: '#E05780',
      backgroundTint: '#FFF0F5',
    },
  },
  {
    id: 'strawberry-milk',
    name: 'Strawberry Milk Shake',
    description: 'Sweet berry punch, rosy glaze and dessert tones',
    colors: {
      primary: '#FF6B8B',
      secondary: '#FFA8BA',
      accent: '#D83A56',
      backgroundTint: '#FFF5F7',
    },
  },
  {
    id: 'lavender-pastel',
    name: 'Pastel Lavender Dream',
    description: 'Aesthetic lilac, dreamy violet and delicate petals',
    colors: {
      primary: '#9D84B7',
      secondary: '#D3BCE4',
      accent: '#7E5A9B',
      backgroundTint: '#F9F5FF',
    },
  },
  {
    id: 'peach-blossom',
    name: 'Peach Bellini Blossom',
    description: 'Warm apricot nectar, golden sunset and cozy coral',
    colors: {
      primary: '#FF9A76',
      secondary: '#FFC4A4',
      accent: '#E65C3B',
      backgroundTint: '#FFF7F2',
    },
  },
  {
    id: 'cherry-glam',
    name: 'Cherry Blossom Glam',
    description: 'Deep raspberry glow, moody magenta and chic pink luxury',
    colors: {
      primary: '#E63946',
      secondary: '#F4A261',
      accent: '#C9184A',
      backgroundTint: '#FFF0F3',
    },
  },
];
