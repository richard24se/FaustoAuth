import React from "react";
import { Button } from "@mui/material";

// styles
import { StyledPageTitleContainer, StyledTypography, StyledButton } from "./styles";

export default function PageTitle(props) {
  return (
    <StyledPageTitleContainer>
      <StyledTypography variant="h2" size="sm">
        {props.title}
      </StyledTypography>
      {props.button && (
        <StyledButton
          variant="contained"
          size="large"
          color="secondary"
        >
          {props.button}
        </StyledButton>
      )}
    </StyledPageTitleContainer>
  );
}
