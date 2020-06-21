import { sleeper } from './fun'
const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
};

const handleResponseFetch = (response) => {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                window.location.reload(true);
            }
            if (response.status === 404) {
                //404
                let data_full = Object.assign({}, data, {
                    status: response.status,
                    statusText: response.statusText,
                    msg: "Error 404, not found service",
                })
                return Promise.reject(data_full);
            }
            // console.log(data);
            // console.log(data.message);
            // console.log(response.statusText);
            // console.log(error);
            //console.log("Error type from server: "+response.status);
            //console.log("Error text from server: "+response.statusText);
            let data_full = Object.assign({}, data, {
                status: response.status,
                statusText: response.statusText
            })
            return Promise.reject(data_full);
        }
        let data_full = Object.assign({}, data, {
            status: response.status,
            statusText: response.statusText
        })
        return data_full;
    });
}


const OPTIONS = {
    method: 'GET',
    data: {},
    queryParams: {},
    alwaysTriggerCallback: false,
    callback: undefined,
    extraCallbackParams: {},
    headers: {
        // 'Accept':       'application/json',
        'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: null
}

class Fotch {

    // region Constructor

    /**
     * Constructor
     *
     * @param {String} baseUrl        Base URL prefix for all requests
     * @param {Object} defaultOptions Default options for all requests
     */
    constructor(baseUrl = '', defaultOptions = {}) {
        //super()

        this.baseUrl = baseUrl
        this.defaultOptions = Object.assign({}, OPTIONS, defaultOptions)
    }
    /**
     * Perform request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    request(url, callback, options) {
        options = Object.assign({}, this.defaultOptions, options)
        options.method = options.method.toUpperCase()
        //Validate URL
        try {
            var neo_url = new URL(url)

        } catch{
            alert("Error with URL, please check .env or syntax")
            console.log("Error with URL, please check .env or syntax")
        }

        //query params object
        const { queryParams: params } = options
        //add query params to neo url
        Object.keys(params).forEach(key => neo_url.searchParams.append(key, params[key]))
        if (options.body) {
            delete options.headers;
            //options.headers = { 'Content-Type': 'multipart/form-data' }
        }
        if (options.method !== 'GET' && options.body === null)
            options.body = options.data ? JSON.stringify(options.data) : null
        console.log("#------>Debug request options<------#")
        console.log(options)
        fetch(neo_url, options)
            .then(handleResponseFetch)
            //.then(sleeper(1))
            .then((response) => {
                return response
            })
            .then((response) => {
                const { status, statusText, ...rest } = response

                let args = Object.assign({
                    status: status,
                    statusText: statusText,
                    response: rest,
                    error: response.error ? response.error : false
                }, options.extraCallbackParams)

                if (callback) {
                    callback(args)
                }

                if (options.callback) {
                    options.callback(args)
                }
            })
            .catch((error) => {
                let args
                console.log(error)
                if (error.message === 'Failed to fetch') {

                    args = {
                        response: { msg: "Error en el servidor, tiempo de espera expirado!" },
                        error: true
                    }
                }
                else if (error instanceof TypeError) {
                    args = Object.assign({
                        status: null,
                        statusText: null,
                        response: { msg: error.message },
                        error: true
                    }, options.extraCallbackParams)
                    console.log("#------>Debug Error Args TypeError<------#")
                    console.log(args)
                }
                else {
                    const { status, statusText, ...rest } = error
                    args = Object.assign({
                        status: status,
                        statusText: statusText,
                        response: rest,
                        error: true
                    }, options.extraCallbackParams)
                    console.log("#------>Debug Error Args<------#")
                    console.log(args)
                }

                if (callback) {
                    callback(args)
                }
                if (options.callback && options.alwaysTriggerCallback) {
                    options.callback(args)
                }
            })
    }
    /**
     * Perform GET request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    get(url, callback, options) {
        options = Object.assign({ method: 'get' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }
    /**
     * Perform POST request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    post(url, callback, options) {
        options = Object.assign({ method: 'post' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }
    /**
     * Perform PUT request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    put(url, callback, options) {
        options = Object.assign({ method: 'put' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }

    /**
     * Perform PATCH request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    patch(url, callback, options) {
        options = Object.assign({ method: 'patch' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }

    /**
     * Perform DELETE request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    del(url, callback, options) {
        options = Object.assign({ method: 'delete' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }


}
export { requestOptions, handleResponseFetch, Fotch }
