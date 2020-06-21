import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute_ = ({ component: Component, ...rest }) => (
    
    <Route {...rest} render={props => (        
        rest.loggedIn && localStorage.getItem('user_tokens')
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
)

function mapStateToProps(state) {
    const { loggedIn } = state.authentication;
    return {
        loggedIn
    };
}

const PrivateRoute = connect(mapStateToProps)(PrivateRoute_)
export {PrivateRoute};