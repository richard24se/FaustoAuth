import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';

//STYLE
import { withStyles } from '@material-ui/styles';
import style from './style'

import Widget from "components/Widget";
import {
    EasyButton, EasyAutoSelect, EasyTextField, EasyMuiDataTable
} from "components/EasyMaterial/EasyMaterialComponents"

//FOTCH
import { Fotch, capitalize, authHeader } from 'fausto'

//Redux
import { connect } from 'react-redux';
import { fotchActions } from 'redux/actions'
import { mapDispatchToPropsNoti } from "redux/dispatchs"

// import moment from "moment";

//COMPONENTS
import PageTitle from "components/PageTitle/PageTitle";

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


class createObject_ extends Component {

    constructor(props) {
        super(props);

        const object_columms = [
            { label: "Object", name: "name", options: { filter: true, }, },
            { label: "Display Name", name: "display_name", options: { filter: true, }, },
            { label: "Object Type", name: "object_type", options: { filter: true, }, },
            { label: "Creation date", name: "created_date", options: { filter: true, }, },
            { label: "Modificated date", name: "modificated_date", options: { filter: true, }, },
        ];

        this.state = {
            title: "OBJECT CREATION",
            id_object: "",
            object_type: "",
            object_type_list: [],
            object_name: "",
            object_display_name: "",
            button_type: "create",
            object_table: {
                columns: object_columms,
                data: []
            },
        };

        this.handleOverride = this.handleOverride.bind(this)
        this.resetForm = this.resetForm.bind(this)

        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleDelete = this.handleDelete.bind(this)

        this.getObjectType = this.getObjectType.bind(this)
        this.getObject = this.getObject.bind(this)
        this.postObject = this.postObject.bind(this)
        this.putObject = this.putObject.bind(this)

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
            id_object: "",
            button_type: "create",
            object_name: "",
            object_display_name: "",
            object_type: ""
        })
    }


    getObjectType = () => {
        fotchAuth.get("/object_types", obj => {
            console.log(obj);
            var format_object_types = []
            if (!obj.error) {
                var object_types = obj.response.data;
                format_object_types = object_types.map(item => ({
                    ...item,
                    id: item.id,
                    value: capitalize(item.name)
                }));
                this.getObject()
            } else {
                this.props.notierror(obj.response.msg)
            }
            this.setState({
                object_type_list: format_object_types
            });
        });
    };

    getObject = () => {
        // Change id_object_ty for the name
        var obtainObjectTypeName = (id_type) => { for (var type of this.state.object_type_list) if (id_type === type.id) return type.name }
        // this.props.dispatch(fotchActions.processing("Getting objects..."))
        const notiloading = this.props.notiloading("Getting objects...")
        fotchAuth.get("/object", obj => {
            console.log(obj);
            var format_objects = []
            if (!obj.error) {
                var objects = obj.response.data;
                format_objects = objects.map(item => ({
                    ...item,
                    display_name: capitalize(item.display_name),
                    object_type: obtainObjectTypeName(item.id_object_type),
                }));
                // this.props.notisuccess(obj.response.msg)
                this.props.notisuccess(obj.response.msg)
                this.props.closenoti(notiloading)
            } else {
                this.props.notierror(obj.response.msg)
            }
            this.setState(prevState => ({
                object_table: {
                    ...prevState.object_table,
                    data: format_objects,
                },
            }));
        });
    };

    postObject = () => {
        if (this.state.object_name === "" || this.state.object_display_name === "") {
            this.props.notiwarn("Complete the fields empty")
        } else if (this.state.object_type === "") {
            this.props.notiwarn("Select an object type")
        }
        else {
            const notiloading = this.props.notiloading("Saving the object...")
            fotchAuth.post("/object", obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getObject()
                    this.props.notisuccess(obj.response.msg)
                    this.props.closenoti(notiloading)
                } else {
                    this.props.notierror(obj.response.msg)
                }
            },
                {
                    data: {
                        name: (this.state.object_name),
                        display_name: capitalize(this.state.object_display_name),
                        id_object_type: this.state.object_type.value
                    },
                },
            );
        }
    }

    handleUpdate = (dataIndex) => {
        // Change id_object_ty for the name
        var obtainObjectType = (id_type) => { for (var type of this.state.object_type_list) if (id_type === type.id) return { value: type.id, label: type.name } }

        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const object = this.state.object_table.data[dataIndex];
            this.setState({
                button_type: "update",
                object_name: object.name,
                object_display_name: object.display_name,
                id_object: object.id,
                object_type: obtainObjectType(object.id_object_type)
            })
        }
        else {
            this.props.notierror("Just can to select one record")
        }
    }

    putObject = () => {
        if (this.state.object_name === "" || this.state.object_display_name === "") {
            this.props.notiwarn("Complete the fields empty")
        } else if (this.state.object_type === "") {
            this.props.notiwarn("Select an object type")
        }
        else {
            const notiloading = this.props.notiloading("Updating the object...")
            fotchAuth.put("/object/" + this.state.id_object, obj => {
                this.setState({ button_disabled: false })
                if (!obj.error) {
                    this.resetForm()
                    this.getObject()
                    this.props.notisuccess(obj.response.msg)
                    this.props.closenoti(notiloading)
                } else {
                    this.props.notierror(obj.response.msg)
                }
            },
                {
                    data: {
                        name: (this.state.object_name),
                        display_name: capitalize(this.state.object_display_name),
                        id_object_type: this.state.object_type.value
                    },
                },
            );
        }
    }

    handleDelete = dataIndex => {
        console.log(dataIndex)
        if (dataIndex || dataIndex === 0) {
            const object = this.state.object_table.data[dataIndex];
            this.deleteObject(object.id)
        }
        else {
            this.props.notierror("Just can to select one record")
        }
    }

    deleteObject = id_object => {
        fotchAuth.del("/object/" + id_object, obj => {
            console.log(obj);
            const notiloading = this.props.notiloading("Deleting the object...")
            if (!obj.error) {
                this.props.notisuccess(obj.response.msg)
                this.props.closenoti(notiloading)
                this.getObject()
            } else {
                this.props.notierror(obj.response.msg)
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
                                    state={this.state.object_name}
                                    handle={value => this.handleOverride(value, "object_name")}
                                    label="object"
                                    helperText="Enter object name (*)"
                                    name={"object_name"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <EasyTextField
                                    id="standard-basic"
                                    state={this.state.object_display_name}
                                    handle={value => this.handleOverride(value, "object_display_name")}
                                    label="display name"
                                    helperText="Enter object display name (*)"
                                    name={"object_display_name"}
                                    type="textfield"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4} >
                                <EasyAutoSelect
                                    name="object_type"
                                    state={this.state.object_type}
                                    handle={value => this.handleOverride(value, "object_type")}
                                    label="Select object type"
                                    dataset={this.state.object_type_list}
                                    type="single"
                                    maxMenu={100}
                                />
                            </Grid>

                            <Grid item xs={11} sm={7} md={6} lg={5}>
                                <FormButton
                                    handleUpdate={this.putObject}
                                    handleCreate={this.postObject}
                                    handleCancel={this.resetForm}
                                    type={this.state.button_type}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <EasyMuiDataTable
                                    state={this.state.object_table}
                                    selectable={this.state.object_table.data.length > 0 ? true : false}
                                    update={true}
                                    delete={true}
                                    name="object_table"
                                    handle={value => this.handleOverride(value, "object_table")}
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
const mapDispatchToProps = (dispatch) => ({ ...mapDispatchToPropsNoti(dispatch), dispatch })
const createObject = withStyles(style)(createObject_)
const connectedComponent = connect(null, mapDispatchToProps)(createObject)
export { connectedComponent as createObject };