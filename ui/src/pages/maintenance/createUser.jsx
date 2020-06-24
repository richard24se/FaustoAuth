import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from '@material-ui/icons/Cancel';
import LockIcon from '@material-ui/icons/Lock';

//STYLE
import { withStyles } from "@material-ui/styles";
import style from "./style";

//EASY_MATERIAL
import Widget from "../../components/Widget/Widget";
import {
    EasyTextField,
    EasyButton,
    EasyAutoSelect,
    EasyMuiDataTable
} from "../../components/EasyMaterial/EasyMaterialComponents";

//FOTCH
import {
    Fotch,
    capitalize
} from "../../fausto";

//COMPONENTS
import PageTitle from "../../components/PageTitle/PageTitle";

//Redux
import { connect } from 'react-redux';
import { fotchActions } from '../../redux/actions'

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
                                startIcon={<CancelIcon />}
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

class createUser_ extends Component {
    constructor(props) {
        super(props);

        const user_columms = [
            { label: "Names", name: "names", options: { filter: true, }, },
            { label: "Surnames", name: "surnames", options: { filter: true, }, },
            { label: "Username", name: "username", options: { filter: true, }, },
            { label: "Role", name: "role_name", options: { filter: true, }, },
            { label: "Created Date", name: "created_date", options: { filter: true, }, },
            { label: "Modificated Date", name: "modificated_date", options: { filter: true, }, },
        ];

        this.state = {
            titulo: "USER CREATION",
            button_type: "create",
            roles_list: [],
            user_table: {
                columns: user_columms,
                data: []
            },

            id_user: "",
            user_names: "",
            user_surnames: "",
            user_username: "",
            user_role: "",
            user_password: "",
            user_password_backup: "",
            validate_user_password: "",
            warning_user_password: "",
            new_user_password: "",
            showPassword: false,
            updatePassword: false
        };

        this.handleOverride = this.handleOverride.bind(this)
        this.resetForm = this.resetForm.bind(this)
        this.comparePasword = this.comparePasword.bind(this)

        this.getRoles = this.getRoles.bind(this)
        this.getUsers = this.getUsers.bind(this)
        this.postUser = this.postUser.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.putUser = this.putUser.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.deleteRole = this.deleteRole.bind(this)

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
        // this.comparePasword(name,value)
    }

    comparePasword = (name, value) => {
        console.log("validate COMPARE")
        console.log(name , value)
        if (this.state.updatePassword) {
            switch (name) {
                case 'validate_user_password':
                    if (value !== this.state.new_user_password) {
                        this.setState({ warning_user_password: "New Passwords do not match" })
                    } else this.setState({ warning_user_password: "Passwords match" })
                    break;

                case 'new_user_password':
                    if (value !== this.state.validate_user_password) {
                        this.setState({ warning_user_password: "New Passwords do not match" })
                    } else this.setState({ warning_user_password: "Passwords match" })
                    break;
                default: return null
            }
        } else {
            switch (name) {
                case 'validate_user_password':
                    if (value !== this.state.user_password) {
                        this.setState({ warning_user_password: "Passwords do not match" })
                    } else this.setState({ warning_user_password: "Passwords match" })
                    break;

                case 'user_password':
                    if (value !== this.state.validate_user_password) {
                        this.setState({ warning_user_password: "Passwords do not match" })
                    } else this.setState({ warning_user_password: "Passwords match" })
                    break;
                default: return null
            }
        }
    }

    resetForm = (name, table) => {
        console.log('CANCELAR FORMULARIO ' + name)
        this.setState({
            button_type: "create",
            id_user: "",
            user_names: "",
            user_surnames: "",
            user_username: "",
            user_role: "",
            user_password: "",
            user_password_backup: "",
            validate_user_password: "",
            new_user_password: "",
            showPassword: false,
            updatePassword: false
        })
    }

    getRoles = () => {
        fotchAuth.get("/role", obj => {
            console.log(obj);
            var format_roles = []
            if (!obj.error) {
                var roles = obj.response.data;
                format_roles = roles.map(item => ({
                    ...item,
                    id: item.id,
                    value: capitalize(item.name)
                }));
                this.getUsers()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState({
                roles_list: format_roles
            });
        });
    };

    getUsers = () => {
        // Change id_object_ty for the name
        var obtainRoleName = (id_role) => { for (var role of this.state.roles_list) if (id_role === role.id) return capitalize(role.name) }
        this.props.dispatch(fotchActions.processing("Getting users..."))
        fotchAuth.get("/user", obj => {
            console.log(obj);
            var format_users = []
            if (!obj.error) {
                var users = obj.response.data;
                format_users = users.map(item => ({
                    ...item,
                    names: capitalize(item.names),
                    surnames: capitalize(item.surnames),
                    role_name: obtainRoleName(item.id_role)
                }));
                this.props.dispatch(fotchActions.success(obj.response.msg))
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
            this.setState(prevState => ({
                user_table: {
                    ...prevState.user_table,
                    data: format_users,
                },
            }));
        });
    };

    postUser = () => {
        if (this.state.user_names === "") {
            this.props.dispatch(fotchActions.warning("Fill in the name field"))
        } else if (this.state.user_surnames === "") {
            this.props.dispatch(fotchActions.warning("Fill in the surname field"))
        } else if (this.state.user_role === "") {
            this.props.dispatch(fotchActions.warning("Select an role"))
        } else if (this.state.user_username === "") {
            this.props.dispatch(fotchActions.warning("Fill in the username field"))
        } else if (this.state.user_password === "") {
            this.props.dispatch(fotchActions.warning("Fill in the password field"))
        } else if (this.state.user_password !== this.state.validate_user_password) {
            this.props.dispatch(fotchActions.warning("Passwords do not match"))
        }
        else {
            this.props.dispatch(fotchActions.processing("Saving the user..."))
            fotchAuth.post("/user", obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getUsers()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: {
                        username: this.state.user_username,
                        names: capitalize(this.state.user_names),
                        surnames: capitalize(this.state.user_surnames),
                        password: this.state.user_password,
                        id_role: this.state.user_role.value
                    },
                },
            );
        }
    }

    handleUpdate = (dataIndex) => {
        // Change id_role for the name
        var obtainRoleName = (id_role) => { for (var role of this.state.roles_list) if (id_role === role.id) return { value: role.id, label: capitalize(role.name) } }

        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const user = this.state.user_table.data[dataIndex];
            this.setState({
                button_type: "update",
                id_user: user.id,
                user_names: user.names,
                user_surnames: user.surnames,
                user_username: user.username,
                user_role: obtainRoleName(user.id_role),
                user_password_backup: user.password,
                user_password : "",
                new_user_password:"",
                validate_user_password:""
            })
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    putUser = () => {
        if (this.state.user_names === "") {
            this.props.dispatch(fotchActions.warning("Fill in the name field"))
        } else if (this.state.user_surnames === "") {
            this.props.dispatch(fotchActions.warning("Fill in the surname field"))
        } else if (this.state.user_role === "") {
            this.props.dispatch(fotchActions.warning("Select an role"))
        } else if (this.state.user_username === "") {
            this.props.dispatch(fotchActions.warning("Fill in the username field"))
        } else if (this.state.updatePassword && this.state.user_password !== this.state.user_password_backup) {
            this.props.dispatch(fotchActions.warning("Incorrect password"))
        } else if (this.state.updatePassword && this.state.new_user_password === "") {
            this.props.dispatch(fotchActions.warning("Fill in the new password field"))
        } else if (this.state.updatePassword && this.state.new_user_password !== this.state.validate_user_password) {
            this.props.dispatch(fotchActions.warning("New Password do not match"))
        }
        else {
            this.props.dispatch(fotchActions.processing("Saving the user..."))
            var put_data = {
                username: this.state.user_username,
                names: capitalize(this.state.user_names),
                surnames: capitalize(this.state.user_surnames),
                id_role: this.state.user_role.value
            }
            if (this.state.updatePassword) {
                put_data['password'] = this.state.new_user_password
            }
            fotchAuth.put("/user/" + this.state.id_user, obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getUsers()
                    this.props.dispatch(fotchActions.success(obj.response.msg))
                } else {
                    this.props.dispatch(fotchActions.error(obj.response.msg))
                }
            },
                {
                    data: put_data
                },
            );
        }
    }

    handleDelete = dataIndex => {
        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const user = this.state.user_table.data[dataIndex];
            this.deleteRole(user.id)
        }
        else {
            this.props.dispatch(fotchActions.error("Just can to select one record"))
        }
    }

    deleteRole = id_user => {
        fotchAuth.del("/user/" + id_user, obj => {
            console.log(obj);
            this.props.dispatch(fotchActions.processing("Deleting user..."))
            if (!obj.error) {
                this.props.dispatch(fotchActions.success(obj.response.msg))
                this.getRoles()
            } else {
                this.props.dispatch(fotchActions.error(obj.response.msg))
            }
        });
    }

    componentDidMount() {
        this.getRoles()
    }

    render() {
        return (
            <>
                <PageTitle title={this.state.titulo} />
                <div>
                    <Widget disableWidgetMenu >
                        <br />
                        <Grid container spacing={3}>

                            <Grid item xs={12} sm={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.user_names}
                                    handle={value => this.handleOverride(value, "user_names")}
                                    label="Names"
                                    helperText="Enter user names (*)"
                                    name={"user_names"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.user_surnames}
                                    handle={value => this.handleOverride(value, "user_surnames")}
                                    label="Surnames"
                                    helperText="Enter user surnames (*)"
                                    name={"user_surnames"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4} >
                                <EasyAutoSelect
                                    name="user_role"
                                    state={this.state.user_role}
                                    handle={value => this.handleOverride(value, "user_role")}
                                    label="Select role"
                                    dataset={this.state.roles_list}
                                    type="single"
                                    maxMenu={150}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.user_username}
                                    handle={value => this.handleOverride(value, "user_username")}
                                    label="Username"
                                    helperText="Enter Username (*)"
                                    name={"user_username"}
                                    type="textfield"
                                />
                            </Grid>

                            {
                                this.state.button_type !== "update" ?
                                    <>
                                        <Grid item xs={12} sm={4}>
                                            <EasyTextField
                                                id="standard-basic"
                                                state={this.state.user_password}
                                                handle={value => this.handleOverride(value, "user_password")}
                                                label="Password"
                                                helperText="Enter Username (*)"
                                                name={"user_password"}
                                                type="password"
                                                showPassword={this.state.showPassword}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <EasyTextField
                                                id="standard-basic"
                                                state={this.state.validate_user_password}
                                                handle={value => this.handleOverride(value, "validate_user_password")}
                                                label={"Validate password"}
                                                helperText={this.state.validate_user_password === "" ? "Enter user password again(*)" : this.state.warning_user_password}
                                                name={"validate_user_password"}
                                                hiddenPassword={true}
                                                type="password"
                                            />
                                        </Grid>
                                    </> :
                                    <>
                                        <Grid container xs={12} sm={8} justify="center" >
                                            <Grid item xs={8} sm={7} md={6} lg={4}>
                                                <EasyButton
                                                    label={this.state.updatePassword ? "Cancel" : "Update password"}
                                                    type="contained"
                                                    startIcon={this.state.updatePassword ? <CancelIcon /> : <LockIcon />}
                                                    onClick={() => this.setState({ updatePassword: !this.state.updatePassword })}
                                                    fullWidth={true}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                            }

                            {
                                this.state.updatePassword ?
                                    <>
                                        <Grid item xs={12} sm={4}>
                                            <EasyTextField
                                                id="standard-basic"
                                                state={this.state.user_password}
                                                handle={value => this.handleOverride(value, "user_password")}
                                                label="Password"
                                                helperText="Enter Username (*)"
                                                name={"user_password"}
                                                type="password"
                                                hiddenPassword={true}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <EasyTextField
                                                id="standard-basic"
                                                state={this.state.new_user_password}
                                                handle={value => this.handleOverride(value, "new_user_password")}
                                                label="New password"
                                                helperText="Enter new password (*)"
                                                name={"new_user_password"}
                                                type="password"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <EasyTextField
                                                id="standard-basic"
                                                state={this.state.validate_user_password}
                                                handle={value => this.handleOverride(value, "validate_user_password")}
                                                label={"Validate password"}
                                                helperText={this.state.validate_user_password === "" ? "Enter user password again(*)" : this.state.warning_user_password}
                                                name={"validate_user_password"}
                                                hiddenPassword={true}
                                                type="password"
                                            />
                                        </Grid>
                                    </> : null
                            }

                            <Grid item xs={11} sm={7} md={6} lg={5}>
                                <FormButton
                                    handleUpdate={this.putUser}
                                    handleCreate={this.postUser}
                                    handleCancel={this.resetForm}
                                    type={this.state.button_type}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <EasyMuiDataTable
                                    state={this.state.user_table}
                                    selectable={this.state.user_table.data.length > 0 ? true : false}
                                    update={true}
                                    delete={true}
                                    name="user_table"
                                    handle={value => this.handleOverride(value, "user_table")}
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

const createUser = withStyles(style)(createUser_);
const connectedComponent = connect()(createUser)
export { connectedComponent as createUser };
