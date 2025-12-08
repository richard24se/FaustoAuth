import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { fade } from '@mui/material/styles/colorManipulator';


import { useTheme } from '@mui/material/styles';


//const useStyles = makeStyles(theme => ({}));


const OverlayLoading= ({...props}) => {
    const theme = useTheme();
    return (
    <div style={{ display: 'table', width: '100%', height: '100%', backgroundColor: fade(theme.palette.background.paper, 0.7) }}>
    <div style={{ display: 'table-cell', width: '100%', height: '100%', verticalAlign: 'middle', textAlign: 'center' }}>
      <CircularProgress />
    </div>
    </div>)
};

export default OverlayLoading