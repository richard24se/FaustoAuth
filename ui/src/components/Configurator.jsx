import React, { useEffect } from "react";

//Redux
import { useDispatch, useSelector } from 'react-redux';
import { appActions } from 'store/actions';

//Modules
import { modules, system } from 'store/modules';

//Hooooks
import useUser from 'custom/hooks/useUser';

const Configurator_ = (props) => {
    const dispatch = useDispatch()
    const { user, handleUser } = useUser();
    //const user = useSelector(state => state.authentication.user);

    useEffect(() => {
        //handleUser()
        var create_structure = (array) => {

            var structure = []
            array.forEach(father => {
                if (father.childrens) {
                    var childrens = []
                    father.childrens.forEach(children => {
                        if (user && user.metadata && user.metadata.func) {
                            if (user.metadata.func.includes(children.func)) {
                                childrens.push(children)
                            }
                        } else {
                            childrens.push(children)
                        }
                    })
                    if (childrens.length > 0) {
                        father.childrens = childrens
                        structure.push(father)
                    }
                } else {
                    structure.push(father)
                }

            })
            return structure
        }
        var routes = []
        var create_routes = (array) => {

            array.forEach(father => {
                if (father.childrens) {
                    create_routes(father.childrens)
                } else {
                    routes.push(father)
                }
            })
            return routes
        }
        if (user) {
            var filtered_modules = create_structure(modules)
            var filtered_system = create_structure(system)
            var filtered_routes = create_routes(filtered_modules).concat(create_routes(filtered_system))

            dispatch(appActions.set_filtered_structure(filtered_modules, filtered_system))
            dispatch(appActions.set_filtered_routes(filtered_routes))
        }

    }, [user, dispatch]) //It will be render when user load in redux store

    return (
        <></>
    )
};


export const Configurator = Configurator_;//connect(mapStateToProps)(Configurator_);
