import tinycolor from "tinycolor2";

const primary = "#2D2D2D";
const secondary = "#1b1b1b";
const warning = "#FFC260";
const success = "#3CD4A0";
const info = "#9013FE";

const lightenRate = 7.5;
const darkenRate = 15;

const defaultTheme = {
  palette: {
    primary: {
      main: primary,
      light: tinycolor(primary).lighten(lightenRate).toHexString(),
      dark: tinycolor(primary).darken(darkenRate).toHexString(),
    },
    secondary: {
      main: secondary,
      light: tinycolor(secondary).lighten(lightenRate).toHexString(),
      dark: tinycolor(secondary).darken(darkenRate).toHexString(),
      contrastText: "#FFFFFF",
    },
    warning: {
      main: warning,
      light: tinycolor(warning).lighten(lightenRate).toHexString(),
      dark: tinycolor(warning).darken(darkenRate).toHexString(),
    },
    success: {
      main: success,
      light: tinycolor(success).lighten(lightenRate).toHexString(),
      dark: tinycolor(success).darken(darkenRate).toHexString(),
    },
    info: {
      main: info,
      light: tinycolor(info).lighten(lightenRate).toHexString(),
      dark: tinycolor(info).darken(darkenRate).toHexString(),
    },
    text: {
      primary: "#2D2D2D",
      secondary: "#4A4A4A",
      hint: "#6E6E6E",
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

  components: {
    /** --------------------------
     *  GLOBAL (replaces v4 overrides)
     *  -------------------------- */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflow: "overlay", // makes scrollbars overlay content in Chrome
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#969696ff white",
        },

        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: `${primary} white`,
        },

        "*::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },

        "*::-webkit-scrollbar-track": {
          boxShadow: "inset 0 0 6px rgba(243, 47, 47, 0)",
          borderRadius: "10px",
        },

        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#6b6b6bff",
          borderRadius: "6px",
        },
      },
    },

    /** --------------------------
     *  BACKDROP
     *  -------------------------- */
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "#4a4a4a47",
        },
      },
    },

    /** --------------------------
     *  MENU
     *  -------------------------- */
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow:
            "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
        },
      },
    },

    /** --------------------------
     *  SELECT
     *  -------------------------- */
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#B9B9B9",
        },
      },
    },

    /** --------------------------
     *  LIST ITEM
     *  -------------------------- */
    MuiListItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#F3F5FF !important",
          },
          "&.Mui-selected:focus": {
            backgroundColor: "#F3F5FF",
          },
        },
        button: {
          "&:hover, &:focus": {
            backgroundColor: "#F3F5FF",
          },
        },
      },
    },

    /** --------------------------
     *  TOUCH RIPPLE
     *  -------------------------- */
    MuiTouchRipple: {
      styleOverrides: {
        child: {
          backgroundColor: "white",
        },
      },
    },

    /** --------------------------
     *  TABLE ROW
     *  -------------------------- */
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 24,
        },
      },
    },

    /** --------------------------
     *  TABLE CELL
     *  -------------------------- */
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(224,224,224,.5)",
          padding: "4px 56px 4px 24px",
          boxSizing: "unset",
        },
        head: {
          borderBottom: "3px solid rgba(224,224,224,.5)",
          fontSize: "0.95rem",
        },
        body: {
          fontSize: "0.95rem",
        },
      },
    },

    /** --------------------------
     *  MUI-DATATABLES (custom class names)
     *  -------------------------- */
    MUIDataTableSelectCell: {
      styleOverrides: {
        fixedHeaderCommon: {
          position: "unset !important",
          backgroundColor: "unset !important",
        },
        fixedLeft: {
          backgroundColor: "#fff",
        },
        expandDisabled: {
          visibility: "hidden",
        },
      },
    },
  },
};

export default defaultTheme;
