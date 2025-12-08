import { SI_LS, GI_LS, RI_LS } from '../constants';


let k = ['temporada_id','cultivo_id','planta_id']

const defaultState = k.reduce((o, key) => ({ ...o, [key]: JSON.parse(localStorage.getItem(key)) }), {})

export const localstorage = (state = defaultState, action) => {
    switch (action.type) {
        case SI_LS:
            return {
                ...state,
                [action.key]: action.value                
            };

        case GI_LS:
            return {
                ...state,
                notifications: state.notifications.map((notification) =>
                    action.dismissAll || notification.key === action.key
                        ? { ...notification, dismissed: true }
                        : { ...notification }
                )
            };

        case RI_LS:
            const rest = {...state}
            delete rest[action.key]
            return rest

        default:
            return state;
    }
};