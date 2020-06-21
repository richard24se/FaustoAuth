import React from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

// components
import Layout from "./Layout/Layout";
import { EasySnackbar } from './EasyMaterial/EasyMaterialComponents'

// pages
import Error from "../pages/error/Error";
import Login from "../pages/login/Login";

// context
//import { useUserState } from "../context/UserContext";

//Private route to validate token on localstorage
import { PrivateRoute } from "./CustomRoutes";

//Redux history
import { history } from '../redux/helpers';
//Redux
import { connect } from 'react-redux';
import { fotchActions } from '../redux/actions'


function mapStateToProps(state) {
  const { success, warning, error, processing, message } = state.fotch;
  return {
    success,
    warning,
    error,    
    processing,
    message
  };
}


export default connect(mapStateToProps) (function App(props) {
  // global
  //var { isAuthenticated } = useUserState();
  
  //redux
  const { dispatch } = props;
  const { success, warning, error, processing, message } = props;
  return (
    <>
    <HashRouter history={history}>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/app/maintenance/create_user" />} />
        <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/maintenance/create_user" />}
        />
        <PrivateRoute path="/app" component={Layout} />
        <Route path="/login" component={Login} />
        <Route component={Error} />
      </Switch>
    </HashRouter>
    <EasySnackbar type="processing" message={message ? message : "Procesando..."} open={processing} handleClose={() => dispatch(fotchActions.clear())}/>
    <EasySnackbar type="success" message={message} open={success} handleClose={() => dispatch(fotchActions.clear())}/>
    <EasySnackbar type="warning" message={message} open={warning} handleClose={() => dispatch(fotchActions.clear())}/>
    <EasySnackbar type="error" message={message} open={error} handleClose={() => dispatch(fotchActions.clear())}/>
    </>
  );

  // #######################################################################
  /*
  function PrivateRoute_old({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
            React.createElement(component, props)
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          )
        }
      />
    );
  }

  function PublicRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          ) : (
            React.createElement(component, props)
          )
        }
      />
    );
  }*/
})
