import React from 'react';
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { userActions } from '../../store/actions'
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux'

const PrivateRoute_ = ({ children, loggedIn }) => {
    const dispatch = useDispatch()
    const location = useLocation()

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token')
        if (token !== null) {
            dispatch(userActions.login_with_jwt_token(token, location.pathname))
        } else {
            dispatch(userActions.login_with_token())
        }
    }, [location]) //Run every change location

    return loggedIn && localStorage.getItem('user_tokens')
        ? children
        : <Navigate to={{ pathname: '/login', state: { from: location } }} />
}

function mapStateToProps(state) {
    const { loggedIn } = state.authentication;
    return {
        loggedIn
    };
}

const PrivateRoute = connect(mapStateToProps)(PrivateRoute_)
export { PrivateRoute };
