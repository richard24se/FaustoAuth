export type ColorRoles = {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  bg: string;      // Global background
  surface: string; // Cards, Sidebars, Modals
};

export const DEFAULT_LIGHT_THEME: ColorRoles = {
  primary: '#4A148C',   // Deep Purple from 'F'
  secondary: '#757575', // Gray from 'u'
  accent: '#000000',    // Black from 'sto'
  success: '#38a169',
  warning: '#dd6b20',
  bg: '#F7FAFC',        // gray.50
  surface: '#FFFFFF',   // white
};

export const DEFAULT_DARK_THEME: ColorRoles = {
  primary: '#5c00b8',   // Deep Purple (Darker for user preference)
  secondary: '#BDBDBD', // Light Gray
  accent: '#FFFFFF',    // White
  success: '#68d391',
  warning: '#f6ad55',
  bg: '#121212',        // Deep dark bg
  surface: '#1E1E1E',   // Dark gray surface
};
