import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';

import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';

//STYLE
import { withStyles } from '@material-ui/styles';
import style from './style'

import Widget from "../../components/Widget";
import {
    EasyButton, EasyAutoSelect, EasyTextField, EasyMuiDataTable
} from "../../components/EasyMaterial/EasyMaterialComponents"

//FOTCH
import { Fotch, capitalize } from '../../fausto'

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

const permissionsList = (permissions) => {
    var permissions_list = []
    for (var i of permissions) {
        var component = (
            <Typography Typography variant="subtitle1" align="justify"> -{i.name}</Typography>
        )
        permissions_list.push(component)
    }
    return permissions_list
}

const objectsList = (objects) => {
    var objects_list = []
    for (var i of objects) {
        var component = (
            <>
            <Typography Typography variant="h6">{i.display_name} :</Typography>
            {i.permissions.length > 0 ? permissionsList(i.permissions) : "Permissions not found"}
            </>
        )
        objects_list.push(component)
    }
    return objects_list
}

const detailComponent = ({ data }) => {
    console.log(data)
    return (
        <Paper elevation={0}>
            {data.length>0 ? objectsList(data) : "Data not found"}
        </Paper>
    );
};

class createRole_ extends Component {

    constructor(props) {
        super(props);

        const roles_columms = [
            { label: "Role", name: "name", options: { filter: true, }, },
            { label: "Display name", name: "display_name", options: { filter: true, }, },
            { label: "Created date", name: "created_date", options: { filter: true, }, },
            { label: "Modificated date", name: "mmodificated_date", options: { filter: true, }, },
        ];

        this.state = {

            titulo: "ROLE CREATION",
            id_role:"",
            role_name: "",
            role_display_name: "",
            button_type: "create",
            permission_types_list: [],
            permission_type:"",
            permissions_list: [],
            permissions_filtered_list:[],
            object:"",
            objects_list:[],
            permissions:"",
            roles_table: {
                columns: roles_columms,
                data: []
            },
        };
        
        this.handleOverride = this.handleOverride.bind(this)
        this.resetForm = this.resetForm.bind(this)

        this.getPermissionTypes = this.getPermissionTypes.bind(this)
        this.getPermissions = this.getPermissions.bind(this)
        this.getRoles = this.getRoles.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.getRolePermissions = this.getRolePermissions.bind(this)
        this.putRole = this.putRole.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.deleteRole = this.deleteRole.bind(this)
        this.getRoleDetail = this.getRoleDetail.bind(this)
        
        

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

        if (name === "permission_type"){
            if(value !== ""){
                const filtered_data = this.state.permissions_list.filter(permission => permission.id_permission_type === value.value)
                this.setState({ permissions_filtered_list: filtered_data})
            }else this.setState({ permissions_filtered_list: this.state.permissions_list})
        }

        if (name === "object"){
            if(value !== ""){
                const filtered_data = this.state.permissions_list.filter(permission => permission.id_object === value.value)
                this.setState({ permissions_filtered_list: filtered_data})
            }else this.setState({ permissions_filtered_list: this.state.permissions_list})
        }
    }

    resetForm = () => {
        this.setState({
            button_type: "create",
            permission_type:"",
            object:"",
            role_name: "",
            role_display_name: "",
            permissions: [],
            id_role:""
        })
    }

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
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState({
                permission_types_list: format_permission_types
            });
        });
    }

    getObjects = () => {
        fotchAuth.get("/object", obj => {
            console.log(obj);
            var format_objects = []
            if (!obj.error) {
                var objects = obj.response.data;
                format_objects = objects.map(item => ({
                    ...item,
                    id: item.id,
                    value: capitalize(item.display_name)
                }));
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState({
                objects_list: format_objects
            });
        });
    };

    getPermissions = () =>{
        fotchAuth.get("/permission", obj => {
            console.log(obj);
            var format_data = []
            if (!obj.error) {
                const data = obj.response.data;
                format_data = data.map(item => ({
                    ...item,
                    id: item.id,
                    value: capitalize(item.name)
                }))
            }
            else {
                this.props.dispatch(fotchActions.error("No permissions found"))
            }
            this.setState({ permissions_list: format_data, permissions_filtered_list: format_data})
        })
    }

    getRoles = () => {
        this.props.dispatch(fotchActions.processing("Getting objects..."))
        fotchAuth.get("/role", obj => {
            console.log(obj);
            var format_roles = []
            if (!obj.error) {
                var roles = obj.response.data;
                format_roles = roles.map(item => ({
                    ...item,
                    id: item.id,
                    name: capitalize(item.name),
                    display_name: capitalize(item.display_name),
                    created_date: item.created_date,
                }));
                this.props.dispatch(fotchActions.success(obj.response.msg))
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState(prevState => ({
                roles_table: {
                    ...prevState.roles_table,
                    data: format_roles,
                },
            }));
        });
    };

    postRole = () => {
        if (this.state.role_name === "" || this.state.role_display_name === "") {
            this.props.dispatch(fotchActions.warning("Fill the empty fields"))
        } else if (this.state.permissions.length < 1) {
            this.props.dispatch(fotchActions.warning("Select permissions"))
        }
        else {
            fotchAuth.post("/role", obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getRoles()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: {
                        name: this.state.role_name,
                        display_name: this.state.role_display_name,
                        permissions: this.state.permissions.map(item => item.value)
                    },
                },
            );
        }
    }

    handleUpdate = (dataIndex) => {
        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const role = this.state.roles_table.data[dataIndex];
            this.getRolePermissions(role.id)
            this.setState({
                role_name: role.name,
                role_display_name: role.display_name,
                button_type: "update",
                id_role: role.id
            })
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    getRolePermissions = (rol) => {
        fotchAuth.get("/permission?role=" + rol, obj => {
            console.log(obj);
            var format_data = []
            if (!obj.error) {
                const data = obj.response.data;
                format_data = data.map(item => ({
                    ...item,
                    value: item.id,
                    label: capitalize(item.name)
                }))
            }
            else {
                this.props.dispatch(fotchActions.warning("No objects found!"))
            }
            this.setState({ permissions: format_data })
        })
    }

    putRole = () => {
        if (this.state.role_name === "" || this.state.role_display_name === "") {
            this.props.dispatch(fotchActions.warning("Fill the empty fields"))
        } else if (this.state.permissions.length < 1) {
            this.props.dispatch(fotchActions.warning("Select permissions"))
        }
        else {
            fotchAuth.put("/role/"+this.state.id_role, obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getRoles()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: {
                        name: this.state.role_name,
                        display_name: this.state.role_display_name,
                        permissions: this.state.permissions.map(item => item.value)
                    },
                },
            );
        }
    }

    handleDelete = dataIndex => {
        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const role = this.state.roles_table.data[dataIndex];
            console.log(role)
            if (role) { this.deleteRole(role.id) }
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    deleteRole = roleId => {
        console.log(roleId)
        fotchAuth.del("/role/" + roleId, obj => {
            console.log(obj);
            this.props.dispatch(fotchActions.processing("Deleting Role..."))
            if (!obj.error) {
                this.props.dispatch(fotchActions.success(obj.response.msg))
                this.getRoles()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
        });
    }

    getRoleDetail = (dataIndex, setData) => {
        const rol = this.state.roles_table.data[dataIndex];
        fotchAuth.get("/role_permission?role=" + rol.id, obj => {
            console.log(obj);
            var data =[]
            if (!obj.error) {
                data = obj.response.data;
            }
            setTimeout(() => {
                setData(data);
            }, 800);
        });
    };

    

    componentDidMount() {
        this.getPermissionTypes()
        this.getPermissions()
        this.getRoles()
        this.getObjects()
    }

    render() {
        return (
            <>
                <PageTitle title={this.state.titulo} />
                <div>
                    <Widget disableWidgetMenu >
                        <Grid container spacing={3}>

                            <Grid item xs={12} sm={6} lg={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.role_name}
                                    handle={value => this.handleOverride(value, "role_name")}
                                    label="name"
                                    helperText="Role name(*)"
                                    name={"role_name"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} lg={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.role_display_name}
                                    handle={value => this.handleOverride(value, "role_display_name")}
                                    label="display name"
                                    helperText="Role display name (*)"
                                    name={"role_display_name"}
                                    type="textfield"
                                />
                            </Grid>

                            {/* <Grid item xs={12} sm={6} lg={5} >
                                <EasyAutoSelect
                                    name="permission_type"
                                    state={this.state.permission_type}
                                    handle={value => this.handleOverride(value, "permission_type")}
                                    label="Permission type"
                                    dataset={this.state.permission_types_list}
                                    type="single"
                                    maxMenu={100}
                                />
                            </Grid> */}

                            <Grid item xs={12} sm={6} lg={4} >
                                <EasyAutoSelect
                                    name="object"
                                    state={this.state.object}
                                    handle={value => this.handleOverride(value, "object")}
                                    label="Object"
                                    dataset={this.state.objects_list}
                                    type="single"
                                    maxMenu={100}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} lg={6} >
                                <EasyAutoSelect
                                    name="permissions"
                                    state={this.state.permissions}
                                    handle={value => this.handleOverride(value, "permissions")}
                                    label="Permission"
                                    dataset={this.state.permissions_filtered_list}
                                    type="multi"
                                    maxMenu={200}
                                />
                            </Grid>

                            <Grid item xs={11} sm={7} md={6} lg={5}>
                                <FormButton
                                    handleUpdate={this.putRole}
                                    handleCreate={this.postRole}
                                    handleCancel={this.resetForm}
                                    type={this.state.button_type}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <EasyMuiDataTable
                                    state={this.state.roles_table}
                                    selectable={this.state.roles_table.data.length > 0 ? true : false}
                                    update={true}
                                    delete={true}
                                    expand={true}
                                    name="roles_table"
                                    handle={value => this.handleOverride(value, "roles_table")}
                                    handleUpdate={this.handleUpdate}
                                    handleDelete={this.handleDelete}
                                    expandComponent={detailComponent}
                                    expandCallback={this.getRoleDetail}
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

const createRole = withStyles(style)(createRole_)
const connectedComponent = connect()(createRole)
export { connectedComponent as createRole };