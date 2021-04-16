
import { appConstants } from '../constants';



const setStructure = (structure) =>{
    return { type: appConstants.STRUCTURE, structure }
}
const setFilteredStructure = (structure) =>{
    return { type: appConstants.FILTERED_STRUCTURE, structure }
}
const setRoutes = (routes) =>{
    return { type: appConstants.ROUTES, routes }
}
const setFilteredRoutes = (routes) =>{
    return { type: appConstants.FILTERED_ROUTES, routes }
}


export const appActions = {
    setStructure,
    setRoutes,
    setFilteredRoutes,
    setFilteredStructure
}