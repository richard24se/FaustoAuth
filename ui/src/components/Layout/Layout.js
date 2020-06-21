import React from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";

// pages
import Dashboard from "../../pages/dashboard";
import Typography from "../../pages/typography";
import Notifications from "../../pages/notifications";
import Maps from "../../pages/maps";
import Tables from "../../pages/tables";
import Icons from "../../pages/icons";
import Charts from "../../pages/charts";
import { createRole, createUser, createObject, createPermission } from "../../pages/maintenance/";
import { audit } from "../../pages/audit/";



// context
import { useLayoutState } from "../../context/LayoutContext";


function Layout(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();

  return (
    <div className={classes.root}>
        <>
          <Header history={props.history} />
          <Sidebar />
          <div
            className={classnames(classes.content, {
              [classes.contentShift]: layoutState.isSidebarOpened,
            })}
          >
            <div className={classes.fakeToolbar} />
            <Switch>
              {/* INICIO */}
              <Route path="/app/dashboard" component={Dashboard} />

              {/* MANTENIMIENTO */}
              <Route path="/app/maintenance/create_user" component={createUser} />
              <Route path="/app/maintenance/create_role" component={createRole} />
              <Route path="/app/maintenance/create_object" component={createObject} />
              <Route path="/app/maintenance/create_permission" component={createPermission} />

              {/* CONSULTAS */}
              <Route path="/app/audit/audit" component={audit} />

              <Route path="/app/typography" component={Typography} />
              <Route path="/app/tables" component={Tables} />
              <Route path="/app/notifications" component={Notifications} />
              <Route
                exact
                path="/app/ui"
                render={() => <Redirect to="/app/ui/icons" />}
              />
              <Route path="/app/ui/maps" component={Maps} />
              <Route path="/app/ui/icons" component={Icons} />
              <Route path="/app/ui/charts" component={Charts} />
              

              <Redirect to='/' />
            </Switch>
          </div>
        </>
    </div>
  );
}

export default withRouter(Layout);
