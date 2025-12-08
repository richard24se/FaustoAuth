import { styled } from '@mui/material/styles';
import { Paper, IconButton } from '@mui/material';

export const StyledWidgetWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  minHeight: "100%",
}));

export const StyledWidgetHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const StyledWidgetRoot = styled(Paper)(({ theme }) => ({
  boxShadow: theme.customShadows.widget,
  // Styles from paper
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflow: "hidden",
}));

export const StyledWidgetBody = styled('div')(({ theme, isNoPadding }) => ({
  paddingBottom: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  ...(isNoPadding && {
    padding: 0,
  }),
}));

// StyledNoPadding is no longer needed as a separate export
// export const StyledNoPadding = styled('div')(({ theme }) => ({
//   padding: 0,
// }));

export const StyledMoreButton = styled(IconButton)(({ theme }) => ({
  margin: -theme.spacing(1),
  padding: 0,
  width: 40,
  height: 40,
  color: theme.palette.text.hint,
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: "rgba(255, 255, 255, 0.35)",
  },
}));