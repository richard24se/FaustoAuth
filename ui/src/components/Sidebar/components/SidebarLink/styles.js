import { makeStyles } from '@material-ui/core/styles';

import tinycolor from "tinycolor2";

const lightenRate = 35.90;
const super_light = (color) => tinycolor(color).lighten(lightenRate).toHexString()
export default makeStyles(theme => ({
  link: {
    textDecoration: "none",
    "&:hover, &:focus": {
      // backgroundColor: theme.palette.background.light,
      backgroundColor: super_light(theme.palette.primary.light),
    },
  },
  linkActive: {
    backgroundColor: theme.palette.background.light,
    // paddingLeft: theme.spacing(0),
  },
  linkActivePersist: {
    backgroundColor: super_light(theme.palette.primary.light),
    // paddingLeft: theme.spacing(0),
  },
  linkNested: {
    paddingLeft: 0,
    "&:hover, &:focus": {
      backgroundColor: "#FFFFFF",
    },
  },
  linkIcon: {
    // marginRight: theme.spacing(1),
    color: theme.palette.text.secondary + "99",
    transition: theme.transitions.create("color"),
    width: 24,
    display: "flex",
    justifyContent: "center",
  },
  linkIconActive: {
    color: theme.palette.primary.main,
  },
  linkText: {
    padding: 0,
    color: theme.palette.text.secondary + "CC",
    transition: theme.transitions.create(["opacity", "color"]),
    fontSize: 14, //RSE
  },
  linkTextActive: {
    color: theme.palette.text.primary,
  },
  linkTextHidden: {
    opacity: 0,
  },
  nestedList: {
    paddingLeft: theme.spacing(2) + 20,
  },
  sectionTitle: {
    marginLeft: theme.spacing(4.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 600
  },
  rightBorder: {
    borderRight: theme.palette.primary.main,
    borderRightStyle: "solid",
    borderRightWidth: theme.spacing(0.4),
  },
  rightBorderHidden: {
    borderRight: "white",
    borderRightStyle: "hidden",
    borderRightWidth: theme.spacing(0.4),
  },
  ellipsisText: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    height: 1,
    backgroundColor: "#D8D8D880",
  },
}));
