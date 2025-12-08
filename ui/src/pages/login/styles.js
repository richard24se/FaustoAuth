import { styled } from '@mui/material/styles';
import { Grid, Typography, Button, TextField, Tabs, Tab } from '@mui/material';

export const StyledContainer = styled(Grid)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: 0,
  left: 0,
}));

export const StyledLogotypeContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: "60%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    width: "50%",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export const StyledLogotypeImage = styled('img')(({ theme }) => ({
  width: 365,
  marginBottom: theme.spacing(4),
}));

export const StyledLogotypeText = styled(Typography)(({ theme }) => ({
  color: "white",
  fontWeight: 500,
  fontSize: 84,
  [theme.breakpoints.down("md")]: {
    fontSize: 48,
  },
}));

export const StyledFormContainer = styled('div')(({ theme }) => ({
  width: "40%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    width: "50%",
  },
}));

export const StyledForm = styled('div')(({ theme }) => ({
  width: 320,
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 400,
  fontSize: 18,
}));

export const StyledGreeting = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  textAlign: "center",
  marginTop: theme.spacing(4),
}));

export const StyledSubGreeting = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  textAlign: "center",
  marginTop: theme.spacing(2),
}));

export const StyledGoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(6),
  boxShadow: theme.customShadows.widget,
  backgroundColor: "white",
  width: "100%",
  textTransform: "none",
}));

export const StyledGoogleButtonCreating = styled(Button)(({ theme }) => ({
  marginTop: 0,
}));

export const StyledGoogleIcon = styled('img')(({ theme }) => ({
  width: 30,
  marginRight: theme.spacing(2),
}));

export const StyledCreatingButtonContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  height: 46,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

export const StyledCreateAccountButton = styled(Button)(({ theme }) => ({
  height: 46,
  textTransform: "none",
}));

export const StyledFormDividerContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  display: "flex",
  alignItems: "center",
}));

export const StyledFormDividerWord = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export const StyledFormDivider = styled('div')(({ theme }) => ({
  flexGrow: 1,
  height: 1,
  backgroundColor: theme.palette.text.hint + "40",
}));

export const StyledErrorMessage = styled(Typography)(({ theme }) => ({
  textAlign: "center",
}));

// Styled TextField with underline and input styles integrated
export const StyledLoginTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInput-underline:before': {
    borderBottomColor: theme.palette.primary.light,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme.palette.primary.main,
  },
  '& .MuiInput-underline:hover:before': {
    borderBottomColor: `${theme.palette.primary.light} !important`,
  },
  '& .MuiInputBase-input': {
    borderBottomColor: theme.palette.background.light,
  },
}));

export const StyledFormButtons = styled('div')(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(4),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const StyledForgetButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 400,
}));

export const StyledLoginLoader = styled('div')(({ theme }) => ({
  //marginLeft: theme.spacing(4), // Original comment
}));

export const StyledCopyright = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  whiteSpace: "nowrap",
  [theme.breakpoints.up("md")]: {
    position: "absolute",
    bottom: theme.spacing(2),
  },
}));

export const StyledFormButtonsCenter = styled('div')(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(4),
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center"
}));