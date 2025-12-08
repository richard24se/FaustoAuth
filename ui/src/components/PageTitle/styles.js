import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";
import { Typography } from "../Wrappers";

export const StyledPageTitleContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(1),
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.hint,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  boxShadow: theme.customShadows.widget,
  textTransform: "none",
  "&:active": {
    boxShadow: theme.customShadows.widgetWide,
  },
}));