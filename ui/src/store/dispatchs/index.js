
import { notiWarn, notiError, notiSuccess, notiInfo, notiLoading, closeSnackbar, removeSnackbar } from '../actions'

import { setItemLS, removeItemLS } from '../actions'

export const mapDispatchToPropsNoti = dispatch => {
    // let notis = {}

    const notis = [
        { name: 'notiwarn', fun: notiWarn },
        { name: 'notierror', fun: notiError },
        { name: 'notisuccess', fun: notiSuccess },
        { name: 'notiinfo', fun: notiInfo },
    ].reduce((o, key) => ({ ...o, [key.name]: (message, time = 4000) => dispatch(key.fun({ message: message, options: { autoHideDuration: time } })).notification.key }), {})
    notis['notiloading'] = (message, time = null) => dispatch(notiLoading({ message: message, options: { autoHideDuration: null } })).notification.key
    //close snackbar
    notis['closesnackbar'] = (...args) => dispatch(closeSnackbar(...args))
    notis['closenoti'] = (...args) => dispatch(closeSnackbar(...args))
    notis['noticlose'] = (...args) => dispatch(closeSnackbar(...args))
    notis['rmnoti'] = (...args) => dispatch(removeSnackbar(...args))
    return notis
}


export const mapDispatchToPropsLocalStorage = dispatch => {
    return {
        'setItemLS': (...args) => dispatch(setItemLS(...args)),
        'removeItemLS': (...args) => dispatch(removeItemLS(...args))
    }
}