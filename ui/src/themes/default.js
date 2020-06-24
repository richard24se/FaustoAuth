import tinycolor from "tinycolor2";
// AZUL: #0A3697
// ROJO: #cc232a

const primary = "#2D2D2D";
const secondary = "#1b1b1b"; //#FF5C93
const warning = "#FFC260";
const success = "#3CD4A0";
const info = "#9013FE";

const lightenRate = 7.5;
const darkenRate = 15;

export default {
  palette: {
    primary: {
      main: primary,
      light: tinycolor(primary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(primary)
        .darken(darkenRate)
        .toHexString(),
    },
    secondary: {
      main: secondary,
      light: tinycolor(secondary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(secondary)
        .darken(darkenRate)
        .toHexString(),
      contrastText: "#FFFFFF",
    },
    warning: {
      main: warning,
      light: tinycolor(warning)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(warning)
        .darken(darkenRate)
        .toHexString(),
    },
    success: {
      main: success,
      light: tinycolor(success)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(success)
        .darken(darkenRate)
        .toHexString(),
    },
    info: {
      main: info,
      light: tinycolor(info)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(info)
        .darken(darkenRate)
        .toHexString(),
    },
    text: {
      primary: "#2D2D2D", //#4A4A4A
      secondary: "#4A4A4A", //#6E6E6E
      hint: "#6E6E6E", //#B9B9B9
    },
    background: {
      default: "#F6F7FF",
      light: "#F3F5FF",
    },
  },
  customShadows: {
    widget:
      "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetDark:
      "0px 3px 18px 0px #4558A3B3, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetWide:
      "0px 12px 33px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
  },
  overrides: {
    MuiBackdrop: {
      root: {
        //backgroundColor: "#4A4A4A1A", //RSE
        backgroundColor: "#4a4a4a47",
      },
    },
    MuiMenu: {
      paper: {
        boxShadow:
          "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
      },
    },
    MuiSelect: {
      icon: {
        color: "#B9B9B9",
      },
    },
    MUIDataTableSelectCell: {
      fixedHeaderCommon: {
        position: "unset !important",
        backgroundColor: "unset !important",
      },
      expandDisabled: {
        visibility: "hidden"
      }
    },
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: "#F3F5FF !important",
          "&:focus": {
            backgroundColor: "#F3F5FF",
          },
        },
      },
      button: {
        "&:hover, &:focus": {
          backgroundColor: "#F3F5FF",
        },
      },
    },
    MuiTouchRipple: {
      child: {
        backgroundColor: "white",
      },
    },
    MuiTableRow: {
      root: {
        height: 24,
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: "1px solid rgba(224, 224, 224, .5)",
        padding: "4px 56px 4px 24px", //FIX RSE
        boxSizing: "unset", //FIX RSE
      },
      head: {
        borderBottom: "3px solid rgba(224, 224, 224, .5)", //FIX RSE
        fontSize: "0.95rem",
      },
      body: {
        fontSize: "0.95rem",
      },
    },
    MuiCssBaseline: {
      '@global': {
        '*': {
          'scrollbar-width': 'thin',
          'scrollbar-color': primary+' white'
        },
        '*::-webkit-scrollbar': {
          width: "6px",
          height: "6px",
          bottom: "0px !important",
        },
        '*::-webkit-scrollbar-track': {
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
          borderRadius: "10px",
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',//primary,//tinycolor(primary).darken(darkenRate).toHexString(),
          outline: '1px solid slategrey',
          borderRadius: "6px",
        }
      },
    },
  },
};
