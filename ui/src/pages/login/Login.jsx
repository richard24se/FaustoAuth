import React, { useState, useEffect } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Grow,
} from "@mui/material";
//import { Typography } from '../../components/Wrappers'
import { withRouter } from "react-router-dom";
import classnames from "classnames";


// styles
import { StyledContainer, StyledLogotypeContainer, StyledLogotypeImage, StyledLogotypeText, StyledFormContainer, StyledForm, StyledTab, StyledGreeting, StyledSubGreeting, StyledGoogleButton, StyledGoogleButtonCreating, StyledGoogleIcon, StyledCreatingButtonContainer, StyledCreateAccountButton, StyledFormDividerContainer, StyledFormDividerWord, StyledFormDivider, StyledErrorMessage, StyledLoginTextField, StyledFormButtons, StyledForgetButton, StyledLoginLoader, StyledCopyright, StyledFormButtonsCenter } from "./styles";
//Colors Styles
import { hooksStyles } from '../../themes/colors';

// logo
import logo from "../../themes/logo.png";
import fausto from "../../themes/fausto.png";
//import google from "../../images/google.svg";

// context
//import { useUserDispatch, loginUser } from "../../context/UserContext";

//Redux actions
import { connect } from 'react-redux';
import { userActions } from '../../store/actions';

import findIP from './findIP';
//import { useTheme, makeStyles } from "@mui/material/styles";

function Login(props) {
  var colors = hooksStyles();

  // global
  //var userDispatch = useUserDispatch();

  // local
  //var [isLoading, setIsLoading] = useState(false);
  //var [error, setError] = useState(null);
  var [activeTabId, setActiveTabId] = useState(0);
  //var [nameValue, setNameValue] = useState("");
  var [loginValue, setLoginValue] = useState("admin@faustoauth.app");
  var [passwordValue, setPasswordValue] = useState("$admin");
  //IP Value
  var [IPValue, setIPValue] = useState("Loading..");


  //Handle init state
  const { dispatch } = props;
  const { history } = props;

  useEffect(() => {
    //Get Logout
    dispatch(userActions.logout())
    //Get IP
    /*
    getIP(function(local_ip){
      console.log(local_ip);
      setIPValue(local_ip);
    })*/
    findIP.then(ip => setIPValue(ip))
  }, [dispatch]);

  //Handle login
  var handleLogin = (e) => {
    const previousLocation = props.location.state && props.location.state.from ? props.location.state.from.pathname : null
    dispatch(userActions.login(loginValue, passwordValue, previousLocation, history));


  };

  const { loggingIn } = props;
  const { alert } = props;

  return (
    <StyledContainer container>
      <StyledLogotypeContainer>
        <StyledLogotypeImage src={logo} alt="logo" />
        <img src={fausto} alt="fausto" style={{ width: 200 }} />
        {/* <StyledLogotypeText>Fausto Auth</StyledLogotypeText> */}
      </StyledLogotypeContainer>
      <StyledFormContainer>
        <StyledForm>
          <Tabs
            value={activeTabId}
            onChange={(e, id) => setActiveTabId(id)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <StyledTab label="Login" />
            {/*<Tab label="New User" classes={{ root: classes.tab }} />*/}
          </Tabs>
          {activeTabId === 0 && (
            <React.Fragment>
              <StyledGreeting variant="h5">
                Enter your credentials to access Auth

              </StyledGreeting>
              <Grow in={alert.message ? true : false}>
                <StyledErrorMessage className={classnames(
                  alert.loading ? colors.grey : alert.has_error ? colors.red : colors.green)
                }>
                  {alert.message}
                </StyledErrorMessage>
              </Grow>
              <StyledLoginTextField
                id="email"
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Username"
                type="text"
                variant="filled"
                fullWidth

              />
              <StyledLoginTextField
                id="password"
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Password"
                type="password"
                variant="filled"
                fullWidth
                onKeyPress={(ev) => {
                  if (ev.key === 'Enter') {
                    handleLogin()
                  }
                }}
              />
              {/* <TextField
                id="ip_address"
                label="Dirección IP"
                value={IPValue}
                //defaultValue="No se encuentra IP!"
                className={classes.textField}
                margin="normal"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              /> */}
              <StyledFormButtonsCenter>
                {loggingIn ? (
                  <StyledLoginLoader><CircularProgress size={26} /></StyledLoginLoader>
                ) : (
                  <Button
                    disabled={
                      loginValue.length === 0 || passwordValue.length === 0
                    }
                    onClick={() =>
                      handleLogin()
                    }
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    onKeyPress={(ev) => {
                      console.log(`Pressed keyCode ${ev.key}`);
                      if (ev.key === 'Enter') {
                        alert("presionó enter!")
                      }
                    }}
                  >
                    Sign in
                  </Button>
                )}
                {/* 
                <Button
                  color="primary"
                  size="large"
                  className={classes.forgetButton}
                >
                  Forget Password
                </Button>*/}
              </StyledFormButtonsCenter>
            </React.Fragment>
          )}
        </StyledForm>
        <StyledCopyright color="primary">
          © 2020 Fausto. All rights reserved.
        </StyledCopyright>
      </StyledFormContainer>
    </StyledContainer>
  );
}

function mapStateToProps(state) {
  const { loggingIn } = state.authentication;
  const { alert } = state
  return {
    loggingIn,
    alert
  };
}


const connectedLoginPage = connect(mapStateToProps)(Login);

export default withRouter(connectedLoginPage);




//export default connectedLoginPage;
