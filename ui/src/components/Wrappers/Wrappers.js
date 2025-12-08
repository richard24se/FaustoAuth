import React from "react";
import {
  Badge as BadgeBase,
  Typography as TypographyBase,
  Button as ButtonBase,
} from "@mui/material";
import { useTheme } from "@mui/styles"; // Keep useTheme for now, might be removed later
import { styled } from "@mui/material/styles"; // Import styled

// Helper functions (moved to top)
function getColor(color, theme, brigtness = "main") {
  if (color && theme.palette[color] && theme.palette[color][brigtness]) {
    return theme.palette[color][brigtness];
  }
}

function getFontWeight(style) {
  switch (style) {
    case "light":
      return 300;
    case "medium":
      return 500;
    case "bold":
      return 600;
    default:
      return 400;
  }
}

function getFontSize(size, variant = "", theme) {
  var multiplier;

  switch (size) {
    case "sm":
      multiplier = 0.8;
      break;
    case "md":
      multiplier = 1.5;
      break;
    case "xl":
      multiplier = 2;
      break;
    case "xxl":
      multiplier = 3;
      break;
    default:
      multiplier = 1;
      break;
  }

  var defaultSize =
    variant && theme.typography[variant]
      ? theme.typography[variant].fontSize
      : theme.typography.fontSize + "px";

  return `calc(${defaultSize} * ${multiplier})`;
}

// Styled Badge
const StyledBadge = styled(BadgeBase)(({ theme, colorBrightness, color }) => ({
  fontWeight: 600,
  height: 16,
  minWidth: 16,
  backgroundColor: getColor(color, theme, colorBrightness),
}));

// Styled Typography
const StyledTypography = styled(TypographyBase)(({ theme, weight, size, colorBrightness, color, variant }) => ({
  color: getColor(color, theme, colorBrightness),
  fontWeight: getFontWeight(weight),
  fontSize: getFontSize(size, variant, theme),
}));

// Styled Button
const StyledButton = styled(ButtonBase)(({ theme, color }) => ({
  backgroundColor: getColor(color, theme),
  boxShadow: theme.customShadows.widget,
  color: "white",
  "&:hover": {
    backgroundColor: getColor(color, theme, "light"),
    boxShadow: theme.customShadows.widgetWide,
  },
}));

export { StyledBadge as Badge, StyledTypography as Typography, StyledButton as Button };
