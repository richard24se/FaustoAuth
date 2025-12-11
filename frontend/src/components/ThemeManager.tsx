import { useEffect } from 'react';
import { useColorMode } from './ui/color-mode';
import { generatePalette } from '../utils/colorUtils';
import { ColorRoles, DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '../constants/themeColors';

export type { ColorRoles };

export const ThemeManager = () => {
  const { colorMode } = useColorMode();

  const applyTheme = () => {
    const root = document.documentElement;
    const mode = colorMode === 'dark' ? 'dark' : 'light';
    const storageKey = `theme-colors-${mode}`;

    // Load saved colors or use defaults
    const saved = localStorage.getItem(storageKey);
    const colors: ColorRoles = saved
      ? JSON.parse(saved)
      : mode === 'dark'
        ? DEFAULT_DARK_THEME
        : DEFAULT_LIGHT_THEME;

    console.log('[ThemeManager] Applying theme:', { mode, saved, colors });

    // Apply variables
    Object.entries(colors).forEach(([role, hex]) => {
      const palette = generatePalette(hex);
      Object.entries(palette).forEach(([shade, value]) => {
        root.style.setProperty(`--chakra-colors-${role}-${shade}`, value);
      });
    });
  };

  useEffect(() => {
    // Apply on mount and when colorMode changes
    applyTheme();

    // Listen for custom event 'theme-change' to re-apply without page reload
    const handleThemeChange = () => applyTheme();
    window.addEventListener('theme-change', handleThemeChange);

    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, [colorMode]);

  return null;
};
