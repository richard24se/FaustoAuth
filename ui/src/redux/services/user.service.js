import { authHeader } from '../helpers';

import { sleeper } from '../../fausto'

//FOTCH
import { Fotch } from "../../fausto";



const config = {
    apiUrl: 'http://localhost:7000',
}
/*
function login_(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.apiUrl}/users/authenticate`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('API_URL', process.env.REACT_APP_API_USUARIOS)
            return user;
        });
}*/
const fotchAuth = new Fotch(process.env.REACT_APP_API_AUTH)

const login = (username, password, fn) => {
    fotchAuth.post('/auth', fn, {data: {username: username, password: password, option: "login"} })
}

const permissions = (fn) => {
    fotchAuth.get('/permission_user', fn, { headers: authHeader() })
}

// const testPermissions = (token,fn) => {
//     fotchAuth.get('/permission_user', fn, { headers: { 'Authorization': 'Bearer ' + token } })
// }

function login1(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "username": username,
        "password": password,
        "option": "login"
        }),
        mode: 'cors',
    };
    //Create query params
    var url = new URL(process.env.REACT_APP_API_AUTH+`/auth`),
    params = {system: 'fausto'}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    return fetch(url, requestOptions)
        .then(sleeper(500))
        .then(handleResponse)
        .then(user => {
            console.log("catch user!")
            console.log(user)
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }).catch((error) => {
            let args = {
                response: error,
                error:    true,
                msg: !(error instanceof TypeError) ? error.msg : "Error en el servidor, tiempo de espera expirado!"//error
            }
            console.log("catch error!")
            console.log(args)
            return Promise.reject(args);
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('user_tokens');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        console.log("HandleResponse")
        console.log(data)
        console.log(response)
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                window.location.reload(true);
            }

            //const error = (data && data.message) || response.statusText;
            // console.log(data);
            // console.log(data.message);
            console.log("Error type from server: "+response.status);
            console.log("Error text from server: "+response.statusText);
            // console.log(error);
            return Promise.reject(data);
        }

        return data;
    });
}
// function sleeper(ms) {
//     return function(x) {
//       return new Promise(resolve => setTimeout(() => resolve(x), ms));
//     };
//   }

export const userService = {
    login,
    logout,
    getAll,
    permissions
};