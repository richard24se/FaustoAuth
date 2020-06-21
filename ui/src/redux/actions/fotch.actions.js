import { fotchConstants } from '../constants';



const go_success = (message) => {
    return { type: fotchConstants.SUCCESS, message }
}
const clear_success = () => {
    return { type: fotchConstants.CLEAR_SUCCESS }
}
const success = (message) => {
    return (dispatch, getState) => {
        const state = getState()
        const { processing } = state.fotch

        if (processing === true) {
            dispatch(queue())
            dispatch(clear_processing(true))
            setTimeout(() => {
                dispatch(success(message))
            }, 300)
        } else {
            dispatch(go_success(message))
            setTimeout(() => {
                dispatch(clear_success())
            }, 1024);
        }

    }
}
const go_warning = (message) => {
    return { type: fotchConstants.WARNING, message }
}
const clear_warning = () => {
    return { type: fotchConstants.CLEAR_WARNING }
}
const warning = (message) => {
    return (dispatch, getState) => {
        const state = getState()
        const { processing } = state.fotch
        if (processing === true) {
            dispatch(queue())
            dispatch(clear_processing(true))
            setTimeout(() => {
                dispatch(warning(message))
            }, 300)
        } else {
            dispatch(go_warning(message))
            setTimeout(() => {
                dispatch(clear_warning())
            }, 1024);
        }

    }
}
const go_error = (message) => {
    return { type: fotchConstants.ERROR, message }
}
const clear_error = () => {
    return { type: fotchConstants.CLEAR_ERROR }
}
const error = (message) => {
    return (dispatch, getState) => {
        const state = getState()
        const { processing } = state.fotch
        if (processing === true) {
            dispatch(queue())
            dispatch(clear_processing(true))
            setTimeout(() => {
                dispatch(error(message))
            }, 300)
        } else {
            dispatch(go_error(message))
            setTimeout(() => {
                dispatch(clear_error())
            }, 4824);
        }

    }
}
// const error = (message) => {
//     return dispatch => {
//         dispatch(go_error(message))
//         setTimeout(() => {
//             dispatch(clear_error())
//         }, 4824);
//     }
// }
const queue = () => {
    const _queue = () => {
        return { type: fotchConstants.QUEUE }
    }
    return dispatch => {
        dispatch(_queue())
    }
}


const processing = (message) => {
    const _processing = () => {
        return { type: fotchConstants.PROCESSING, message }
    }
    return (dispatch, getState) => {
        const state = getState()
        const { success, error, processing: processing_state } = state.fotch
        if (success || error || processing_state) {
            setTimeout(() => {
                dispatch(processing(message))
            }, 300)

        } else {
            dispatch(_processing())
        }

    }

}
const clear = () => {
    const _clear = () => {
        return { type: fotchConstants.CLEAR }
    }
    const _off = () => {
        return { type: fotchConstants.OFF }
    }
    return dispatch => {
        setTimeout(() => {
            dispatch(_off())
            setTimeout(() => {
                dispatch(_clear())
            }, 50);
        }, 1);
    }

}
const clear_processing = (force) => {
    const _clear_processing = () => {
        return { type: fotchConstants.CLEAR_PROCESSING, force }
    }
    const _clear = () => {
        return { type: fotchConstants.CLEAR }
    }
    return (dispatch, getState) => {
        const state = getState()
        const { success, error, processing, queue } = state.fotch
        if (force) {
            setTimeout(() => {
                //Se ejecuta porque es force
                dispatch(_clear_processing())
            }, 200)

        }
        else if (success !== true && error !== true && processing === true && queue !== true) {
            setTimeout(() => {
                //Se ejecuta porque no hay success, error, queue y hay processing
                dispatch(_clear_processing())
            }, 200)
        }
        else if (queue) {
            setTimeout(() => {
                //Se ejecuta porque hay queue
                dispatch(clear_processing(force))
            }, 200)
        }
        else {
            setTimeout(() => {
                //Se ejecuta porque es el default
                dispatch(clear_processing(force))
            }, 100)
        }
    }

}

export const fotchActions = {
    success,
    warning,
    error,
    processing,
    clear,
    clear_processing
};