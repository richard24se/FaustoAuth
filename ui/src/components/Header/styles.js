import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  List,
  //ListItem, // No direct usage for styling in Header.js
  //ListItemIcon, // No direct usage for styling in Header.js
  //ListItemText, // No direct usage for styling in Header.js
  //Divider, // No direct usage for styling in Header.js
  Typography, // Added Typography import
  Button,
} from '@mui/material';

export const StyledLogotype = styled(Typography)(({ theme }) => ({
  color: "white",
  marginLeft: theme.spacing(2.5),
  //marginRight: theme.spacing(2.5),
  fontWeight: 500,
  fontSize: 18,
  whiteSpace: "nowrap",
  [theme.breakpoints.down("xs")]: {
    display: "none",
  },
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: "100vw",
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  // paddingTop: "40px"
}));

export const StyledHide = styled('div')(({ theme }) => ({
  display: "none",
}));

export const StyledGrow = styled('div')(({ theme }) => ({
  flexGrow: 1,
}));

export const StyledSearch = styled('div')(({ theme, isFocused }) => ({
  position: "relative",
  borderRadius: 25,
  paddingLeft: theme.spacing(2.5),
  width: 36,
  backgroundColor: alpha(theme.palette.common.black, 0),
  transition: theme.transitions.create(["background-color", "width"]),
  "&:hover": {
    cursor: "pointer",
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  ...(isFocused && {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 250,
    },
  }),
}));


export const StyledSearchIcon = styled('div')(({ theme, isOpened }) => ({
  width: 36,
  right: 0,
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: theme.transitions.create("right"),
  "&:hover": {
    cursor: "pointer",
  },
  ...(isOpened && {
    right: theme.spacing(1.25),
  }),
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  '& .MuiInputBase-input': { // Targeting the input element within InputBase
    height: 36,
    padding: 0,
    paddingRight: 36 + theme.spacing(1.25),
    width: "100%",
  },
}));

export const StyledMessageContent = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

export const StyledHeaderMenu = styled(Menu)(({ theme }) => ({
  marginTop: theme.spacing(7),
}));

export const StyledHeaderMenuList = styled(List)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

export const StyledHeaderMenuItem = styled(MenuItem)(({ theme }) => ({
  "&:hover, &:focus": {
    backgroundColor: theme.palette.primary.main,
    color: "white",
  },
}));

export const StyledHeaderMenuButton = styled(IconButton)(({ theme, isCollapsed }) => ({
  marginLeft: theme.spacing(2),
  padding: theme.spacing(0.5),
  ...(isCollapsed && {
    marginRight: theme.spacing(2),
  }),
}));

// StyledHeaderMenuButtonCollapse is no longer needed as a separate export
// export const StyledHeaderMenuButtonCollapse = styled(IconButton)(({ theme }) => ({
//   marginRight: theme.spacing(2),
// }));

export const StyledHeaderIcon = styled('div')(({ theme, isCollapsed }) => ({ // Assuming it wraps an icon
  fontSize: 28,
  color: "rgba(255, 255, 255, 0.35)",
  ...(isCollapsed && {
    color: "white",
  }),
}));

// StyledHeaderIconCollapse is no longer needed as a separate export
// export const StyledHeaderIconCollapse = styled('div')(({ theme }) => ({ // Assuming it wraps an icon
//   color: "white",
// }));

export const StyledProfileMenu = styled(Menu)(({ theme }) => ({
  minWidth: 265,
}));

export const StyledProfileMenuUser = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
}));

export const StyledProfileMenuItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.text.hint,
}));

export const StyledProfileMenuIcon = styled('div')(({ theme }) => ({ // Assuming it wraps an icon
  marginRight: theme.spacing(2),
  color: theme.palette.text.hint,
}));

export const StyledProfileMenuLink = styled('a')(({ theme }) => ({ // Assuming it's an anchor tag
  fontSize: 16,
  textDecoration: "none",
  "&:hover": {
    cursor: "pointer",
  },
}));

export const StyledMessageNotification = styled('div')(({ theme }) => ({
  height: "auto",
  display: "flex",
  alignItems: "center",
  "&:hover, &:focus": {
    backgroundColor: theme.palette.background.light,
  },
}));

export const StyledMessageNotificationSide = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginRight: theme.spacing(2),
}));

export const StyledMessageNotificationBodySide = styled('div')(({ theme }) => ({
  alignItems: "flex-start",
  marginRight: 0,
}));

export const StyledSendMessageButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textTransform: "none",
}));

export const StyledSendButtonIcon = styled('div')(({ theme }) => ({ // Assuming it wraps an icon
  marginLeft: theme.spacing(2),
}));

export const StyledRedSoft = styled('div')(({ theme }) => ({ // For background color
  backgroundColor: "#FB4140"
}));

export const StyledLogotypeImage = styled('img')(({ theme }) => ({
  width: 130,  //Tamaño logo
}));