import React, { Component, PureComponent, memo } from 'react';



import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import clsx from 'clsx';
import Input from '@material-ui/core/Input';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

//PICKERS => DATE AND TIME
import 'date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
//import DateFnsUtils from '@date-io/date-fns';
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment/locale/es";

import Button from '@material-ui/core/Button';

import { SingleSelect as ReactSingleSelect, MultiSelect as ReactMultiSelect } from './ReactAutoSelect'

import MaterialTable from '../../components/EasyMaterial/MaterialTable';

import MUIDataTable from '../../components/EasyMaterial/MuiDataTable';

import SwipTabs from '../../components/EasyMaterial/SwipTabs'

import Snackbar from '../../components/EasyMaterial/Snackbar'

// import { Tree } from '../../components/EasyMaterial/EasyTree'

import Slider from '@material-ui/core/Slider';

//DIALOG
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
//FORM DIALOG
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

//STYLE
import classnames from "classnames";
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import style from './style'
import { ThemeProvider } from '@material-ui/styles';

import { colors } from '../../themes/colors'

import Slide from '@material-ui/core/Slide';

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1).toLocaleLowerCase()
}

//TRANSITIONS

/*const TransitionUp = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});*/
const TransitionDown = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

class EasySelect_ extends Component {
    /*constructor(props) {
        super(props);
    }*/

    render() {
        const { classes } = this.props;
        return (
            <FormControl className={classes.select}>
                <InputLabel htmlFor="age-helper">{capitalize(this.props.name)}</InputLabel>
                <Select
                    value={this.props.state}
                    onChange={this.props.handle}
                    inputProps={{ name: this.props.name }}
                >
                    <MenuItem value="">
                        <em>Nada</em>
                    </MenuItem>
                    {this.props.dataset.map((dt, i) => (
                        <MenuItem key={i} value={dt.value}>
                            {dt.value}
                        </MenuItem>
                    ))}
                </Select>
                {this.props.state === "" ? (<FormHelperText>Eliga un valor {this.props.name}</FormHelperText>) : (null)}
            </FormControl>
        );
    }
}

class EasyTextField_ extends Component {
    constructor(props) {
        super(props);
        this.listRef = React.createRef();
        this.state = {
            showPassword: false
        }
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this)

    }

    shouldComponentUpdate(nextProps, nextState) {
        // if (this.props.state !== nextProps.state) {
        //     console.log("EasyTextfield changing...")
        //     console.log("#----------->Actual Props<------------#")
        //     console.log(this.props)
        //     console.log("#----------->Next Props<------------#")
        //     console.log(nextProps)
        // }

        return this.props !== nextProps || this.state !== nextState; //props que cambian, sólo con esas se renderiza

    }

    handleClickShowPassword = () => {
        console.log("Visibility change")
        console.log(this.state.showPassword)
        this.setState({ showPassword: !this.state.showPassword });
    };



    render() {

        const newProps = { ...this.props };
        delete newProps.color;
        delete newProps.type;
        delete newProps.classes
        delete newProps.handle
        delete newProps.press
        delete newProps.pressKey
        delete newProps.startAdornment
        delete newProps.endAdornment


        const { classes } = this.props;

        switch (this.props.type) {
            case 'readonly':
                return (
                    <TextField
                        id="standard-read-only-input"
                        label={this.props.label ? this.props.label : capitalize(this.props.name)}
                        className={classes.textField}
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                        value={this.props.state}
                        //helperText={this.props.state == "" ? "Eliga un valor"+this.props.name : ""}
                        fullWidth
                        {...newProps}
                    />

                );
            case 'textfield':
                return (
                    <TextField
                        id="standard-text-input"
                        label={this.props.label ? this.props.label : capitalize(this.props.name)}
                        className={classes.textField}
                        margin="normal"
                        InputProps={{
                            name: this.props.name,
                            startAdornment: this.props.startAdornment ? (<InputAdornment position="start"> {this.props.startAdornment} </InputAdornment>) : null,
                            endAdornment: this.props.endAdornment ? (<InputAdornment position="end"> {this.props.endAdornment} </InputAdornment>) : null,
                        }}
                        value={this.props.state}
                        //onChange={this.props.handle}
                        onChange={this.props.name ? (e) => this.props.handle(e.target.value, this.props.name) : this.props.handle}
                        helperText={!this.props.helptext ? "Eliga un valor" + (this.props.name) : this.props.helptext}
                        ///{...this.props}
                        fullWidth
                        onKeyPress={(ev) => {
                            if (this.props.press) {
                                const pressKey = this.props.presskey ? this.props.presskey : 'Enter';
                                console.log("Tecla presionada: " + ev.keyCode)
                                if (ev.key === pressKey) {
                                    this.props.press()
                                }
                            }//else
                            //console.log("No se envió la propiedad press")

                        }}
                        {...newProps}

                    />

                );
            case 'password':
                return (
                    <FormControl className={classes.formInput}>
                        <InputLabel htmlFor="standard-adornment-password">{this.props.label}</InputLabel>
                        <Input className={classes.textField}
                            id="standard-adornment-password"
                            type={this.state.showPassword ? 'text' : 'password'}
                            margin="normal"
                            value={this.props.state}
                            onChange={this.props.name ? (e) => this.props.handle(e.target.value, this.props.name) : this.props.handle}
                            fullWidth={true}
                            endAdornment={
                                !this.props.hiddenPassword ?
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={this.handleClickShowPassword}
                                        >
                                            {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment> : null
                            }
                        />
                        <FormHelperText id="component-helper-text">{this.props.helperText}</FormHelperText>
                    </FormControl>
                );
            case 'textarea':
                return (
                    <TextField
                        id="standard-multiline-flexible"
                        label={this.props.label ? this.props.label : capitalize(this.props.name)}
                        multiline
                        rows={this.props.rows ? this.props.rows : "4"}
                        // Se modifica this.props.rows: "4"
                        //defaultValue=""
                        //{this.props.handle}
                        onChange={this.props.name ? (e) => this.props.handle(e.target.value, this.props.name) : this.props.handle}
                        //onBlur={this.props.name ? (e) => this.props.handle(e.target.value, this.props.name) : this.props.handle}
                        inputProps={{
                            name: this.props.name,
                        }}
                        value={this.props.state}
                        className={classes.textArea}
                        margin="dense"
                        variant="outlined"
                        fullWidth
                        {...newProps}
                    />

                );
            default:
                return "TextField type doesn't exist";
        }
    }
}
EasyTextField_.defaultProps = {
    fullWidth: true
};
class EasyPicker_ extends Component {
    constructor(props) {
        super(props);
        this.locale = this.props.locale ? this.props.locale : "es"
    }


    componentDidMount() {
        // console.log(this.locale)
        // console.log(this.props)
        moment.locale(this.locale);

    }
    shouldComponentUpdate(nextProps, nextState) {
        // console.log("EasyPicker ###########Debugging changing...")
        // Object.entries(this.props).forEach(([key, value]) => {
        //     if (value !== nextProps[key]) {
        //         console.log("#!ALERTA!")
        //         console.log(value)
        //         console.log(nextProps[key])
        //     }
        // })
        // if (this.props.state !== nextProps.state) {
        //     console.log("EasyPicker changing...")
        //     console.log("#----------->Actual Props<------------#")
        //     console.log(this.props)
        //     console.log("#----------->Next Props<------------#")
        //     console.log(nextProps)
        // }
        return this.props.state !== nextProps.state; //props que cambian, sólo con esas se renderiza
    }

    render() {
        //const newProps = {...this.props};
        const { type, classes, formatDate, handle, ...newProps } = this.props;
        // delete newProps.type;
        // delete newProps.classes;
        // delete newProps.formatDate;
        //const {classes} = this.props;
        switch (this.props.type) {
            case 'time':
                return (
                    <MuiPickersUtilsProvider utils={(MomentUtils)} libInstance={moment} locale={this.locale}>
                        <KeyboardTimePicker
                            margin="normal"
                            id="time-picker"
                            label={this.props.label ? this.props.label : capitalize(this.props.name)}
                            value={this.props.state}
                            onChange={(date) => this.props.handle(date, this.props.name)}
                            KeyboardButtonProps={{
                                'aria-label': 'change time',
                            }}
                            cancelLabel="Cancelar"
                            className={classes.picker}
                            {...newProps}
                        />
                    </MuiPickersUtilsProvider>
                );
            case 'date':
                return (
                    <MuiPickersUtilsProvider utils={(MomentUtils)} libInstance={moment} locale={this.locale}>
                        <KeyboardDatePicker
                            margin="normal"
                            id="date-picker"
                            label={this.props.label ? this.props.label : capitalize(this.props.name)}
                            value={this.props.state}
                            onChange={(date) => this.props.handle(date, this.props.name)}
                            KeyboardButtonProps={{
                                'aria-label': 'change time',
                            }}
                            cancelLabel="Cancelar"
                            className={classes.picker}
                            format={this.props.formatDate ? this.props.formatDate : "YYYY/MM/DD"}
                            views={this.props.views ? this.props.views : ["year", "month", "date"]}
                            {...newProps}
                        />
                        {/*views={this.props.views ? this.props.views : ["year","date","month"]}*/}
                    </MuiPickersUtilsProvider>
                );
            default:
                return "No existe tipo de TextField";
        }
    }
}
class EasyButton_ extends PureComponent {
    constructor(props) {
        super(props);

        this.unique_id = null;
    }
    /* shouldComponentUpdate(nextProps, nextState) {
        //Fuerza a que no se renderice los botones
        return false;
    } */

    componentDidMount() {
        this.unique_id = Math.floor(Math.random() * 10000);
    }
    render() {
        // NEW PROPS
        const newProps = { ...this.props };
        delete newProps.color;
        delete newProps.type;
        delete newProps.classes
        delete newProps.handle
        //console.log(newProps);

        const { classes } = this.props;

        const classy = classnames(
            classes.button//, classes[this.props.color]
        )
        const classySlim = classnames(
            //classes.button, classes.slimButton, classes[this.props.color]
            classes.button, classes.slimButton
        )

        const theme = this.props.color ? createMuiTheme(colors(this.props.color)) : false;

        switch (this.props.type) {
            case 'text':
                return (
                    theme
                        ?
                        <ThemeProvider theme={theme}>
                            <Button color="primary"
                                className={classy} {...newProps}
                            >
                                {this.props.label}
                            </Button>
                        </ThemeProvider>
                        :
                        <Button color="primary"
                            className={classy} {...newProps}
                        >
                            {this.props.label}
                        </Button>
                );
            case 'contained':
                return (
                    theme ?
                        <ThemeProvider theme={theme}>
                            <Button variant="contained" color="primary"
                                className={classy} {...newProps}
                            >
                                {this.props.label}
                            </Button>
                        </ThemeProvider>
                        :
                        <Button variant="contained" color="primary"
                            className={classy} {...newProps}
                        >
                            {this.props.label}
                        </Button>
                );
            case 'slim':
                return (
                    theme
                        ?
                        <ThemeProvider theme={theme}>
                            <Button variant="contained" color="primary"
                                className={classySlim} {...newProps}
                            >
                                {this.props.label}
                            </Button>
                        </ThemeProvider>
                        :
                        <Button variant="contained" color="primary"
                            className={classySlim} {...newProps}
                        >
                            {this.props.label}
                        </Button>
                );
            case 'file':
                var filetype = null
                if (this.props.filetype === 'image') {
                    filetype = "image/*"
                }
                else if (this.props.filetype === 'xls') {
                    filetype = ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                }
                else {
                    filetype = "*/*"
                }
                return (
                    <>
                        <input
                            accept={filetype}
                            className={classes.input}
                            id={"contained-button-file-" + this.unique_id}
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={this.props.handle}
                        />
                        <label htmlFor={"contained-button-file-" + this.unique_id}>
                            {theme ?
                                <ThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary" component="span"
                                        className={classy} {...newProps}
                                    >
                                        {this.props.label}
                                    </Button>
                                </ThemeProvider>
                                :
                                <Button variant="contained" color="primary" component="span"
                                    className={classy} {...newProps}
                                >
                                    {this.props.label}
                                </Button>}
                        </label>
                    </>

                );
            default:
                return "No existe tipo de Button";
        }
    }
}


//SELECT AUTOSUGGEST
class EasyAutoSelect_ extends Component { //RSE Pendiente revisión de performance
    constructor(props) {
        super(props);
        this.dataset = [{ id: 0, label: "No records" }]
    }
    mappingDataset = () => {
        return this.props.dataset.map(item => ({ value: item.id, label: item.value }))
    }
    shouldComponentUpdate(nextProps, nextState) {

        if (this.props.dataset !== nextProps.dataset || this.props.state !== nextProps.state)
            console.log("EasyAutoselect changing...")


        return this.props.dataset !== nextProps.dataset || this.props.state !== nextProps.state; //props que cambian, sólo con esas se renderiza
    }
    render() {
        const { classes } = this.props;
        switch (this.props.type) {
            case 'single':
                return (
                    <ReactSingleSelect name={this.props.name} state={this.props.state} handle={this.props.handle} label={this.props.label} placeholder="Write..." dataset={this.props.dataset.length !== 0 ? this.mappingDataset() : this.dataset} className={classes.autoSelect} maxMenu={this.props.maxMenu} />
                );
            case 'multi':
                return (
                    <ReactMultiSelect name={this.props.name} state={this.props.state} handle={this.props.handle} label={this.props.label} placeholder="Write..." dataset={this.props.dataset.length !== 0 ? this.mappingDataset() : this.dataset} className={classes.autoSelect} maxMenu={this.props.maxMenu} />
                );
            default:
                return "Auto Select type doesn't exist";
        }
    }
}

//MATERIAL TABLE
class EasyMaterialTable_ extends Component {
    /*constructor(props) {
        super(props);
    }*/


    shouldComponentUpdate(nextProps, nextState) {

        console.log("#----------------START----------------#")
        /*
        console.log("#----------->Actual State<------------#")
        console.log(this.state)
        console.log("#----------->Next State<------------#")
        console.log(nextState)
        console.log("#-----------------------------------#")
        */
        console.log("#----------->Actual Props<------------#")
        console.log(this.props)
        console.log("#----------->Next Props<------------#")
        console.log(nextProps)
        console.log("#----------------END----------------#")
        //var rsp = (this.props !== nextProps);
        //console.log("Should component update? rsp: "+rsp)
        return this.props.state !== nextProps.state;
    }
    render() {
        return (
            <MaterialTable flag={this.props.flag} state={this.props.state} title={this.props.title} handle={this.props.handle} name={this.props.name} delete={this.props.delete} />
        );
    }
}
class EasyMuiDataTable_ extends Component {
    /*constructor(props) {
        super(props);
    }*/
    shouldComponentUpdate(nextProps, nextState) {

        // console.log("#----------->Actual Props<------------#")
        // console.log(this.props)
        // console.log("#----------->Next Props<------------#")
        // console.log(nextProps)
        // console.log("#----------------END----------------#")
        const msg = (this.props.state !== nextProps.state) ? "Render MuiDatatable!" : "No Render MuiDatatable"
        console.log(msg);
        return this.props.state !== nextProps.state;
    }
    abortController = new AbortController();

    componentWillUnmount = () => {
        this.abortController.abort()
    }
    render() {

        return (
            <MUIDataTable
                title={this.props.title}
                state={this.props.state}
                delete={this.props.delete}
                handle={this.props.handle}
                name={this.props.name}
                loading={this.props.loading}
                selectableRows={this.props.selectable}
                //Expand properties
                expand={this.props.expand}//Valor acepta true o false
                expandComponent={this.props.expandComponent} //El componente debe ser enviado como variable, además este puede usar la variable data que se define con setData
                expandCallback={this.props.expandCallback} //La función debe recibir 2 parámetros, rowData y setData. rowData es un arreglo de la fila y setData envía datos al componente enviado
                //Custom toolbar
                create={this.props.create}
                update={this.props.update}
                delete={this.props.delete}
                handleCreate={this.props.handleCreate}//La función debe recibir 1 parámetro, este es el dataIndex, es decir el índice del registro seleccionado, sirve para buscar en el estado
                handleUpdate={this.props.handleUpdate}//La función debe recibir 1 parámetro, este es el dataIndex, es decir el índice del registro seleccionado, sirve para buscar en el estado
                handleDelete={this.props.handleDelete}//La función debe recibir 1 parámetro, este es el dataIndex, es decir el índice del registro seleccionado, sirve para buscar en el estado
                multiIndexAction={this.props.multiIndexAction}//Permite que las funciones handleCreate y handleUpdate reciban un arreglo de índices, esto significa que soporta varias selecciones
            />
        );

    }
}




//JUST DIALOG

//Form dialog components
const styles = theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const FormDialogTitle = withStyles(styles)(memo(props => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
}));

const FormDialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const FormDialogActions = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);


class EasyDialog_ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: this.props.isOpen ? this.props.isOpen : false,
            isOK: null,
        }
    }
    shouldComponentUpdate(nextProps, nextState) {

        // console.log("#----------->Actual Props<------------#")
        // console.log(this.props)
        // console.log("#----------->Next Props<------------#")
        // console.log(nextProps)
        // console.log("#----------------END----------------#")
        const msg = (this.props.state !== nextProps.state) ? "Render Dialog!" : "No Render Dialog"
        console.log(msg);
        if (this.props.state) //Sólo en caso de propiedad state para formulario valida la diferencia
            return this.props.state !== nextProps.state;
        return true;
    }
    //Handle para confirm y form
    handleOK = (value) => {
        console.log("Valor elegido del confirmDialog: " + value);
        this.setState({ isOK: value });
        //this.setState({isOpen: false});
        //Envía al el valor elegido: true o false, al handle dialog: arrow externa
        if (this.props.handleDialog)
            this.props.handleDialog(value);
        else
            this.props.handleClose()
        //Cierra el dialog luego de ejecutar el handle externo del formulario
        //this.props.handleClose() //Bug
    }
    //Handle para alert
    handleAlert = () => {
        //Sólo ejecuta la arrow externa
        this.props.handleDialog()
    }

    handleClose = () => {
        this.props.handleClose()
    }

    render() {

        switch (this.props.type) {
            case 'alert':
                return (
                    <Dialog
                        open={this.props.isOpen}
                        onClose={() => { }}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        TransitionComponent={TransitionDown}
                    >
                        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.props.description}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions> {/*style={{justifyContent: 'center'}}*/}
                            <EasyButton label="OK" onClick={this.handleAlert} type="text" color="green" />
                        </DialogActions>
                    </Dialog>
                );
            case 'confirm':
                return (
                    <Dialog
                        open={this.props.isOpen}
                        onClose={() => this.handleOK(null)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.props.description}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <EasyButton label="No" onClick={() => this.handleOK(false)} type="text" color="red" />
                            <EasyButton label="Sí" onClick={() => this.handleOK(true)} type="text" color="green" />
                        </DialogActions>
                    </Dialog>
                );
            case 'form':
                const { component: InnerComponent, formNameButton } = this.props
                return (
                    <Dialog
                        open={this.props.isOpen}
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        fullWidth={true}
                        maxWidth='sm'
                    >
                        <FormDialogTitle id="alert-dialog-title" onClose={this.handleClose}>
                            {this.props.title}
                        </FormDialogTitle>
                        <FormDialogContent dividers>
                            <DialogContentText id="alert-dialog-description">
                                {this.props.description}
                            </DialogContentText>
                            {InnerComponent ? <InnerComponent state={this.props.state} handle={this.props.handle} /> : "No se envió componente"}
                        </FormDialogContent>
                        <FormDialogActions>
                            <EasyButton label={formNameButton ? formNameButton : "Guardar"} onClick={() => this.handleOK(true)} type="text" color="green" />
                        </FormDialogActions>
                    </Dialog>
                );
            default:
                return (
                    <Dialog
                        open={this.props.isOpen}
                        onClose={() => this.handleOK(null)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                        <DialogContent>
                            <Typography variant="h6">Default Dialog!</Typography>
                        </DialogContent>
                        <DialogActions>
                            <EasyButton label="No" onClick={() => this.handleOK(false)} type="text" color="red" />
                            <EasyButton label="Sí" onClick={() => this.handleOK(true)} type="text" color="green" />
                        </DialogActions>
                    </Dialog>
                );
        }
    }
}


//SWIPEABLE TABS
class EasySwipTabs_ extends Component {
    /*constructor(props) {
        super(props);
    }*/
    render() {
        const { components, getIndex } = this.props;
        return <SwipTabs components={components} getIndex={getIndex} />
    }
}


class EasySnackbar_ extends PureComponent {
    /*constructor(props) {
        super(props);
    }*/
    render() {
        return <Snackbar open={this.props.open} message={this.props.message} type={this.props.type} handleClose={this.props.handleClose} />
    }
}

// class EasyTree_ extends PureComponent {
//     /*constructor(props) {
//         super(props);
//     }*/
//     render() {
//         return <Tree {...this.props} />
//     }
// }

const EasySlider_ = memo((props) => {
    const { state, handle, valueLabelFormat, valueText, min, max, marks, classes, name } = props;

    const defaultValueLabelFormat = (value) => {
        return value;
    }

    const defaultValueText = (value) => {
        //console.log("TEXT " + value)
        return `${value}%`;
    }
    return (
        <div className={classes.slider}>
            <Slider
                value={state}
                valueLabelFormat={valueLabelFormat ? valueLabelFormat : defaultValueLabelFormat} //función para determinar qué se verá en el label en un hover
                getAriaValueText={valueText ? valueText : defaultValueText}
                aria-labelledby="discrete-slider"
                step={null}
                valueLabelDisplay="auto"
                onChange={(event, value) => handle(value, name)}
                marks={marks ? marks : true} //set en el cual se deslisará el slider
                min={min ? min : 0}
                max={max ? max : 100}
            />
        </div>
    )
})

//EXPORT WITHSTYLES!
const EasySelect = withStyles(style)(EasySelect_)
const EasyTextField = withStyles(style)(EasyTextField_)
const EasyPicker = withStyles(style)(EasyPicker_)
const EasyButton = withStyles(style)(EasyButton_)
const EasyAutoSelect = withStyles(style)(EasyAutoSelect_)
const EasyMaterialTable = withStyles(style)(EasyMaterialTable_)
const EasyMuiDataTable = withStyles(style)(EasyMuiDataTable_)
const EasyDialog = withStyles(style)(EasyDialog_)
const EasySwipTabs = withStyles(style)(EasySwipTabs_)
const EasySnackbar = withStyles(style)(EasySnackbar_)
// const EasyTree = EasyTree_
const EasySlider = withStyles(style)(EasySlider_)
export {
    EasySelect,
    EasyTextField,
    EasyPicker,
    EasyButton,
    EasyAutoSelect,
    EasyMaterialTable,
    EasyMuiDataTable,
    EasyDialog,
    EasySwipTabs,
    EasySnackbar,
    // EasyTree,
    EasySlider
};