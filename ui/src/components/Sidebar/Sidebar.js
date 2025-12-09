import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Home as HomeIcon,
  FilterNone as UIElementsIcon,
  BorderAll as TableIcon,
  QuestionAnswer as SupportIcon,
  LibraryBooks as LibraryIcon,
  HelpOutline as FAQIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

// styles
import { StyledMenuButton, StyledHide, StyledDrawer, StyledToolbar, StyledContent, StyledMobileBackButton } from "./styles";

// components
import SidebarLink from "./components/SidebarLink/SidebarLink";
import Dot from "./components/Dot";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";

//Redux
import { useSelector } from 'react-redux'

const structure = [
  { id: 0, label: "Dashboard", link: "/app/dashboard", icon: <HomeIcon /> },
  {
    id: 1,
    label: "Typography",
    link: "/app/typography",
    icon: <UIElementsIcon />,
  },
  { id: 2, label: "Tables", link: "/app/tables", icon: <TableIcon /> },
  {
    id: 3,
    label: "Notifications",
    link: "/app/notifications",
    icon: <SupportIcon />,
  },
  {
    id: 4,
    label: "UI Elements",
    link: "/app/ui",
    icon: <UIElementsIcon />,
    children: [
      { id: 5, label: "Icons", link: "/app/ui/icons" },
      { id: 6, label: "Charts", link: "/app/ui/charts" },
      { id: 7, label: "Maps", link: "/app/ui/maps" },
    ],
  },
  { id: 8, type: "divider" },
  { id: 9, label: "Sample Link", link: "https://flatlogic.com/templates/react-material-admin-full", icon: <LibraryIcon /> },
  { id: 10, label: "Support", link: "https://flatlogic.com/templates/react-material-admin-full", icon: <SupportIcon /> },
  { id: 11, label: "FAQ", link: "https://flatlogic.com/templates/react-material-admin-full", icon: <FAQIcon /> },
];

function Sidebar() {
  var theme = useTheme();
  const location = useLocation();

  // global
  var { isSidebarOpened } = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isPermanent, setPermanent] = useState(true);

  const structure = useSelector(state => state.app.filtered_structure) || []

  useEffect(function () {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <StyledDrawer
      variant="permanent"
      isOpen={isPermanent}
    >
      <StyledToolbar />
      <StyledHide isHidden={isPermanent}>
        <StyledMobileBackButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
        >
          <ArrowBackIcon />
        </StyledMobileBackButton>
      </StyledHide>
      <List>
        {structure.map(link => (
          <SidebarLink
            key={link.id}
            location={location}
            isSidebarOpened={isSidebarOpened}
            {...link}
          />
        ))}
      </List>
    </StyledDrawer>
  );

  // ###########################################################
  // #################### Sidebar specific functions ###########
  // ###########################################################
  function handleWindowWidthChange() {
    var windowWidth = window.innerWidth;
    var breakpointWidth = theme.breakpoints.values.md;
    var isPermanent = windowWidth >= breakpointWidth;
    setPermanent(isPermanent);
  }
}

export default Sidebar;
