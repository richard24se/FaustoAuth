import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props: any) => ({
      body: {
        bg: 'var(--chakra-colors-bg-500)',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
      },
    }),
  },
  colors: {
    brand: {
      50: 'var(--chakra-colors-primary-50)',
      100: 'var(--chakra-colors-primary-100)',
      200: 'var(--chakra-colors-primary-200)',
      300: 'var(--chakra-colors-primary-300)',
      400: 'var(--chakra-colors-primary-400)',
      500: 'var(--chakra-colors-primary-500)',
      600: 'var(--chakra-colors-primary-600)',
      700: 'var(--chakra-colors-primary-700)',
      800: 'var(--chakra-colors-primary-800)',
      900: 'var(--chakra-colors-primary-900)',
    },
    secondary: {
      50: 'var(--chakra-colors-secondary-50)',
      100: 'var(--chakra-colors-secondary-100)',
      500: 'var(--chakra-colors-secondary-500)',
      600: 'var(--chakra-colors-secondary-600)',
      900: 'var(--chakra-colors-secondary-900)',
    },
    accent: {
      50: 'var(--chakra-colors-accent-50)',
      100: 'var(--chakra-colors-accent-100)',
      500: 'var(--chakra-colors-accent-500)',
      600: 'var(--chakra-colors-accent-600)',
      900: 'var(--chakra-colors-accent-900)',
    },
    success: {
      50: 'var(--chakra-colors-success-50)',
      100: 'var(--chakra-colors-success-100)',
      500: 'var(--chakra-colors-success-500)',
      600: 'var(--chakra-colors-success-600)',
      900: 'var(--chakra-colors-success-900)',
    },
    warning: {
       50: 'var(--chakra-colors-warning-50)',
       100: 'var(--chakra-colors-warning-100)',
       500: 'var(--chakra-colors-warning-500)',
       600: 'var(--chakra-colors-warning-600)',
       900: 'var(--chakra-colors-warning-900)',
    },
    surface: {
       500: 'var(--chakra-colors-surface-500)',
    }
  },
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  }
});

export default theme;
