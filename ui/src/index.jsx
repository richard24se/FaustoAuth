import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { StylesProvider } from '@material-ui/core/styles';

import Themes from "./themes";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { LayoutProvider } from "./context/LayoutContext";
//import { UserProvider } from "./context/UserContext";

// CHANGES TO ADD REDUX SUPPORT
import { Provider } from 'react-redux';

import { store } from 'redux/store';

// Setup fake backend
//import { configureFakeBackend } from './redux/testing/fake-backend.js';
//configureFakeBackend();
//notistack
import { SnackbarProvider } from "notistack";
import classnames from "classnames";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

// import Loader from './loader'

const IconCircularProgress = withStyles({
  root: {
    color: "#fff",
    padding: "2px",
    marginRight: "10px"
  }
})((props) => {
  const { classes, className } = props;
  return (
    <CircularProgress
      className={classnames(classes.root, className)}
      size={30}
      thickness={5}
    />
  );
});

console.log( process.env )

ReactDOM.hydrate(
  <Provider store={store}>
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',

      }}
      iconVariant={{
        default: <IconCircularProgress />
      }}>
      <LayoutProvider>
        {/*<UserProvider>*/}
        <ThemeProvider theme={Themes.default}>
          <CssBaseline />
          <StylesProvider injectFirst>
            <App />
          </StylesProvider>
        </ThemeProvider>
        {/*</UserProvider>*/}
      </LayoutProvider>
    </SnackbarProvider>
  </Provider>,
  document.getElementById("root"),
);

// ReactDOM.hydrate(
//   <Loader />,
//   document.getElementById("root"),
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
