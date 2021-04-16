import React, { useState, useEffect } from "react";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
// import { Inbox as InboxIcon } from "@material-ui/icons";
import { Link } from "react-router-dom";
import classnames from "classnames";

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Tooltip from '@material-ui/core/Tooltip';
import Fade from '@material-ui/core/Fade';
import Zoom from '@material-ui/core/Zoom';
// styles
import useStyles from "./styles";

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
  var classes = useStyles();
  let myItemRef = React.createRef();
  const [needTooltip, setNeedTooltip] = useState(false)
  // local
  var isLinkActive = link && (location.pathname === link || location.pathname.indexOf(link) !== -1);
  var isPathActive = link && location.pathname === link

  var [isOpen, setIsOpen] = useState(isLinkActive ? isLinkActive : false);


  useEffect(() => {
    console.log("SiderbarLink debug ------->")
    console.log(`l ${link} p ${location.pathname} i ${location.pathname.indexOf(link)} e ${location.pathname === link || location.pathname.indexOf(link) !== -1}`)
    if (myItemRef.current) {
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
  }, [])

  if (type === "title")
    return (
      <Typography
        className={classnames(classes.linkText, classes.sectionTitle, {
          [classes.linkTextHidden]: !isSidebarOpened,
        })}
      >
        {label}
      </Typography>
    );

  if (type === "divider") return <Divider className={classes.divider} />;

  if (!children)
    return (
      <ListItem
        button
        component={link && Link}
        to={link}
        className={classes.link}
        classes={{
          root: classnames(classes.linkRoot, {
            [classes.linkActive]: isLinkActive && !nested,
            [classes.linkNested]: nested,
          }),
        }}
        disableRipple
      >
        <ListItemIcon
          className={classnames(classes.linkIcon, {
            [classes.linkIconActive]: isLinkActive && isPathActive,
          })}
        >
          {nested ? <Dot color={isLinkActive && isPathActive && "primary"} /> : icon}
        </ListItemIcon>
        {
          needTooltip ?
            <Tooltip title={label} placement="right" arrow TransitionComponent={Zoom}>
              <ListItemText
                ref={myItemRef}
                classes={{
                  primary: classnames(classes.linkText, {
                    [classes.linkTextActive]: isLinkActive && isPathActive,
                    [classes.linkTextHidden]: !isSidebarOpened,
                  }, classes.ellipsisText),
                  // root: classes.ellipsisText
                }}
                primary={label}
              />
            </Tooltip> :
            <ListItemText
              ref={myItemRef}
              classes={{
                primary: classnames(classes.linkText, {
                  [classes.linkTextActive]: isLinkActive && isPathActive,
                  [classes.linkTextHidden]: !isSidebarOpened,
                }, classes.ellipsisText),
                // root: classes.ellipsisText
              }}
              primary={label}
            />
        }

      </ListItem>
    );

  return (
    <>
      <ListItem
        button
        component={link && Link}
        onClick={toggleCollapse}
        className={classnames(classes.link, { [classes.linkActivePersist]: isLinkActive, [classes.rightBorder]: isLinkActive, [classes.rightBorderHidden]: !isLinkActive })}
        to={link}
        disableRipple
      >
        <ListItemIcon
          className={classnames(classes.linkIcon, {
            [classes.linkIconActive]: isLinkActive,
          })}
        >
          {/*icon ? icon : <InboxIcon /> EXPAND ICON - RSE*/}
          {icon}
        </ListItemIcon>
        {
          needTooltip ?
            <Tooltip title={label} placement="right" arrow TransitionComponent={Zoom}>
              <ListItemText
                ref={myItemRef}
                classes={{
                  primary: classnames(classes.linkText, {
                    [classes.linkTextActive]: isLinkActive,
                    [classes.linkTextHidden]: !isSidebarOpened,
                  }, classes.ellipsisText),
                }}
                primary={label}
              />
            </Tooltip> :
            <ListItemText
              ref={myItemRef}
              classes={{
                primary: classnames(classes.linkText, {
                  [classes.linkTextActive]: isLinkActive,
                  [classes.linkTextHidden]: !isSidebarOpened,
                }, classes.ellipsisText),
              }}
              primary={label}
            />
        }

        {isSidebarOpened ? (isOpen ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />) : null}

      </ListItem>
      {children && (
        <Collapse
          in={isOpen && isSidebarOpened}
          timeout="auto"
          unmountOnExit
        >{/*className={classes.nestedList} RSE*/}
          <List component="div" disablePadding className={classes.nestedList}>
            {children.map(childrenLink => (
              <SidebarLink
                key={childrenLink && childrenLink.link}
                location={location}
                isSidebarOpened={isSidebarOpened}
                classes={classes}
                nested
                {...childrenLink}
              />
            ))}
          </List>
          {/* <Divider className={classes.divider}/> */}
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
