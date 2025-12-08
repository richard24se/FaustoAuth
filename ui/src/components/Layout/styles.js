import { styled } from '@mui/material/styles';

export const StyledRoot = styled('div')(({ theme }) => ({
  display: "flex",
  maxWidth: "100vw",
  overflowX: "hidden",
}));

export const StyledContent = styled('div')(({ theme, isShifted }) => ({ // Added isShifted prop
  flexGrow: 1,
  padding: theme.spacing(3),
  width: `calc(100vw - 240px)`,
  minHeight: "100vh",
  ...(isShifted && { // Conditionally apply contentShift styles
    width: `calc(100vw - ${240 + theme.spacing(6)}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const StyledFakeToolbar = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
}));
