import { styled } from '@mui/material/styles';
import { Card, LinearProgress, Typography, Select, Input, OutlinedInput } from '@mui/material'; // Import OutlinedInput

export const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
}));

export const StyledVisitsNumberContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  paddingBottom: theme.spacing(1),
}));

export const StyledProgressSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const StyledProgressTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledProgress = styled(LinearProgress)(({ theme, barColor }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  ...(barColor && {
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: barColor,
    },
  }),
}));

export const StyledPieChartLegendWrapper = styled('div')(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-end",
  marginRight: theme.spacing(1),
}));

export const StyledLegendItemContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

export const StyledFullHeightBodyStyles = ({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  justifyContent: "space-between",
});

export const StyledFullHeightBody = styled('div')(StyledFullHeightBodyStyles);

export const StyledTableWidgetStyles = ({ theme }) => ({
  overflowX: "auto",
});

export const StyledTableWidget = styled('div')(StyledTableWidgetStyles);

export const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
}));

export const StyledPerformanceLegendWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

export const StyledLegendElement = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(2),
}));

export const StyledLegendElementText = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export const StyledServerOverviewElement = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  maxWidth: "100%",
}));

export const StyledServerOverviewElementText = styled('div')(({ theme }) => ({
  minWidth: 145,
  paddingRight: theme.spacing(2),
}));

export const StyledServerOverviewElementChartWrapper = styled('div')(({ theme }) => ({
  width: "100%",
}));

export const StyledMainChartBodyStyles = ({ theme }) => ({
  overflowX: "auto",
});

export const StyledMainChartBody = styled('div')(StyledMainChartBodyStyles);

export const StyledMainChartHeader = styled('div')(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  [theme.breakpoints.only("xs")]: {
    flexWrap: "wrap",
  },
}));

export const StyledMainChartHeaderLabels = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.only("xs")]: {
    order: 3,
    width: "100%",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
}));

export const StyledMainChartHeaderLabel = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginLeft: theme.spacing(3),
}));

export const StyledMainChartSelectRoot = styled(OutlinedInput)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': { // Target the notchedOutline
    borderColor: theme.palette.text.hint + "80 !important",
  },
  // Styles from mainChartSelect
  '& .MuiInputBase-input': { // Target the input element itself
    padding: 10,
    paddingRight: 25,
  },
}));

// StyledMainChartSelect is no longer needed as a separate export
// export const StyledMainChartSelect = styled(Input)(({ theme }) => ({ // This is for the input element itself
//   padding: 10,
//   paddingRight: 25,
// }));

export const StyledMainChartLegendElement = styled(Typography)(({ theme }) => ({
  fontSize: "18px !important",
  marginLeft: theme.spacing(1),
}));