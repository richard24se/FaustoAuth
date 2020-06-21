import {baseColorsStyle} from '../../themes/colors'
const styles = theme => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      
    },
    select: {
      //margin: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: 120,
      width: '100%',
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    formInput:{
      margin: theme.spacing(1),
      minWidth: 120,
      width: '100%'
    },
    textField: {
      //margin: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      //marginLeft: theme.spacing(1),
      //marginRight: theme.spacing(1),
      //width: 120,
      minWidth: 120,
    },
    picker: {
      //maxWidth: 250,
      width: '100%',
      //margin: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    textArea: {
      //maxWidth: 250, #RSE permite manejo con GRID UI
      margin: theme.spacing(1),
    },
    button: {
      margin: theme.spacing(1),
    },
    slimButton:{
      lineHeight: "unset",
      margin: "unset",
      //fontSize: "0.7625rem",
      fontSize: "0.7420rem",
    },
    autoSelect: {
      //margin: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      //RSE FORM CONTROL
      border: 0,
      margin: 0,
      display: "inline-flex",
      padding: 0,
      position: "relative",
      minWidth: 0,
      width: "100%",
      flexDirection: "column",
      verticalAlign: "top",
      //RSE FORM CONTROL
    },
    slider: {
      margin: theme.spacing(3),
    },
    ...baseColorsStyle,
  });
export default styles;