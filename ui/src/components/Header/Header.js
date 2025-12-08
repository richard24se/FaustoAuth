import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase, // Uncommented
  Menu,
  MenuItem,
  Fab,
  Typography, // Imported from @mui/material
  List, // Added for StyledHeaderMenuList
} from "@mui/material";
// import Chip from '@mui/material/Chip';
//import FaceIcon from '@mui/icons-material/Face';
// import SimCardIcon from '@mui/icons-material/SimCard';
import {
  Menu as MenuIcon,
  // MailOutline as MailIcon,
  // NotificationsNone as NotificationsIcon,
  Person as AccountIcon,
  Search as SearchIcon, // Uncommented
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import classNames from "classnames";

// styles
import { StyledLogotype, StyledAppBar, StyledToolbar, StyledHide, StyledGrow, StyledSearch, StyledSearchIcon, StyledInputBase, StyledMessageContent, StyledHeaderMenu, StyledHeaderMenuList, StyledHeaderMenuItem, StyledHeaderMenuButton, StyledHeaderIcon, StyledProfileMenu, StyledProfileMenuUser, StyledProfileMenuItem, StyledProfileMenuIcon, StyledProfileMenuLink, StyledMessageNotification, StyledMessageNotificationSide, StyledMessageNotificationBodySide, StyledSendMessageButton, StyledSendButtonIcon, StyledRedSoft, StyledLogotypeImage } from "./styles";
import logo from "../../themes/logo2.png";
// components
import Notification from "../Notification/Notification";
import UserAvatar from "../UserAvatar/UserAvatar";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
//import { useUserDispatch, signOut } from "../../context/UserContext";

//Redux actions
import { connect } from 'react-redux';
//import { userActions } from '../../redux/actions';

//History constant!
//import {history} from '../../redux/helpers';

const messages = [
  {
    id: 0,
    variant: "warning",
    name: "Jane Hew",
    message: "Hey! How is it going?",
    time: "9:32",
  },
  {
    id: 1,
    variant: "success",
    name: "Lloyd Brown",
    message: "Check out my new Dashboard",
    time: "9:18",
  },
  {
    id: 2,
    variant: "primary",
    name: "Mark Winstein",
    message: "I want rearrange the appointment",
    time: "9:15",
  },
  {
    id: 3,
    variant: "secondary",
    name: "Liana Dutti",
    message: "Good news from sale department",
    time: "9:09",
  },
];

const notifications = [
  { id: 0, color: "warning", message: "Check out this awesome ticket" },
  {
    id: 1,
    color: "success",
    type: "info",
    message: "What is the best way to get ...",
  },
  {
    id: 2,
    color: "secondary",
    type: "notification",
    message: "This is just a simple notification",
  },
  {
    id: 3,
    color: "primary",
    type: "e-commerce",
    message: "12 new orders has arrived today",
  },
];

function Header(props) {
  // var classes = useStyles(); // Removed

  // global
  var layoutState = useLayoutState();
  var layoutDispatch = useLayoutDispatch();
  //var userDispatch = useUserDispatch();

  // local
  var [mailMenu, setMailMenu] = useState(null);
  // var [isMailsUnread, setIsMailsUnread] = useState(true);
  var [notificationsMenu, setNotificationsMenu] = useState(null);
  // var [isNotificationsUnread, setIsNotificationsUnread] = useState(true);
  var [profileMenu, setProfileMenu] = useState(null);
  var [isSearchOpen, setSearchOpen] = useState(false); // Uncommented

  //var [pirateState, setPirateState] = useState(null);
  //Handle init state
  const { dispatch } = props;

  useEffect(() => {
    //dispatch(userActions.getAll())
  }, [dispatch]);

  //const after_dispatch = useContext(dispatch(userActions.getAll()))

  // const { user } = props;
  const { history } = props;

  var handleLogout = (e) => {
    /*
    const { dispatch } = props;
    dispatch(userActions.logout() );*/
    //const user = null
    // history.push("/login")
    history.push({
      pathname: "/login",
      state: {
        from: props.location
      }
    })
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <StyledHeaderMenuButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
          isCollapsed={layoutState.isSidebarOpened}
        >
          {layoutState.isSidebarOpened ? (
            <StyledHeaderIcon isCollapsed={layoutState.isSidebarOpened}>
              <ArrowBackIcon />
            </StyledHeaderIcon>
          ) : (
            <StyledHeaderIcon isCollapsed={layoutState.isSidebarOpened}>
              <MenuIcon />
            </StyledHeaderIcon>
          )}
        </StyledHeaderMenuButton>
        {/* <StyledLogotype variant="h1" weight="medium">
          Fausto Auth
        </StyledLogotype> */}
        <StyledLogotypeImage src={logo} alt="logo" />
        {/*
        <Chip
          icon={<SimCardIcon />}
          label="IP: 127.0.0.1"
          clickable
          className={classNames(classes.chip,classes.red_soft)}
          color="primary"
        />*/}
        <StyledGrow />
        {/* <StyledSearch isFocused={isSearchOpen}>
          <StyledSearchIcon isOpened={isSearchOpen} onClick={() => setSearchOpen(!isSearchOpen)}>
            <StyledHeaderIcon>
              <SearchIcon />
            </StyledHeaderIcon>
          </StyledSearchIcon>
          <StyledInputBase
            placeholder="Search…"
          />
        </StyledSearch> */}
        {/* <IconButton  //Notificaciones
          color="inherit"
          aria-haspopup="true"
          aria-controls="mail-menu"
          onClick={e => {
            setNotificationsMenu(e.currentTarget);
            setIsNotificationsUnread(false);
          }}
          className={classes.headerMenuButton}
        >
          <Badge
            badgeContent={isNotificationsUnread ? notifications.length : null}
            color="warning"
          >
            <NotificationsIcon classes={{ root: classes.headerIcon }} />
          </Badge>
        </IconButton> */}
        {/* <IconButton  // Correo
          color="inherit"
          aria-haspopup="true"
          aria-controls="mail-menu"
          onClick={e => {
            setMailMenu(e.currentTarget);
            setIsMailsUnread(false);
          }}
          className={classes.headerMenuButton}
        >
          <Badge
            badgeContent={isMailsUnread ? messages.length : null}
            color="secondary"
          >
            <MailIcon classes={{ root: classes.headerIcon }} />
          </Badge>
        </IconButton> */}
        <StyledHeaderMenuButton
          aria-haspopup="true"
          color="inherit"
          aria-controls="profile-menu"
          onClick={e => setProfileMenu(e.currentTarget)}
        >
          <StyledHeaderIcon>
            <AccountIcon />
          </StyledHeaderIcon>
        </StyledHeaderMenuButton>
        
        <StyledHeaderMenu
          id="mail-menu"
          open={Boolean(mailMenu)}
          anchorEl={mailMenu}
          onClose={() => setMailMenu(null)}
          MenuListProps={{ component: StyledHeaderMenuList }}
          component={StyledProfileMenu} // This applies classes.profileMenu to the paper
          disableAutoFocusItem
        >
          <StyledProfileMenuUser>
            <Typography variant="h4" weight="medium">
              New Messages
            </Typography>
            <StyledProfileMenuLink
              component="a"
              color="secondary"
            >
              {messages.length} New Messages
            </StyledProfileMenuLink>
          </StyledProfileMenuUser>
          {messages.map(message => (
            <MenuItem key={message.id}>
              <StyledMessageNotification>
                <StyledMessageNotificationSide>
                  <UserAvatar color={message.variant} name={message.name} />
                  <Typography size="sm" color="text" colorBrightness="secondary">
                    {message.time}
                  </Typography>
                </StyledMessageNotificationSide>
                <StyledMessageNotificationBodySide>
                  <Typography weight="medium" gutterBottom>
                    {message.name}
                  </Typography>
                  <Typography color="text" colorBrightness="secondary">
                    {message.message}
                  </Typography>
                </StyledMessageNotificationBodySide>
              </StyledMessageNotification>
            </MenuItem>
          ))}
          <Fab
            variant="extended"
            color="primary"
            aria-label="Add"
            component={StyledSendMessageButton}
          >
            Send New Message
            <StyledSendButtonIcon>
              <SendIcon />
            </StyledSendButtonIcon>
          </Fab>
        </StyledHeaderMenu>
        <StyledHeaderMenu
          id="notifications-menu"
          open={Boolean(notificationsMenu)}
          anchorEl={notificationsMenu}
          onClose={() => setNotificationsMenu(null)}
          disableAutoFocusItem
        >
          {notifications.map(notification => (
            <StyledHeaderMenuItem
              key={notification.id}
              onClick={() => setNotificationsMenu(null)}
            >
              <Notification {...notification} typographyVariant="inherit" />
            </StyledHeaderMenuItem>
          ))}
        </StyledHeaderMenu>
        <StyledProfileMenu
          id="profile-menu"
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          disableAutoFocusItem
        >
          {/* <StyledProfileMenuUser>
            <Typography variant="h4" weight="medium">
              {user.usuario}
            </Typography> */}
          {/* <StyledProfileMenuLink
              component="a"
              color="primary"
              href=""
            >
              Sole
            </StyledProfileMenuLink> */}
          {/* </StyledProfileMenuUser> */}
          {/* <StyledProfileMenuItem>
            <StyledProfileMenuIcon /> Profile
          </StyledProfileMenuItem> */}
          {/* <StyledProfileMenuItem>
            <StyledProfileMenuIcon /> Tasks
          </StyledProfileMenuItem> */}
          <StyledProfileMenuItem>
            <StyledProfileMenuIcon /> Messages
          </StyledProfileMenuItem>
          <StyledProfileMenuUser>
            <StyledProfileMenuLink
              color="primary"
              onClick={() => handleLogout()}
              to="/login"
            >
              Log out
            </StyledProfileMenuLink>
          </StyledProfileMenuUser>
        </StyledProfileMenu>
      </StyledToolbar>
    </StyledAppBar>
  );
}
function mapStateToProps(state) {
  const { users, authentication } = state;
  const { user } = authentication;
  return {
    user,
    users
  };
}
const connectedHeader = connect(mapStateToProps)(Header);
export default withRouter(connectedHeader);
