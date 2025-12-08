import React, { useState } from "react";
import {
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import classnames from "classnames";

// styles
import { StyledWidgetWrapper, StyledWidgetHeader, StyledWidgetRoot, StyledWidgetBody, StyledMoreButton } from "./styles";

export default function Widget({
  children,
  title,
  noBodyPadding,
  bodyClass,
  bodySx, // New prop
  disableWidgetMenu,
  header,
  ...props
}) {
  // local
  var [moreButtonRef, setMoreButtonRef] = useState(null);
  var [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  /*
  overflow unset works with oversized lists
  */
  return (
    <StyledWidgetWrapper>
      <StyledWidgetRoot style={{overflow: props.overflow ? props.overflow : "absolute"  }}>
        <StyledWidgetHeader>
          {header ? (
            header
          ) : (
            <React.Fragment>
              <Typography variant="h5" color="textSecondary">
                {title}
              </Typography>
              {!disableWidgetMenu && (
                <StyledMoreButton
                  color="primary"
                  aria-owns="widget-menu"
                  aria-haspopup="true"
                  onClick={() => setMoreMenuOpen(true)}
                  buttonRef={setMoreButtonRef}
                >
                  <MoreIcon />
                </StyledMoreButton>
              )}
            </React.Fragment>
          )}
        </StyledWidgetHeader>
        <StyledWidgetBody
          isNoPadding={noBodyPadding}
          className={bodyClass}
          sx={bodySx} // Apply new prop
        >
          {children}
        </StyledWidgetBody>
      </StyledWidgetRoot>
      <Menu
        id="widget-menu"
        open={isMoreMenuOpen}
        anchorEl={moreButtonRef}
        onClose={() => setMoreMenuOpen(false)}
        disableAutoFocusItem
      >
        <MenuItem>
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Copy</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Delete</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Print</Typography>
        </MenuItem>
      </Menu>
    </StyledWidgetWrapper>
  );
}