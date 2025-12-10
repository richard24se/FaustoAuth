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
  primary: '#3182ce',
  secondary: '#805ad5',
  accent: '#d53f8c',
  success: '#38a169',
  warning: '#dd6b20',
  bg: '#f7fafc',      // gray.50
  surface: '#ffffff', // white
};

export const DEFAULT_DARK_THEME: ColorRoles = {
  primary: '#90cdf4',
  secondary: '#d6bcfa',
  accent: '#fbb6ce',
  success: '#68d391',
  warning: '#f6ad55',
  bg: '#171923',      // gray.900
  surface: '#1a202c', // gray.800
};
