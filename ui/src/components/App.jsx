import React from "react";
import { useState, useEffect } from 'react'
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

const TrueApp = connect(mapStateToProps)((props) => {
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
      <EasySnackbar type="processing" message={message ? message : "Procesando..."} open={processing} handleClose={() => dispatch(fotchActions.clear())} />
      <EasySnackbar type="success" message={message} open={success} handleClose={() => dispatch(fotchActions.clear())} />
      <EasySnackbar type="warning" message={message} open={warning} handleClose={() => dispatch(fotchActions.clear())} />
      <EasySnackbar type="error" message={message} open={error} handleClose={() => dispatch(fotchActions.clear())} />
    </>
  )
});

const MessageApp = ({ msg }) => {
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "black", display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyCcontent: "center",
      justifyContent: "center"
    }}>
      <p style={{ color: "white", margin: 0 }}>{msg}</p>
    </div>
  )
}

export default connect(mapStateToProps)(function App(props) {
  const [enabled, setEnabled] = useState(null);
  const key = process.env.REACT_APP_KEY;
  useEffect(() => {

    // if (history.location.state && history.location.state.clientes) {
    //   let state = { ...history.location.state };
    //   delete state.clientes;
    //   history.replace({ ...history.location, state });
    // }
    async function fetchData() {
      await fetch('https://fausto.uc.r.appspot.com/keys/' + key)
        .then(function (response) {
          if (response.ok) {
            console.log("OK OK")
            setEnabled(true)
          } else {
            console.log('Respuesta de red OK pero respuesta HTTP no OK');
            setEnabled(false)
          }
        })
        .catch(function (error) {
          console.log('Hubo un problema con la petición Fetch:' + error.message);
          setEnabled(false)
        });
    }
    (async () => fetchData())()
    console.log("pedido...")

  }, [])
  let app;
  if (enabled === true) {
    app = <TrueApp />
  } else if (enabled === false) {
    app = <MessageApp msg= "Invalid key, try to contact richard.24.se@gmail.com"/>
  } else if (enabled === null) {
    app = <MessageApp msg= "Loading app..."/>
  }
  // global
  //var { isAuthenticated } = useUserState();
  return app
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
