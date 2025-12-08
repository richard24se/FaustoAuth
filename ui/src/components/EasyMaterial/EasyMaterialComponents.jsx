import React, { Component, PureComponent, memo } from 'react';



import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

// import clsx from 'clsx';
import Input from '@mui/material/Input';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

//PICKERS => DATE AND TIME
import 'date-fns';
import {
    LocalizationProvider,
    TimePicker,
    DatePicker,
} from '@mui/lab';
//import DateFnsUtils from '@date-io/date-fns';
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment/locale/es";

import Button from '@mui/material/Button';

import { SingleSelect as ReactSingleSelect, MultiSelect as ReactMultiSelect } from './ReactAutoSelect'

import MaterialTable from '../../components/EasyMaterial/MaterialTable';

import MUIDataTable from '../../components/EasyMaterial/MuiDataTable';
import MUIDataTableX from '../../components/EasyMaterial/MuiDataTableX';

import SwipTabs from '../../components/EasyMaterial/SwipTabs'

import Snackbar from '../../components/EasyMaterial/Snackbar'

// import { Tree } from '../../components/EasyMaterial/EasyTree'

import Slider from '@mui/material/Slider';

//DIALOG
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
//FORM DIALOG
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

//STYLE
import { styled } from '@mui/material/styles';

import {
    StyledRoot,
    StyledFormControl,
    StyledSelect,
    StyledInput,
    selectEmpty, // This is a style object, not a styled component
    StyledFormInput,
    StyledTextField,
    StyledPicker,
    StyledTextArea,
    StyledButton,
    StyledSlimButton,
    StyledSlider,
    StyledBaseColorsContainer,
} from './style'

import { colors } from '../../themes/colors'

import Slide from '@mui/material/Slide';

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
        return (
            <StyledSelect as={FormControl}>
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
            </StyledSelect>
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
        delete newProps.handle
        delete newProps.press
        delete newProps.pressKey
        delete newProps.startAdornment
        delete newProps.endAdornment


        switch (this.props.type) {
            case 'readonly':
                return (
                    <StyledTextField
                        id="standard-read-only-input"
                        label={this.props.label ? this.props.label : capitalize(this.props.name)}
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
                    <StyledTextField
                        id="standard-text-input"
                        label={this.props.label ? this.props.label : capitalize(this.props.name)}
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
                    <StyledFormInput as={FormControl}>
                        <InputLabel htmlFor="standard-adornment-password">{this.props.label}</InputLabel>
                        <StyledInput
                            id="standard-adornment-password"
                            type={this.state.showPassword ? 'text' : 'password'}
                            // margin="normal"
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
                    </StyledFormInput>
                );
            case 'textarea':
                return (
                    <StyledTextArea
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
        const { type, formatDate, handle, ...newProps } = this.props;
        // delete newProps.type;
        // delete newProps.classes;
        // delete newProps.formatDate;
        //const {classes} = this.props;
        switch (this.props.type) {
            case 'time':
                return (
                    <LocalizationProvider utils={(MomentUtils)} libInstance={moment} locale={this.locale}>
                        <StyledPicker>
                            <TimePicker
                                margin="normal"
                                id="time-picker"
                                label={this.props.label ? this.props.label : capitalize(this.props.name)}
                                value={this.props.state}
                                onChange={(date) => this.props.handle(date, this.props.name)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                                cancelLabel="Cancelar"
                                {...newProps}
                            />
                        </StyledPicker>
                    </LocalizationProvider >
                );
            case 'date':
                return (
                    <LocalizationProvider utils={(MomentUtils)} libInstance={moment} locale={this.locale}>
                        <StyledPicker>
                            <DatePicker
                                margin="normal"
                                id="date-picker"
                                label={this.props.label ? this.props.label : capitalize(this.props.name)}
                                value={this.props.state}
                                onChange={(date) => this.props.handle(date, this.props.name)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                                cancelLabel="Cancelar"
                                format={this.props.formatDate ? this.props.formatDate : "YYYY/MM/DD"}
                                views={this.props.views ? this.props.views : ["year", "month", "date"]}
                                {...newProps}
                            />
                        </StyledPicker>
                        {/*views={this.props.views ? this.props.views : ["year","date","month"]}*/}
                    </LocalizationProvider >
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
        delete newProps.handle
        //console.log(newProps);

        switch (this.props.type) {
            case 'text':
                return (
                    <StyledButton variant="text" color="primary"
                        {...newProps}
                    >
                        {this.props.label}
                    </StyledButton>
                );
            case 'contained':
                return (
                    <StyledButton variant="contained" color="primary"
                        {...newProps}
                    >
                        {this.props.label}
                    </StyledButton>
                );
            case 'slim':
                return (
                    <StyledSlimButton variant="contained" color="primary"
                        {...newProps}
                    >
                        {this.props.label}
                    </StyledSlimButton>
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
                            id={"contained-button-file-" + this.unique_id}
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={this.props.handle}
                        />
                        <label htmlFor={"contained-button-file-" + this.unique_id}>
                            <StyledButton variant="contained" color="primary" component="span"
                                {...newProps}
                            >
                                {this.props.label}
                            </StyledButton>
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
        this.dataset = [{ id: 0, label: "No records", disabled: true }]
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
        switch (this.props.type) {
            case 'single':
                return (
                    <ReactSingleSelect name={this.props.name} state={this.props.state} handle={this.props.handle} label={this.props.label} placeholder="Write..." dataset={ this.props.dataset && this.props.dataset.length !== 0 ? this.mappingDataset() : this.dataset} maxMenu={this.props.maxMenu} />
                );
            case 'multi':
                return (
                    <ReactMultiSelect name={this.props.name} state={this.props.state} handle={this.props.handle} label={this.props.label} placeholder="Write..." dataset={this.props.dataset && this.props.dataset.length !== 0 ? this.mappingDataset() : this.dataset} maxMenu={this.props.maxMenu} className={this.props.className} />
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
            <MUIDataTableX
                title={this.props.title}
                state={this.props.state}
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
const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
    position: 'relative',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
}));

const FormDialogTitle = memo(({ children, onClose, ...other }) => (
    <StyledDialogTitle disableTypography {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
            <CloseButton aria-label="close" onClick={onClose}>
                <CloseIcon />
            </CloseButton>
        ) : null}
    </StyledDialogTitle>
));

const FormDialogContent = styled(MuiDialogContent)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const FormDialogActions = styled(MuiDialogActions)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1),
}));


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
                            <EasyButton_ label="OK" onClick={this.handleAlert} type="text" color="green" />
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
                            <EasyButton_ label="No" onClick={() => this.handleOK(false)} type="text" color="red" />
                            <EasyButton_ label="Sí" onClick={() => this.handleOK(true)} type="text" color="green" />
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
                            <EasyButton_ label={formNameButton ? formNameButton : "Guardar"} onClick={() => this.handleOK(true)} type="text" color="green" />
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
                            <EasyButton_ label="No" onClick={() => this.handleOK(false)} type="text" color="red" />
                            <EasyButton_ label="Sí" onClick={() => this.handleOK(true)} type="text" color="green" />
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
    const { state, handle, valueLabelFormat, valueText, min, max, marks, name } = props;

    const defaultValueLabelFormat = (value) => {
        return value;
    }

    const defaultValueText = (value) => {
        //console.log("TEXT " + value)
        return `${value}%`;
    }
    return (
        <StyledSlider>
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
        </StyledSlider>
    )
})

export {
    EasySelect_ as EasySelect,
    EasyTextField_ as EasyTextField,
    EasyPicker_ as EasyPicker,
    EasyButton_ as EasyButton,
    EasyAutoSelect_ as EasyAutoSelect,
    EasyMaterialTable_ as EasyMaterialTable,
    EasyMuiDataTable_ as EasyMuiDataTable,
    EasyDialog_ as EasyDialog,
    EasySwipTabs_ as EasySwipTabs,
    EasySnackbar_ as EasySnackbar,
    // EasyTree,
    EasySlider_ as EasySlider
};