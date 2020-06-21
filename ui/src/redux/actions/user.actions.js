import { userConstants } from '../constants';
import { alertConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';
import { history } from '../helpers';

import { sleeper_action } from '../../fausto';

export const userActions = {
    login,
    logout,
    getAll
};



function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));
        userService.login(username, password, (obj) => {
            if (!obj.error) {
                const { response } = obj;
                console.log(obj)
                dispatch(alertActions.success('Autentificación satisfactoria!'))
                dispatch(success(response))
                setTimeout(() => history.push('/'), 500)

                localStorage.setItem('user_tokens', JSON.stringify(response));
                //sleeper_action(500, () => {})
                

            } else {
                //dispatch(failure(obj.response));
                console.log("Error from actions:")
                console.log(obj)
                setTimeout(() => {
                    dispatch(failure(obj.response))
                    dispatch(alertActions.error(capitalize(String(obj.response.msg))))
                }, 500)

            }

        })
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    //history.push('/login')
    return dispatch => {
        userService.logout();
        dispatch(reduce_logout());
        dispatch(reduce_clear_alert());
    }


    //return { type: userConstants.LOGOUT };
    //return { type: alertConstants.CLEAR };
    //dispatch(alertActions.error('Algo está mal con tu contraseña :('));
    function reduce_logout() { return { type: userConstants.LOGOUT } };
    function reduce_clear_alert() { return { type: alertConstants.CLEAR } };
}

function getAll() {
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}

const capitalize = (s) => {
    //console.log(typeof s)
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1).toLocaleLowerCase()
}