import React from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";

// styles
import { StyledRoot, StyledContent, StyledFakeToolbar } from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";

// pages
import Dashboard from "../../pages/dashboard";
import Typography from "../../pages/typography";
import Notifications from "../../pages/notifications";
import Maps from "../../pages/maps";
import Tables from "../../pages/tables";
// import Icons from "../../pages/icons";
import Charts from "../../pages/charts";

// context
import { useLayoutState } from "../../context/LayoutContext";

//redux 
import { useSelector } from 'react-redux'

function Layout(props) {
  // global
  var layoutState = useLayoutState();
  const routes = useSelector(state => state.app.filtered_routes) || []
  return (
    <StyledRoot>
      <>
        <Header history={props.history} />
        <Sidebar />
        <StyledContent
          isShifted={layoutState.isSidebarOpened}
        >
          <StyledFakeToolbar />
          <Switch>
            {
              routes.map(e => {
                return <Route exact path={e.path} component={e.component} />
              })
            }



            <Route path="/app/typography" component={Typography} />
            <Route path="/app/tables" component={Tables} />
            <Route path="/app/notifications" component={Notifications} />
            <Route
              exact
              path="/app/ui"
              render={() => <Redirect to="/app/ui/icons" />}
            />
            <Route path="/app/ui/maps" component={Maps} />
            {/* <Route path="/app/ui/icons" component={Icons} /> */}
            <Route path="/app/ui/charts" component={Charts} />


            <Redirect to='/' />
          </Switch>
        </StyledContent>
      </>
    </StyledRoot>
  );
}

export default withRouter(Layout);
