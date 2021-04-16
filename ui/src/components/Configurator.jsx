
import React from "react";
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appActions } from '../redux/actions'




import { structure, SYSTEM, APPS, validateMetaData } from 'custom/config'

const getRoutes = (struct, validateMetaData) => {
    let routes = []
    struct.forEach(element => {
        if (element.children != undefined) {
            console.log("structure have childrens")
            let children_routes = getRoutes(element.children, validateMetaData)
            routes.push(...children_routes)
        } else if (element.link && element.component != null) {
            const route = { path: element.link, component: element.component != null && element.component }
            if (validateMetaData && validateMetaData(element.metadata)) {
                routes.push(route)
            } else if (!validateMetaData) {
                console.log("no metadata func")
                routes.push(route)
            }
            // routes.push(route)

        }
    });
    return routes
}


const getStructure = (struct, validateMetaData) => {
    console.log("create structure")
    let new_struct = []
    struct.forEach(element => {
        if (element.children != undefined) {
            console.log("structure have childrens")
            let children_struct = getStructure(element.children, validateMetaData)
            const new_element = { ...element, children: children_struct }
            if (validateMetaData && validateMetaData(element.metadata)) {
                new_struct.push(new_element)
            } else if (!validateMetaData) {
                new_struct.push(new_element)
            }
        } else if (element.type === "title" || element.type === "divider") {
            new_struct.push(element)
        } else {
            if (validateMetaData && validateMetaData(element.metadata)) {
                new_struct.push(element)
            } else if (!validateMetaData) {
                new_struct.push(element)
            }
        }
    });
    return new_struct
}

const Configurator = () => {
    const dispatch = useDispatch();

    const permissions = useSelector(state => state.user.permissions) || []
    const system = permissions.find(s => s.sistema_id === SYSTEM) || []
    const modules = []
    for (let index = 0; index < APPS.length; index++) {
        const app = APPS[index];
        const applications = system.aplicaciones ? system.aplicaciones.find(x => x.aplicacion_id === app) : null
        if (applications)
            modules.push(...applications.modulos)

    }
    
    useEffect(() => {
        console.log(system)
        const routes = getRoutes(structure);
        const filtered_routes = getRoutes(structure, (metaData) => validateMetaData(metaData, modules));
        const filtered_structure = getStructure(structure, (metaData) => validateMetaData(metaData, modules))
        dispatch(appActions.setRoutes(routes))
        dispatch(appActions.setFilteredRoutes(filtered_routes))
        dispatch(appActions.setStructure(structure))
        dispatch(appActions.setFilteredStructure(filtered_structure))
        // dispatch(appActions.setRoutes(routes))
    }, [permissions])

    return null
}

export { Configurator }