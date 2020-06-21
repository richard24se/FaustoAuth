const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
};

const handleResponseFetch = (response)  =>{
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                window.location.reload(true);
            }
            // console.log(data);
            // console.log(data.message);
            // console.log(response.statusText);
            // console.log(error);
            return Promise.reject(data);
        }
        return data;
    });
}


const OPTIONS = {
    method:                'GET',
    data:                  {},
    queryParams:           {},
    alwaysTriggerCallback: false,
    callback:              undefined,
    extraCallbackParams:   {},
    headers: {
       // 'Accept':       'application/json',
        'Content-Type': 'application/json'
    },    
    mode: 'cors',
}

class Fotch {

    // region Constructor

    /**
     * Constructor
     *
     * @param {String} baseUrl        Base URL prefix for all requests
     * @param {Object} defaultOptions Default options for all requests
     */
    constructor (baseUrl = '', defaultOptions = {}) {
        //super()

        this.baseUrl        = baseUrl
        this.defaultOptions = Object.assign({}, OPTIONS, defaultOptions)
    }
    /**
     * Perform request
     *
     * @param {String}   url      URL to send request to
     * @param {Function} callback Callback function to trigger with response
     * @param {Object}   options  Options to use in fetch request
     */
    request (url, callback, options) {
        options        = Object.assign({}, this.defaultOptions, options)
        options.method = options.method.toUpperCase()
        
        var neo_url = new URL(url),
        params = {}
        Object.keys(params).forEach(key => neo_url.searchParams.append(key, params[key]))
        if (options.method !== 'GET')
            options.body =  options.data ? JSON.stringify(options.data) : null
        console.log("#------>Debug request options<------#")
        console.log(options)
        fetch(neo_url, options)
            .then(handleResponseFetch)
            .then((response) => {
                return response
            })
            .then((response) => {
                let args = Object.assign({
                    //promise:  promise,
                    response: response,
                    error:    response.error ? response.error : false
                }, options.extraCallbackParams)

                if (callback) {
                    callback(args)
                }

                if (options.callback) {
                    options.callback(args)
                }
            })
            .catch((error) => {
                let args = Object.assign({
                    //promise:  promise,
                    response: error,
                    error:    true
                }, options.extraCallbackParams)

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
    get (url, callback, options) {
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
    post (url, callback, options) {
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
    put (url, callback, options) {
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
    patch (url, callback, options) {
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
    del (url, callback, options) {
        options = Object.assign({ method: 'delete' }, options)

        this.request(`${this.baseUrl}${url}`, callback, options)
    }        


}
export { requestOptions, handleResponseFetch, Fotch }
