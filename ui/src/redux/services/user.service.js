import { authHeader } from '../helpers';

import { sleeper } from '../../fausto'

//FOTCH
import { Fotch } from "../../fausto";



const config = {
    apiUrl: 'http://localhost:7000',
}

const fotchAuth = new Fotch(process.env.REACT_APP_API_AUTH)

const login = (username, password, fn) => {
    return fotchAuth.post('/auth/login', fn, { data: { username: username, password: password } })
}

const permissions = (username, fn, token) => {
    return fotchAuth.get('/user/permission/' + username, fn, { headers: token ? token : authHeader() })
}


function logout() {
    // remove user from local storage to log user out
    const user = localStorage.getItem('user')
    const token = JSON.parse(user)
    localStorage.removeItem('user');
    localStorage.removeItem('user_tokens');
    localStorage.removeItem('permissions');
    return fotchAuth.del('/auth/logout', (obj) => {
        console.log(obj)
    }, { data: { access_token: token ? token.access_token : "" } })

}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    console.log("old login handle starting...")
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (!response.status) {

            }
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                // window.location.reload(true);
            }

            //const error = (data && data.message) || response.statusText;
            // console.log(data);
            // console.log(data.message);
            // console.log(response.statusText);
            // console.log(error);
            console.log("old login handle #error -> ", data)
            return Promise.reject(data);
        }
        console.log("old login handle -> ", data)
        return data;
    });
}
// function sleeper(ms) {
//     return function (x) {
//         return new Promise(resolve => setTimeout(() => resolve(x), ms));
//     };
// }

// function validate_token(token) {
//     console.log(token)
//     return fotchAuth.get('/auth/verify_access', (obj) => {
//         console.log(obj)
//     }, { headers: auth_header_JWT(token) })
// }
function validate_token(headers, fn) {
    return fotchAuth.get('/auth/token', fn, { headers: headers })
}
// function verify_token(token) {
//     return fotchAuth.get('/auth/verify_token', (obj) => {
//         console.log(obj)
//     }, { headers: auth_header_JWT(token) })
// }

export const userService = {
    login,
    logout,
    getAll,
    permissions,
    validate_token
};