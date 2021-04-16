import { userConstants } from '../constants';
import { alertConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';
import { authHeader, history } from '../helpers';

export const userActions = {
    login,
    logout,
    getAll,
    login_with_jwt_token,
    verify_token,
    validate_role,
    login_with_token
};

function save_user(information) { return { type: userConstants.SAVE_USER_INFO, information } }
function clean_user() { return { type: userConstants.CLEAN_USER_INFO } }
function login(username, password, location) {
    console.log("EN EL LOGIN NORMAL")
    return dispatch => {
        dispatch(request({ username }));
        dispatch(alertActions.loading("Cargando..."));
        userService.login(username, password)
            .then(
                obj => {
                    console.log(obj)
                    const { response } = obj
                    if (!obj.error) {
                        const { data: { sistemas, ...credentials }, msg } = response
                        const { access_token } = credentials
                        localStorage.setItem('user_tokens', JSON.stringify(response.data));
                        dispatch(validate_role(username, location))
                        // dispatch(success({ username, access_token }));
                        // dispatch(save_user({ permissions: sistemas, credentials }))
                        // localStorage.setItem('user', JSON.stringify({ username, access_token }));
                        // localStorage.setItem('credentials', JSON.stringify(credentials));
                        // localStorage.setItem('permissions', JSON.stringify(sistemas));
                        // dispatch(alertActions.success(msg));
                        // setTimeout(() => {
                        //     history.push('/launch');
                        // }, 500)
                    }
                    else {
                        //dispatch(failure(obj.response));
                        console.log("Error from actions:")
                        console.log(obj)
                        setTimeout(() => {
                            dispatch(failure(obj.response))
                            dispatch(alertActions.error(capitalize(String(obj.response.msg))))
                        }, 500)
                    }

                    //history.push("/#/app/dashboard");
                    // dispatch(alertActions.success('Autentificación satisfactoria!'));

                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    // function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function validate_role(username, location) {
    return dispatch => {
        userService.permissions(username, (obj) => {
            if (!obj.error && obj.response.data.role_name === "Admin") {
                const { response } = obj;
                console.log(obj)
                setTimeout(() => {
                    dispatch(alertActions.success('Successful authentication'))
                    dispatch(success(response))
                }, 500)

                if (location == null) {
                    setTimeout(() => history.push('/'), 500)
                } else {
                    setTimeout(() => history.push(location), 500)
                }
                // 

                console.log("#history -> ", history)
                console.log("#history pathname -> ", location)

                // localStorage.setItem('user_tokens', JSON.stringify(response));
                //sleeper_action(500, () => {})


            } else if (!obj.error && obj.response.data.role_name !== "Admin") {
                console.log("Error from actions:")
                console.log("Error from validate_role -> " + obj)
                setTimeout(() => {
                    dispatch(failure(obj.response))
                    dispatch(alertActions.error("You aren't an administrator"))
                }, 500)


            } else {
                const { response: { msg } } = obj;
                //dispatch(failure(obj.response));
                console.log("Error from actions:")
                console.log("Error from validate_role -> " + obj)
                setTimeout(() => {
                    dispatch(failure(obj.response))
                    dispatch(alertActions.error(msg))
                }, 500)

            }

        })
    };

    // function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function login_with_jwt_token(access_token, pathname) {
    console.log("EN EL LOGIN WITH TOKEN")
    return dispatch => {
        userService.validate_token(access_token)
            .then(
                obj => {
                    console.log(obj)
                    const { response } = obj;
                    console.log(response)
                    if (response.error !== true) {
                        const { data: { permissions, ...credentials }, msg, username } = response
                        // const { access_token } = credentials                        

                        console.log(response)
                        localStorage.setItem('user', JSON.stringify({ username, access_token }));
                        localStorage.setItem('credentials', JSON.stringify(credentials));
                        localStorage.setItem('permissions', JSON.stringify(permissions));

                        dispatch(request({ username }));
                        dispatch(success({ username, access_token }));
                        dispatch(save_user({ permissions, credentials }))

                        dispatch(alertActions.success(msg));
                        setTimeout(() => {
                            history.push('/launch');
                        }, 500)

                        // console.log(response)
                        // dispatch(success(response));
                        // localStorage.setItem('user', JSON.stringify(response));
                        // console.log(process.env.REACT_APP_API_USUARIOS)
                        // history.push(pathname);
                    }
                    else {
                        // dispatch(logout())
                        console.log(response)
                        dispatch(failure(response.msg));
                        dispatch(alertActions.error(capitalize(response.msg)));
                        // setTimeout(() => {
                        //     history.push('/login');
                        // }, 500)

                    }

                    // history.push('/');
                    //history.push("/#/app/dashboard");
                    // dispatch(alertActions.success('Autentificación satisfactoria!'));

                }
            )
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function login_with_token() {
    return dispatch => {
        // dispatch(request({ username }));
        userService.validate_token(authHeader(), (obj) => {
            if (!obj.error) {
                // const { response: { data } } = obj;
                console.log(obj)
                dispatch(success(obj.response.msg))
                setTimeout(() => {
                    dispatch(alertActions.success(capitalize(String(obj.response.msg))))
                }, 500)
                // localStorage.setItem('user_tokens', JSON.stringify(data));
                // dispatch(validate_role(username))
                //sleeper_action(500, () => {})

            } else {
                dispatch(failure(obj.response));
                dispatch(alertActions.error(capitalize(String(obj.response.msg))))
                console.log("Error from login_with_token -> " + obj)
            }

        })
    };

    // function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function verify_token(access_token, pathname) {
    return dispatch => {
        userService.verify_token(access_token)
            .then(
                obj => {
                    console.log(obj)
                    const { response } = obj;
                    console.log(response)
                    if (response.error) {
                        dispatch(logout())
                        console.log(response)
                        dispatch(failure(response.msg));
                        dispatch(alertActions.error(capitalize(response.msg)));
                        // history.push(pathname);
                    }
                    else {
                        console.log(response.msg)
                        // history.push(pathname);
                        // setTimeout(() => {
                        //     history.push(pathname);
                        // }, 500)
                    }

                    // history.push('/');
                    //history.push("/#/app/dashboard");
                    // dispatch(alertActions.success('Autentificación satisfactoria!'));

                }
            )
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
        dispatch(clean_user())
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
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1).toLocaleLowerCase()
}