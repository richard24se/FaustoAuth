import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';

//STYLE
import { withStyles } from '@material-ui/styles';
import style from './style'

import Widget from "../../components/Widget";
import {
    EasyButton, EasyAutoSelect, EasyTextField, EasyMuiDataTable
} from "../../components/EasyMaterial/EasyMaterialComponents"

//FOTCH
import { Fotch, capitalize, authHeader } from '../../fausto'

//Redux
import { connect } from 'react-redux';
import { fotchActions } from '../../redux/actions'

// import moment from "moment";

//COMPONENTS
import PageTitle from "../../components/PageTitle/PageTitle";

const fotchAuth = new Fotch(process.env.REACT_APP_API_AUTH)

const FormButton = (props) => {
    if (props.type === "create") {
        return (
            <>
                <Grid item xs={5}>
                    <EasyButton
                        label="Save"
                        type="contained"
                        handle={props.handleChange}
                        startIcon={<SaveIcon />}
                        onClick={props.handleCreate}
                        fullWidth={true}
                    />
                </Grid>
            </>
        );
    }
    else if (props.type === "update") {
        return (
            <>
                <Grid item xs={12}>
                    <Grid container justify="space-between">
                        <Grid xs={5} >
                            <EasyButton
                                label="Update"
                                type="contained"
                                handle={props.handleChange}
                                startIcon={<SaveIcon />}
                                onClick={props.handleUpdate}
                                fullWidth={true}
                            />
                        </Grid>
                        <Grid xs={5} >
                            <EasyButton
                                label="Cancel"
                                type="contained"
                                handle={props.handleChange}
                                startIcon={<SaveIcon />}
                                onClick={props.handleCancel}
                                fullWidth={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </>
        );
    }
    else {
        console.log("Button Type doesn't exist")
        return (<></>)
    }
}


class createPermission_ extends Component {

    constructor(props) {
        super(props);

        const permission_columms = [
            { label: "Permission", name: "name", options: { filter: true, }, },
            { label: "Object", name: "object", options: { filter: true, }, },
            { label: "Permission type", name: "permission_type", options: { filter: true, }, },
            { label: "Creation date", name: "created_date", options: { filter: true, }, },
            { label: "Modificated date", name: "modificated_date", options: { filter: true, }, },
        ];

        this.state = {
            title: "PERMISSION CREATION",
            id_permmission: "",
            permission_name: "",
            object: "",
            objects_list: [],
            permission_type: "",
            permission_types_list: [],
            button_type: "create",
            permissions_table: {
                columns: permission_columms,
                data: []
            },
        };

        this.handleOverride = this.handleOverride.bind(this)
        this.resetForm = this.resetForm.bind(this)

        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleDelete = this.handleDelete.bind(this)

        this.getObjects = this.getObjects.bind(this)
        this.getObjectType = this.getObjectType.bind(this)
        this.getPermissionTypes = this.getPermissionTypes.bind(this)
        this.getPermissions = this.getPermissions.bind(this)
        this.postPermission = this.postPermission.bind(this)
        this.putPermission = this.putPermission.bind(this)
        this.deletePermission = this.deletePermission.bind(this)

    }

    handleOverride = (value, name) => {
        console.log("Value handleOverride", value);
        console.log("handleOverride of " + name + ": " + value);
        if (value !== null) {
            this.setState({ [name]: value });
        } else {
            value = "";
            this.setState({ [name]: value });
        }
    }

    resetForm = () => {
        this.setState({
            id_permmission: "",
            permission_name: "",
            object: "",
            permission_type: "",
            button_type: "create"
        })
    }

    getObjectType = () => {
        fotchAuth.get("/object_types", obj => {
            console.log(obj);
            var format_object_types = []
            if (!obj.error) {
                var object_types = obj.response.data;
                format_object_types = object_types.reduce((o, item)=> { 
                    return {...o, [item.id]: item.name}
                }, {})
                this.setState({
                    object_types: format_object_types
                });
                this.getObjects()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            
        });
    };

    getObjects = () => {
        fotchAuth.get("/object", obj => {
            console.log(obj);
            var format_objects = []
            if (!obj.error) {
                var objects = obj.response.data;
                format_objects = objects.map(item => ({
                    ...item,
                    id: item.id,
                    value: `${item.name} (${this.state.object_types[item.id_object_type]})`
                }));
                this.getPermissionTypes()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState({
                objects_list: format_objects
            });
        });
    };

    getPermissionTypes = () => {
        fotchAuth.get("/permission_types", obj => {
            console.log(obj);
            var format_permission_types = []
            if (!obj.error) {
                var permission_types = obj.response.data;
                format_permission_types = permission_types.map(item => ({
                    ...item,
                    id: item.id,
                    value: capitalize(item.name)
                }));
                this.getPermissions()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState({
                permission_types_list: format_permission_types
            });
        });
    };

    getPermissions = () => {
        // Change id_object_ty for the name
        var obtainObjectName = (id_object) => { for (var object of this.state.objects_list) if (id_object === object.id) return object.name }
        var obtainPermissionTypeName = (id_permission_type) => { for (var permission_type of this.state.permission_types_list) if (id_permission_type === permission_type.id) return capitalize(permission_type.name) }
        this.props.dispatch(fotchActions.processing("Getting Permissions..."))
        fotchAuth.get("/permission", obj => {
            console.log(obj);
            var format_permissions = []
            if (!obj.error) {
                var permissions = obj.response.data;
                format_permissions = permissions.map(item => ({
                    ...item,
                    // name: capitalize(item.name),
                    name: item.name,
                    object: obtainObjectName(item.id_object),
                    permission_type: obtainPermissionTypeName(item.id_permission_type),
                }));
                this.props.dispatch(fotchActions.success(obj.response.msg))
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState(prevState => ({
                permissions_table: {
                    ...prevState.permissions_table,
                    data: format_permissions,
                },
            }));
        });
    };

    postPermission = () => {
        if (this.state.permission_name === "") {
            this.props.dispatch(fotchActions.warning("Fill in the name field"))
        } else if (this.state.object === "") {
            this.props.dispatch(fotchActions.warning("Select an object"))
        } else if (this.state.permission_type === "") {
            this.props.dispatch(fotchActions.warning("Select an permission type"))
        }
        else {
            this.props.dispatch(fotchActions.processing("Saving the permission..."))
            fotchAuth.post("/permission", obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getPermissions()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: {
                        name: this.state.permission_name,
                        // name: capitalize(this.state.permission_name),
                        id_object: this.state.object.value,
                        id_permission_type: this.state.permission_type.value
                    },
                },
            );
        }
    }

    handleUpdate = (dataIndex) => {
        // Change id_object_ty for the name
        var obtainObject = (id_object) => { for (var object of this.state.objects_list) if (id_object === object.id) return { value: object.id, label: object.name } }
        var obtainPermissionType = (id_permission_type) => { for (var permission_type of this.state.permission_types_list) if (id_permission_type === permission_type.id) return { value: permission_type.id, label: permission_type.name } }

        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const permission = this.state.permissions_table.data[dataIndex];
            this.setState({
                button_type: "update",
                permission_name: permission.name,
                id_permission: permission.id,
                object: obtainObject(permission.id_object),
                permission_type: obtainPermissionType(permission.id_permission_type)
            })
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    putPermission = () => {
        if (this.state.permission_name === "") {
            this.props.dispatch(fotchActions.warning("Fill in the name field"))
        } else if (this.state.object === "") {
            this.props.dispatch(fotchActions.warning("Select an object"))
        } else if (this.state.permission_type === "") {
            this.props.dispatch(fotchActions.warning("Select an permission type"))
        }
        else {
            this.props.dispatch(fotchActions.processing("Updating the permission..."))
            fotchAuth.put("/permission/" + this.state.id_permission, obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getPermissions()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: {
                        name: this.state.permission_name,
                        id_object: this.state.object.value,
                        id_permission_type: this.state.permission_type.value
                    },
                },
            );
        }
    }

    handleDelete = dataIndex => {
        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const permission = this.state.permissions_table.data[dataIndex];
            this.deletePermission(permission.id)
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    deletePermission = id_permission => {
        fotchAuth.del("/permission/" + id_permission, obj => {
            console.log(obj);
            this.props.dispatch(fotchActions.processing("Deleting the permission..."))
            if (!obj.error) {
                this.props.dispatch(fotchActions.success(obj.response.msg))
                this.getPermissions()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
        });
    }

    componentDidMount() {
        fotchAuth.updateDefaultOptions({ headers: authHeader() })
        this.getObjectType()
    }

    render() {
        return (
            <>
                <PageTitle title={this.state.title} />
                <div>
                    <Widget disableWidgetMenu >
                        <Grid container spacing={3}>

                            <Grid item xs={12} sm={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.permission_name}
                                    handle={value => this.handleOverride(value, "permission_name")}
                                    label="name"
                                    helperText="Enter permission name (*)"
                                    name={"permission_name"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <EasyAutoSelect
                                    name="object"
                                    state={this.state.object}
                                    handle={value => this.handleOverride(value, "object")}
                                    label="Select object"
                                    dataset={this.state.objects_list}
                                    type="single"
                                    maxMenu={200}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4} >
                                <EasyAutoSelect
                                    name="permission_type"
                                    state={this.state.permission_type}
                                    handle={value => this.handleOverride(value, "permission_type")}
                                    label="Select permission type"
                                    dataset={this.state.permission_types_list}
                                    type="single"
                                    maxMenu={100}
                                />
                            </Grid>

                            <Grid item xs={11} sm={7} md={6} lg={5}>
                                <FormButton
                                    handleUpdate={this.putPermission}
                                    handleCreate={this.postPermission}
                                    handleCancel={this.resetForm}
                                    type={this.state.button_type}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <EasyMuiDataTable
                                    state={this.state.permissions_table}
                                    selectable={this.state.permissions_table.data.length > 0 ? true : false}
                                    update={true}
                                    delete={true}
                                    name="permissions_table"
                                    handle={value => this.handleOverride(value, "permissions_table")}
                                    handleUpdate={this.handleUpdate}
                                    handleDelete={this.handleDelete}
                                // multiIndexAction={true}
                                />
                            </Grid>

                        </Grid>
                        <br />
                    </Widget>
                    <br />
                </div>
            </>
        );
    }
}

const createPermission = withStyles(style)(createPermission_)
const connectedComponent = connect()(createPermission)
export { connectedComponent as createPermission };