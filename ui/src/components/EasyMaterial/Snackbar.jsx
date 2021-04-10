import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
// import Button from "@material-ui/core/Button";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import { amber, green } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

import Slide from '@material-ui/core/Slide';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// const ColorCircularProgress = withStyles({
//     root: {
//         color: "#ccc"
//     }
// })(CircularProgress);

const IconCircularProgress = withStyles({
    root: {
        color: "#fff",
        padding: "2px",
        marginRight: "10px"
    }
})(props => {
    const { classes, className } = props;
    return (
        <CircularProgress
            className={clsx(classes.root, className)}
            size={30}
            thickness={5}
        />
    );
});

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
    progress: IconCircularProgress
};

const useStyles1 = makeStyles(theme => ({
    success: {
        backgroundColor: green[600]
    },
    error: {
        backgroundColor: theme.palette.error.dark
    },
    info: {
        backgroundColor: theme.palette.primary.main
    },
    warning: {
        backgroundColor: amber[700]
    },
    icon: {
        fontSize: 20
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1)
    },
    message: {
        display: "flex",
        alignItems: "center"
    }
}));

const MySnackbarContentWrapper = React.forwardRef((props, ref) => {
    const classes = useStyles1();
    const { className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            ref={ref}
            className={clsx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={clsx(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="close"
                    color="inherit"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>
            ]}
            {...other}
        />
    );
})

MySnackbarContentWrapper.propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
    onClose: PropTypes.func,
    variant: PropTypes.oneOf(["error", "info", "success", "warning", "progress"])
        .isRequired
};

// const useStyles2 = makeStyles(theme => ({
//     margin: {
//         margin: theme.spacing(1)
//     }
// }));

export default function EasySnackbar(props) {
    // const classes = useStyles2();
    const [open, setOpen] = React.useState(false);

    const handleClose = (event, reason) => {
        if(props.handleClose){
            console.log("Trying closing with redux action")
            props.handleClose()
        }        
        if (reason === "clickaway") {
            return;
        }
        console.log(open)
        setOpen(false);
    };
    switch (props.type) {
        case 'processing':
            return (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    open={props.open}
                    //autoHideDuration={8000}
                    onClose={handleClose}
                    TransitionComponent={SlideTransition}
                >
                    <MySnackbarContentWrapper
                        onClose={handleClose}
                        variant="progress"
                        message={props.message ? props.message : "No recibió mensaje"}
                    />
                </Snackbar>
            )
        case 'success':
            return (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    open={props.open}
                    //autoHideDuration={8000}
                    onClose={handleClose}
                    TransitionComponent={SlideTransition}
                >
                    <MySnackbarContentWrapper
                        onClose={handleClose}
                        variant="success"
                        message={props.message ? props.message : "No recibió mensaje"}
                    />
                </Snackbar>
            )
        case 'warning':
            return (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    open={props.open}
                    //autoHideDuration={8000}
                    onClose={handleClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleClose}
                        variant="warning"
                        message={props.message ? props.message : "No recibió mensaje"}
                    />
                </Snackbar>
            )
        case 'error':
            return (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    open={props.open}
                    //autoHideDuration={8000}
                    onClose={handleClose}
                    TransitionComponent={SlideTransition}
                >
                    <MySnackbarContentWrapper
                        onClose={handleClose}
                        variant="error"
                        message={props.message ? props.message : "No recibió mensaje"}
                    />
                </Snackbar>
            )
        default:
            return (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    open={props.open}
                    //autoHideDuration={8000}
                    onClose={handleClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleClose}
                        variant="info"
                        message={props.message ? props.message : "No recibió mensaje"}
                    />
                </Snackbar>
            )
    }
}
