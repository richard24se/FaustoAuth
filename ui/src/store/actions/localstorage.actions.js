import { SI_LS, RI_LS } from '../constants';

export const setItemLS = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
    return { type: SI_LS, key, value }
}

export const removeItemLS = (key) => {
    localStorage.removeItem(key)
    return { type: RI_LS, key}
}