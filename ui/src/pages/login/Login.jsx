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
} from "@material-ui/core";
//import { Typography } from '../../components/Wrappers'
import { withRouter } from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

//Colors Styles
import {hooksStyles} from '../../themes/colors';

// logo
import logo from "../../themes/logo.png";
import fausto from "../../themes/fausto.png";
//import google from "../../images/google.svg";

// context
//import { useUserDispatch, loginUser } from "../../context/UserContext";

//Redux actions
import { connect } from 'react-redux';
import { userActions } from '../../redux/actions';

import findIP from './findIP';
//import { useTheme, makeStyles } from "@material-ui/styles";

function Login(props) {
  var classes = useStyles();
  var colors = hooksStyles();

  // global
  //var userDispatch = useUserDispatch();

  // local
  //var [isLoading, setIsLoading] = useState(false);
  //var [error, setError] = useState(null);
  var [activeTabId, setActiveTabId] = useState(0);
  //var [nameValue, setNameValue] = useState("");
  var [loginValue, setLoginValue] = useState("");
  var [passwordValue, setPasswordValue] = useState("");
  //IP Value
  var [IPValue, setIPValue] = useState("Cargando..");

  
  //Handle init state
  const {dispatch} = props;
  
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
  var handleLogin = (e) =>{
    const previousLocation = props.location.state && props.location.state.from ?  props.location.state.from.pathname : null
    dispatch(userActions.login(loginValue, passwordValue, previousLocation));
  };

  const { loggingIn } = props;
  const { alert } = props;

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img src={logo} alt="logo" className={classes.logotypeImage} />
        <img src={fausto} alt="fausto" style={{width: 200}} />
        {/* <Typography className={classes.logotypeText}>Fausto Auth</Typography> */}
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <Tabs
            value={activeTabId}
            onChange={(e, id) => setActiveTabId(id)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Login" classes={{ root: classes.tab }} />
            {/*<Tab label="New User" classes={{ root: classes.tab }} />*/}
          </Tabs>
          {activeTabId === 0 && (
            <React.Fragment>
              <Typography variant="h5" className={classes.greeting}>
                Enter your credentials to access Auth
                
              </Typography>
              <Grow in={ alert.message ? true : false}>
                <Typography  color="primary" className={classnames(
                  classes.errorMessage, alert.loading ? colors.grey : alert.has_error ? colors.red : colors.green )
                }>
                  {alert.message}
                </Typography>
              </Grow>
              <TextField
                id="email"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Username"
                type="text"
                fullWidth
              />
              <TextField
                id="password"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Password"
                type="password"
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
              <div className={classes.formButtonsCenter}>
                {loggingIn ? (
                  <CircularProgress size={26} className={classes.loginLoader} />
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
              </div>
            </React.Fragment>
          )}
        </div>
        <Typography color="primary" className={classes.copyright}>
          © 2020 Fausto. All rights reserved.
        </Typography>
      </div>
    </Grid>
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

export default withRouter( connectedLoginPage );




//export default connectedLoginPage;
