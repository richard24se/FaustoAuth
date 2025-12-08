import { styled } from '@mui/material/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';

const drawerWidth = 240;

export const StyledMenuButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 12,
  marginRight: 36,
}));

export const StyledHide = styled('div')(({ theme, isHidden }) => ({
  ...(isHidden && {
    display: "none",
  }),
}));

export const StyledDrawer = styled(Drawer)(({ theme, isOpen }) => ({
  width: drawerWidth, // Apply to the root Drawer component
  flexShrink: 0,
  whiteSpace: "nowrap",
  '& .MuiDrawer-paper': { // Target the paper element
    ...(isOpen && {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    ...(!isOpen && {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(7) + 40,
      [theme.breakpoints.down("sm")]: {
        width: drawerWidth,
      },
    }),
  },
}));

export const StyledToolbar = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const StyledContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

export const StyledMobileBackButton = styled(IconButton)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(3),
  [theme.breakpoints.only("sm")]: {
    marginTop: theme.spacing(0.625),
    },
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));
