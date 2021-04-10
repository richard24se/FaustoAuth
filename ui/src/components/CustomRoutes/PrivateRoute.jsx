import React from 'react';
import { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom';
import { userActions } from '../../redux/actions'
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux'

const PrivateRoute_ = ({ component: Component, ...rest }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        const query = new URLSearchParams(rest.location.search);
        const token = query.get('token')
        if (token !== null) {
            dispatch(userActions.login_with_jwt_token(token, rest.location.pathname))
            console.log("se validará token...")
            console.log(rest.location)
        } else {
            dispatch(userActions.login_with_token())
            console.log("se validará token...")
        }
    }, [rest.location]) //Run every change location
    return <Route {...rest} render={props => (
        rest.loggedIn && localStorage.getItem('user_tokens')
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />

}

function mapStateToProps(state) {
    const { loggedIn } = state.authentication;
    return {
        loggedIn
    };
}

const PrivateRoute = connect(mapStateToProps)(PrivateRoute_)
export { PrivateRoute };