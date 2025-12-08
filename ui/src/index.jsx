import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";


import Themes from "./themes";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { LayoutProvider } from "./context/LayoutContext";
//import { UserProvider } from "./context/UserContext";

// CHANGES TO ADD REDUX SUPPORT
import { Provider } from 'react-redux';

import { store } from 'store/store';

// Setup fake backend
//import { configureFakeBackend } from './redux/testing/fake-backend.js';
//configureFakeBackend();
//notistack
import { SnackbarProvider } from "notistack";
import classnames from "classnames";
import CircularProgress from "@mui/material/CircularProgress";


console.log( process.env )

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',

      }}
      iconVariant={{
        default: <CircularProgress size={30} thickness={5} style={{ color: "#fff", padding: "2px", marginRight: "10px" }} />
      }}>
      <LayoutProvider>
        {/*<UserProvider>*/}
        <ThemeProvider theme={Themes.default}>
          <CssBaseline />
            <App />
        </ThemeProvider>
        {/*</UserProvider>*/}
      </LayoutProvider>
    </SnackbarProvider>
  </Provider>,
);

// ReactDOM.hydrate(
//   <Loader />,
//   document.getElementById("root"),
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
