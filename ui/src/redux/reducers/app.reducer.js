import { appConstants } from '../constants';

const initialState = { structure: [], filtered_structure: [], routes: [], filtered_routes: [] }

export function app(state = initialState, action) {
    switch (action.type) {
        case appConstants.STRUCTURE:
            return {
                ...state,
                structure: action.structure
            };
        case appConstants.FILTERED_STRUCTURE:
            return {
                ...state,
                filtered_structure: action.structure
            };
        case appConstants.ROUTES:
            return {
                ...state,
                routes: action.routes
            };
        case appConstants.FILTERED_ROUTES:
            return {
                ...state,
                filtered_routes: action.routes
            };
        default:
            return state
    }
}