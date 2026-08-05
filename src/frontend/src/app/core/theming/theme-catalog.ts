import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export interface ThemeDefinition {
  id: string;
  label: string;
  dark: boolean;
  previewColor: string;
  preset: unknown;
}

function tintedPreset(colorFamily: string, surfaceFamily: string) {
  return definePreset(Aura, {
    semantic: {
      primary: {
        50: `{${colorFamily}.50}`,
        100: `{${colorFamily}.100}`,
        200: `{${colorFamily}.200}`,
        300: `{${colorFamily}.300}`,
        400: `{${colorFamily}.400}`,
        500: `{${colorFamily}.500}`,
        600: `{${colorFamily}.600}`,
        700: `{${colorFamily}.700}`,
        800: `{${colorFamily}.800}`,
        900: `{${colorFamily}.900}`,
        950: `{${colorFamily}.950}`,
      },
      surface: {
        0: '#ffffff',
        50: `{${surfaceFamily}.50}`,
        100: `{${surfaceFamily}.100}`,
        200: `{${surfaceFamily}.200}`,
        300: `{${surfaceFamily}.300}`,
        400: `{${surfaceFamily}.400}`,
        500: `{${surfaceFamily}.500}`,
        600: `{${surfaceFamily}.600}`,
        700: `{${surfaceFamily}.700}`,
        800: `{${surfaceFamily}.800}`,
        900: `{${surfaceFamily}.900}`,
        950: `{${surfaceFamily}.950}`,
      },
    },
  });
}

const CaffeinePreset = tintedPreset('blue', 'blue');
const TokyoPreset = tintedPreset('violet', 'violet');
const DarkwoodPreset = tintedPreset('green', 'green');
const LattePreset = tintedPreset('amber', 'stone');

export const THEMES: ThemeDefinition[] = [
  { id: 'caffeine', label: 'Caffeine', dark: true, previewColor: '#1e3a8a', preset: CaffeinePreset },
  { id: 'aura', label: 'Aura', dark: true, previewColor: '#18181b', preset: Aura },
  { id: 'tokyo', label: 'Tokyo', dark: true, previewColor: '#4c1d95', preset: TokyoPreset },
  { id: 'darkwood', label: 'Darkwood', dark: true, previewColor: '#166534', preset: DarkwoodPreset },
  { id: 'latte', label: 'Latte', dark: false, previewColor: '#f5f5f4', preset: LattePreset },
];

export const DEFAULT_THEME_ID = 'caffeine';

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES.find((theme) => theme.id === DEFAULT_THEME_ID)!;
}
