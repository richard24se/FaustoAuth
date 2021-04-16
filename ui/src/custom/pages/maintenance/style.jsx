import {baseColorsStyle} from 'themes/colors'
const styles = theme => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    textField: {
      margin: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 120,
      minWidth: 120,
    },
    picker: {
      maxWidth: 250,
      margin: theme.spacing(1),
    },
    textArea: {
      maxWidth: 250,
      margin: theme.spacing(1),
    },
    button: {
      margin: theme.spacing(1),
    },
    paper: {
      padding: theme.spacing(1),
    },
    ...baseColorsStyle,
  });
export default styles;