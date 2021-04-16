import { alertConstants } from '../constants';

export const alertActions = {
    success,
    error,
    clear,
    loading
};

function success(message) {
    return { type: alertConstants.SUCCESS, message };
}

function error(message) {
    return { type: alertConstants.ERROR, message };
}

function loading(message) {
    return { type: alertConstants.LOADING, message };
}

function clear() {
    return { type: alertConstants.CLEAR };
}