import { fotchConstants } from '../constants';

export function fotch(state = {}, action) {
    switch (action.type) {
        case fotchConstants.SUCCESS:
            return {
                ...state,
                message: action.message,
                success: true,
                queue: true,
            };
        case fotchConstants.WARNING:
            return {
                ...state,
                message: action.message,
                warning: true,
                queue: true,
            };
        case fotchConstants.ERROR:
            return {
                message: action.message,
                error: true,
                queue: true,
            };
        case fotchConstants.PROCESSING:
            return {
                ...state,
                message: action.message,
                processing: true
            };
        case fotchConstants.QUEUE:
            return {
                ...state,
                queue: true
            };
        case fotchConstants.OFF:
            return {
                message: state.message
            };
        case fotchConstants.CLEAR_SUCCESS:
            return {
                ...state,
                success: false,
                queue: false,
            };
        case fotchConstants.CLEAR_WARNING:
            return {
                ...state,
                warning: false,
                queue: false,
            };
        case fotchConstants.CLEAR_ERROR:
            return {
                ...state,
                error: false,
                queue: false,
            };
        case fotchConstants.CLEAR_PROCESSING:
            return {
                ...state,
                processing: false,
                force: action.force ? action.force : false
            };
        case fotchConstants.CLEAR:
            return {};
        default:
            return state
    }
}