import { makeStyles } from "@mui/styles";
//Colors from material-ui
import { grey, green, blue, red, purple, pink } from '@mui/material/colors';


import tinycolor from "tinycolor2";
const darkenRate = 10;
const lightenRate = 7.5;

const baseColorsStyle = {
  red: {
    color: red['A400']
  },
  green: {
    color: green['A400']
  },
  greenB: {
    backgroundColor: green['A400'],
    '&:hover': {
      background: tinycolor(green['A400']).darken(darkenRate).toHexString(),
    }
  },
  redB: {
    backgroundColor: red['A400'],
    '&:hover': {
      background: tinycolor(red['A400']).darken(darkenRate).toHexString(),
    }
  },
  blueB: {
    backgroundColor: blue['A400'],
    '&:hover': {
      background: tinycolor(blue['A400']).darken(darkenRate).toHexString(),
    }
  },
}


const colors = (color) => {

  var primary = grey[800]
  switch (color) {
    case 'red':
      primary = red['A400']
      break
    case 'blue':
      primary = blue['A400']
      break
    case 'green':
      primary = green['A400']
      break
    case 'purple':
      primary = purple['A400']
      break
    case 'pink':
      primary = pink['A400']
      break
    default:
      primary = grey[800]
  }
  return {
    palette: {
      primary: {
        main: primary,
        light: tinycolor(primary)
          .lighten(lightenRate)
          .toHexString(),
        dark: tinycolor(primary)
          .darken(darkenRate)
          .toHexString(),
        contrastText: 'white',
      }
    }
  }
}

const classStyles = theme => (baseColorsStyle);

const hooksStyles = makeStyles(theme => (baseColorsStyle));

export { classStyles, hooksStyles, baseColorsStyle, colors }
