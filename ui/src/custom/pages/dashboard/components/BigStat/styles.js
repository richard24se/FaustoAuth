import { styled } from '@mui/material/styles';
import { Input } from '@mui/material'; // Import Input

export const StyledTitle = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginBottom: theme.spacing(1),
}));

export const StyledBottomStatsContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  margin: theme.spacing(1) * -2,
  marginTop: theme.spacing(1),
}));

export const StyledStatCell = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const StyledTotalValueContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
}));

export const StyledTotalValue = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
}));

export const StyledProfitArrow = styled('div')(({ theme, isDanger }) => ({
  transform: "rotate(-45deg)",
  fill: theme.palette.success.main,
  ...(isDanger && {
    transform: "rotate(45deg)",
    fill: theme.palette.secondary.main,
  }),
}));

// StyledProfitArrowDanger is no longer needed as a separate export
// export const StyledProfitArrowDanger = styled('div')(({ theme }) => ({
//   transform: "rotate(45deg)",
//   fill: theme.palette.secondary.main,
// }));

export const StyledSelectInput = styled(Input)(({ theme }) => ({ // Modified to styled(Input)
  padding: 10,
  paddingRight: 25,
  "&:focus": {
    backgroundColor: "white",
  },
}));
