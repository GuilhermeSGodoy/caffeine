import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export interface ThemeDefinition {
  id: string;
  label: string;
  dark: boolean;
  previewColor: string;
  pageSurroundColor: string;
  preset: unknown;
}

const TREE_ICON_MATCHES_LABEL = {
  components: {
    tree: {
      nodeIcon: { color: '{text.color}', hoverColor: '{text.hover.color}', selectedColor: '{highlight.color}' },
      nodeToggleButton: { color: '{text.color}', hoverColor: '{text.hover.color}' },
    },
  },
};

function tintedPreset(colorFamily: string, surfaceFamily: string, darkenSurface: boolean) {
  const darkestSurfaceShade = darkenSurface ? `{${surfaceFamily}.950}` : undefined;
  const textOverride = darkenSurface
    ? {
        text: {
          color: `light-dark({${colorFamily}.700}, {${colorFamily}.100})`,
          hoverColor: `light-dark({${colorFamily}.800}, {${colorFamily}.50})`,
        },
      }
    : {};

  return definePreset(
    Aura,
    {
      semantic: {
        ...textOverride,
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
          800: darkestSurfaceShade ?? `{${surfaceFamily}.800}`,
          900: darkestSurfaceShade ?? `{${surfaceFamily}.900}`,
          950: darkestSurfaceShade ?? `{${surfaceFamily}.950}`,
        },
      },
    },
    TREE_ICON_MATCHES_LABEL
  );
}

const AuraPreset = definePreset(Aura, TREE_ICON_MATCHES_LABEL);
const CaffeinePreset = tintedPreset('blue', 'blue', true);
const TokyoPreset = tintedPreset('violet', 'violet', true);
const DarkwoodPreset = tintedPreset('green', 'green', true);
const LattePreset = tintedPreset('amber', 'stone', false);

export const THEMES: ThemeDefinition[] = [
  { id: 'caffeine', label: 'Caffeine', dark: true, previewColor: '#172554', pageSurroundColor: '#0a1128', preset: CaffeinePreset },
  { id: 'aura', label: 'Aura', dark: true, previewColor: '#18181b', pageSurroundColor: '#09090b', preset: AuraPreset },
  { id: 'tokyo', label: 'Tokyo', dark: true, previewColor: '#2e1065', pageSurroundColor: '#1e1033', preset: TokyoPreset },
  { id: 'darkwood', label: 'Darkwood', dark: true, previewColor: '#052e16', pageSurroundColor: '#03150a', preset: DarkwoodPreset },
  { id: 'latte', label: 'Latte', dark: false, previewColor: '#f5f5f4', pageSurroundColor: '#e7e2da', preset: LattePreset },
];

export const DEFAULT_THEME_ID = 'caffeine';

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES.find((theme) => theme.id === DEFAULT_THEME_ID)!;
}
