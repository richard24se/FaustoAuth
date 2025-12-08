import { styled } from '@mui/material/styles';
import { TextField, Button, Input } from '@mui/material'; // Added Input import
import { baseColorsStyle } from '../../themes/colors';

// Styled components
export const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
}));

export const StyledFormControl = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 120,
}));

export const StyledSelect = styled('div')(({ theme }) => ({
  //margin: theme.spacing(1), // Original comment
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  minWidth: 120,
  width: '100%',
}));

export const selectEmpty = ({ theme }) => ({ // Keeping as a style object for conditional application
  marginTop: theme.spacing(2),
});

export const StyledFormInput = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 120,
  width: '100%',
}));

// Modified to style TextField directly
export const StyledTextField = styled(TextField)(({ theme }) => ({
  //margin: theme.spacing(1), // Original comment
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  //marginLeft: theme.spacing(1), // Original comment
  //marginRight: theme.spacing(1), // Original comment
  //width: 120, // Original comment
  minWidth: 120,
}));

// Added StyledInput
export const StyledInput = styled(Input)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  minWidth: 120,
}));

export const StyledPicker = styled('div')(({ theme }) => ({
  //maxWidth: 250, // Original comment
  width: '100%',
  //margin: theme.spacing(1), // Original comment
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

// Modified to style TextField directly for textarea
export const StyledTextArea = styled(TextField)(({ theme }) => ({
  //maxWidth: 250, #RSE permite manejo con GRID UI // Original comment
  margin: theme.spacing(1),
}));

// Modified to style Button directly
export const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

// Modified to style Button directly
export const StyledSlimButton = styled(Button)(({ theme }) => ({
  lineHeight: "unset",
  margin: "unset",
  //fontSize: "0.7625rem", // Original comment
  fontSize: "0.7420rem",
}));

export const StyledAutoSelect = styled('div')(({ theme }) => ({
  flexGrow: 1, // Replicating classes.root behavior
  //margin: theme.spacing(1), // Original comment
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  minWidth: 120, // Re-added from original 'select' style
  width: '100%', // Re-added from original 'select' style
  //RSE FORM CONTROL
  border: 0,
  margin: 0,
  display: "inline-flex",
  padding: 0,
  position: "relative",
  flexDirection: "column",
  verticalAlign: "top",
  //RSE FORM CONTROL
}));
export const InnerStyledAutoSelect = styled('div')(({ theme }) => ({
  flexGrow: 1, // Replicating classes.root behavior
  //margin: theme.spacing(1), // Original comment
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  //RSE FORM CONTROL
  border: 0,
  margin: 0,
  display: "inline-flex",
  padding: 0,
  position: "relative",
  minWidth: 0,
  width: "100%",
  flexDirection: "column",
  verticalAlign: "top",
  //RSE FORM CONTROL
}));

export const StyledSlider = styled('div')(({ theme }) => ({
  margin: theme.spacing(3),
}));

// For baseColorsStyle, it's hard to know where it's applied.
// I'll create a generic styled div that includes it.
// Consuming components should apply baseColorsStyle where appropriate.
export const StyledBaseColorsContainer = styled('div')(({ theme }) => ({
  ...baseColorsStyle,
}));
