import React, { useState, useEffect } from "react";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
// import { Inbox as InboxIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import classnames from "classnames";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
// styles
import { StyledLink, StyledLinkIcon, StyledLinkText, StyledNestedList, StyledSectionTitle, StyledRightBorder, StyledEllipsisText, StyledDivider } from "./styles";

// components
import Dot from "../Dot";

export default function SidebarLink({
  link,
  icon,
  label,
  children,
  location,
  isSidebarOpened,
  nested,
  type,
}) {
  let myItemRef = React.createRef();
  const [needTooltip, setNeedTooltip] = useState(false)
  // local
  var isLinkActive = link && (location.pathname === link || location.pathname.indexOf(link) !== -1);
  var isPathActive = link && location.pathname === link

  var [isOpen, setIsOpen] = useState(isLinkActive ? isLinkActive : false);


  useEffect(() => {
    console.log("SiderbarLink debug ------->")
    console.log(`l ${link} p ${location.pathname} i ${location.pathname.indexOf(link)} e ${location.pathname === link || location.pathname.indexOf(link) !== -1}`)
    if (myItemRef.current && myItemRef.current.firstChild) { // Add check for firstChild
      console.log(myItemRef)
      console.log(myItemRef.current.innerHTML)
      const { scrollWidth, offsetWidth } = myItemRef.current.firstChild;
      console.log(label)
      console.log(scrollWidth, offsetWidth)
      if (scrollWidth - offsetWidth > 1) {
        console.log(scrollWidth - offsetWidth)
        setNeedTooltip(true)
      }
    }
  }, [label, link, location.pathname]) // Add dependencies to useEffect

  if (type === "title")
    return (
      <StyledSectionTitle
        isHidden={!isSidebarOpened}
      >
        {label}
      </StyledSectionTitle>
    );

  if (type === "divider") return <StyledDivider />;

  if (!children)
    return (
      <StyledLink
        button
        component={link && Link}
        to={link}
        isActive={isLinkActive && !nested}
        isNested={nested}
        disableRipple
      >
        <StyledLinkIcon isActive={isLinkActive && isPathActive}>
          {nested ? <Dot color={isLinkActive && isPathActive && "primary"} /> : icon}
        </StyledLinkIcon>
        {
          needTooltip ?
            <Tooltip title={label} placement="right" arrow TransitionComponent={Zoom}>
              <StyledLinkText
                ref={myItemRef}
                isActive={isLinkActive && isPathActive}
                isHidden={!isSidebarOpened}
                primary={label}
              />
            </Tooltip> :
            <StyledLinkText
              ref={myItemRef}
              isActive={isLinkActive && isPathActive}
              isHidden={!isSidebarOpened}
              primary={label}
            />
        }

      </StyledLink>
    );

  return (
    <>
      <StyledLink
        button
        component={link && Link}
        onClick={toggleCollapse}
        isActive={isLinkActive}
        hasRightBorder={isLinkActive}
        isRightBorderHidden={!isLinkActive}
        disableRipple
      >
        <StyledLinkIcon isActive={isLinkActive}>
          {icon}
        </StyledLinkIcon>
        {
          needTooltip ?
            <Tooltip title={label} placement="right" arrow TransitionComponent={Zoom}>
              <StyledLinkText
                ref={myItemRef}
                isActive={isLinkActive}
                isHidden={!isSidebarOpened}
                primary={label}
              />
            </Tooltip> :
            <StyledLinkText
              ref={myItemRef}
              isActive={isLinkActive}
              isHidden={!isSidebarOpened}
              primary={label}
            />
        }

        {isSidebarOpened ? (isOpen ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />) : null}

      </StyledLink>
      {children && (
        <Collapse
          in={isOpen && isSidebarOpened}
          timeout="auto"
          unmountOnExit
        >
          <StyledNestedList component="div" disablePadding>
            {children.map(childrenLink => (
              <SidebarLink
                key={childrenLink && childrenLink.link}
                location={location}
                isSidebarOpened={isSidebarOpened}
                // classes={classes} // No longer needed
                nested
                {...childrenLink}
              />
            ))}
          </StyledNestedList>
          {/* <StyledDivider/> */}
        </Collapse>
      )}
    </>
  );

  // ###########################################################

  function toggleCollapse(e) {
    if (isSidebarOpened) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  }
}
