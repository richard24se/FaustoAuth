import React from "react";
import { styled, useTheme } from '@mui/material/styles'; // Keep useTheme for color palette access
import classnames from "classnames"; // Still needed for potential other classes if any, but not for dot styles

const StyledDot = styled('div')(({ theme, size, color }) => ({
  width: 5,
  height: 5,
  backgroundColor: theme.palette.text.hint,
  borderRadius: "50%",
  transition: theme.transitions.create("background-color"),
  ...(size === "large" && {
    width: 8,
    height: 8,
  }),
  // Assuming 'small' size might exist, though not explicitly defined in original
  ...(size === "small" && {
    width: 3, // Example small size
    height: 3,
  }),
  // Conditional background color based on prop
  ...(color && theme.palette[color] && {
    backgroundColor: theme.palette[color].main,
  }),
}));

export default function Dot({ size, color }) {
  var theme = useTheme(); // Keep useTheme to access palette for color prop

  return (
    <StyledDot
      size={size}
      color={color}
    />
  );
}