import { styled } from '@mui/material/styles';
import { ListItem, ListItemIcon, ListItemText, Typography, Divider, List } from '@mui/material';

import tinycolor from "tinycolor2";

const lightenRate = 35.90;
const super_light = (color) => tinycolor(color).lighten(lightenRate).toHexString()

export const StyledLink = styled(ListItem)(({ theme, isActive, isNested, hasRightBorder, isRightBorderHidden }) => ({
  textDecoration: "none",
  "&:hover, &:focus": {
    backgroundColor: super_light(theme.palette.primary.light),
  },
  ...(isActive && {
    backgroundColor: theme.palette.background.light,
  }),
  ...(isActive && { // linkActivePersist
    backgroundColor: super_light(theme.palette.primary.light),
  }),
  ...(isNested && {
    paddingLeft: 0,
    "&:hover, &:focus": {
      backgroundColor: "#FFFFFF",
    },
  }),
  // Right border styles
  ...(hasRightBorder && {
    borderRight: theme.palette.primary.main,
    borderRightStyle: "solid",
    borderRightWidth: theme.spacing(0.4),
  }),
  ...(isRightBorderHidden && {
    borderRight: "white",
    borderRightStyle: "hidden",
    borderRightWidth: theme.spacing(0.4),
  }),
}));

export const StyledLinkIcon = styled(ListItemIcon)(({ theme, isActive }) => ({
  color: theme.palette.text.secondary + "99",
  transition: theme.transitions.create("color"),
  width: 24,
  display: "flex",
  justifyContent: "center",
  ...(isActive && {
    color: theme.palette.primary.main,
  }),
}));

export const StyledLinkText = styled(ListItemText)(({ theme, isActive, isHidden }) => ({
  padding: 0,
  color: theme.palette.text.secondary + "CC",
  transition: theme.transitions.create(["opacity", "color"]),
  fontSize: 14, //RSE
  ...(isActive && {
    color: theme.palette.text.primary,
  }),
  ...(isHidden && {
    opacity: 0,
  }),
  // Styles from ellipsisText
  '& .MuiListItemText-primary': { // Target the primary text within ListItemText
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
}));

export const StyledNestedList = styled(List)(({ theme }) => ({
  paddingLeft: theme.spacing(2) + 20,
}));

export const StyledSectionTitle = styled(Typography)(({ theme, isHidden }) => ({
  marginLeft: theme.spacing(4.5),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  // Styles from linkText
  padding: 0,
  color: theme.palette.text.secondary + "CC",
  transition: theme.transitions.create(["opacity", "color"]),
  fontSize: 14,
  // Styles from linkTextHidden
  ...(isHidden && {
    opacity: 0,
  }),
}));

export const StyledRightBorder = styled('div')(({ theme, isHidden }) => ({
  borderRight: theme.palette.primary.main,
  borderRightStyle: "solid",
  borderRightWidth: theme.spacing(0.4),
  ...(isHidden && {
    borderRight: "white",
    borderRightStyle: "hidden",
    borderRightWidth: theme.spacing(0.4),
  }),
}));

export const StyledEllipsisText = styled(Typography)(({ theme }) => ({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  height: 1,
  backgroundColor: "#D8D8D880",
}));
