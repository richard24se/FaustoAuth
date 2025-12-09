import React from "react";
import {
  Route,
  Routes,
  Navigate,
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
        <Header />
        <Sidebar />
        <StyledContent
          isShifted={layoutState.isSidebarOpened}
        >
          <StyledFakeToolbar />
          <Routes>
            {
              routes.map(e => {
                return <Route exact path={e.path.replace("/app", "")} element={<e.component />} />
              })
            }



            <Route path="/typography" element={<Typography />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route
              exact
              path="/ui"
              element={<Navigate to="/app/ui/icons" />}
            />
            <Route path="/ui/maps" element={<Maps />} />
            {/* <Route path="/ui/icons" element={<Icons />} /> */}
            <Route path="/ui/charts" element={<Charts />} />


            <Route path="*" element={<Navigate to='/' />} />
          </Routes>
        </StyledContent>
      </>
    </StyledRoot>
  );
}

export default Layout;
