import React from 'react';
import { useEffect } from 'react';
import { memo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Select, { components, createFilter } from 'react-select';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';

import { FixedSizeList as List } from "react-window";
//STYLE
import classnames from "classnames";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    //height: 250,
    //minWidth: 290,

  },
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: theme.spacing(0.5, 0.25),
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2),
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 201,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing(2),
  },
  indicator:
  {
    padding: '6px !important' //Fix to improve padding when select option RSE
  }
}));


//NEW
const DropdownIndicator = props => {
  return (
    <components.DropdownIndicator className={props.selectProps.classes.indicator} {...props}>
      {props.children}
    </components.DropdownIndicator>
  );
};
//NEW CLEAR INDICATOR
const ClearIndicator = props => {
  return (
    <components.ClearIndicator className={props.selectProps.classes.indicator} {...props}>
      {props.children}
    </components.ClearIndicator>
  );
};

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      No existen registros!
      {/*props.children*/}
    </Typography>
  );
}

NoOptionsMessage.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  /**
   * Props to be passed on to the wrapper.
   */
  //innerProps: PropTypes.object.isRequired,
  selectProps: PropTypes.object.isRequired,
};

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.any.isRequired,
    }),
  ]),
};

function Control(props) {
  const {
    children,
    innerProps,
    innerRef,
    selectProps: { classes, TextFieldProps },
  } = props;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: classes.input,
          ref: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...TextFieldProps}
    />
  );
}

Control.propTypes = {
  /**
   * Children to render.
   */
  children: PropTypes.node,
  /**
   * The mouse down event and the innerRef to pass down to the controller element.
   */
  innerProps: PropTypes.shape({
    onMouseDown: PropTypes.func.isRequired,
  }).isRequired,
  innerRef: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.any.isRequired,
    }),
  ]).isRequired,
  selectProps: PropTypes.object.isRequired,
};

function Option(props) {
  //Se remueve el mouse event ya que causa lentitud en grandes listass
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;

  return (
    <MenuItem
      ref={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 600 : 400, // Increase to bold when SELECTED
      }}
      {...rest}
    >
      {props.children}
    </MenuItem>
  );
}

Option.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  /**
   * props passed to the wrapping element for the group.
   */
  innerProps: PropTypes.shape({
    id: PropTypes.string.isRequired,
    //key: PropTypes.string.isRequired, //GET ERROR RSE
    onClick: PropTypes.func.isRequired,
    onMouseMove: PropTypes.func.isRequired,
    onMouseOver: PropTypes.func.isRequired,
    tabIndex: PropTypes.number.isRequired,
  }).isRequired,
  /**
   * Inner ref to DOM Node
   */
  innerRef: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.any.isRequired,
    }),
  ]),
  //.isRequired, GET ERROR RSE
  /**
   * Whether the option is focused.
   */
  isFocused: PropTypes.bool.isRequired,
  /**
   * Whether the option is selected.
   */
  isSelected: PropTypes.bool.isRequired,
};

function Placeholder(props) {
  const { selectProps, innerProps = {}, children } = props;
  return (
    <Typography color="textSecondary" className={selectProps.classes.placeholder} {...innerProps}>
      {children}
    </Typography>
  );
}

Placeholder.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  /**
   * props passed to the wrapping element for the group.
   */
  innerProps: PropTypes.object,
  selectProps: PropTypes.object.isRequired,
};

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

SingleValue.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  /**
   * Props passed to the wrapping element for the group.
   */
  //innerProps: PropTypes.any.isRequired, GET ERROR RSE
  selectProps: PropTypes.object.isRequired,
};

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

ValueContainer.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  selectProps: PropTypes.object.isRequired,
};

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={clsx(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
      size="small"
    />
  );
}

MultiValue.propTypes = {
  children: PropTypes.node,
  isFocused: PropTypes.bool.isRequired,
  removeProps: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onTouchEnd: PropTypes.func.isRequired,
  }).isRequired,
  selectProps: PropTypes.object.isRequired,
};

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

Menu.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.element.isRequired,
  /**
   * Props to be passed to the menu wrapper.
   */
  innerProps: PropTypes.object.isRequired,
  selectProps: PropTypes.object.isRequired,
};

//VIRTUALIZE OR WINDOWING LIST
const height = 35;

class MenuList extends React.Component {

  render() {
    const { options, children, maxHeight, getValue } = this.props;
    const [value] = getValue();
    const real_value = value === undefined ? 0 : value.value;//me da el verdadero valor
    const initialOffset = options.findIndex((o) => o.value === real_value) * height; //me da la posición inicial del valor elegido
    const childrenHeight = height * children.length;
    const calculatedMaxHeight = childrenHeight > maxHeight ? maxHeight : childrenHeight + 1; //permite que se automático el menu #necesita ser forkeado en todo
    const calculatedInitialScrollOffset = childrenHeight > maxHeight ? initialOffset : 0

    return (
      <List
        height={calculatedMaxHeight}
        itemCount={children.length}
        itemSize={height}
        initialScrollOffset={calculatedInitialScrollOffset}
        className={this.props.selectProps.classes.paper}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
  }
}

const new_components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
  DropdownIndicator,
  ClearIndicator,
  MenuList
};
//Memo (like PureComponent)
const ifDatasetDiff = (prevProps, nextProps) => {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
}
const SingleSelect = memo(function ReactSingleSelect({ ...props }) {
  const classes = useStyles();
  const theme = useTheme();
  // const [single, setSingle] = React.useState(null);
  // const [multi, setMulti] = React.useState(null);

  // function handleChangeSingle(value) {
  //   setSingle(value);
  // }

  // function handleChangeMulti(value) {
  //   setMulti(value);
  // }

  const selectStyles = {
    input: base => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: "all .2s ease",
      transform: state.isFocused ? "rotate(180deg)" : null,
      padding: '6px',
    }),
  };

  useEffect(() => {
    console.log("Re-Render Single Select")
    console.log(props)
  })

  return (
    <div className={classnames(classes.root, props.className)}>
      <NoSsr>
        <Select
          classes={classes}
          styles={selectStyles}
          inputId="react-select-single"
          TextFieldProps={{
            label: props.label,
            InputLabelProps: {
              name: props.name,
              htmlFor: 'react-select-single',
              shrink: true,
            },
          }}
          placeholder={props.placeholder}
          options={props.dataset}
          components={new_components}
          value={props.state}
          onChange={(value) => props.handle(value, props.name)}
          maxMenuHeight={props.maxMenu ? props.maxMenu : 100}
          isClearable
          filterOption={createFilter({ ignoreAccents: false })}

        />
      </NoSsr>
    </div>
  );
}, ifDatasetDiff)

const MultiSelect = function ReactMultiSelect({ ...props }) {
  const classes = useStyles();
  const theme = useTheme();
  // const [single, setSingle] = React.useState(null);
  // const [multi, setMulti] = React.useState(null);

  // function handleChangeSingle(value) {
  //   setSingle(value);
  // }

  // function handleChangeMulti(value) {
  //   setMulti(value);
  // }

  const selectStyles = {
    input: base => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: "all .2s ease",
      transform: state.isFocused ? "rotate(180deg)" : null,
      padding: '6px',
    }),
  };

  return (
    <div className={classnames(classes.root, props.className)}>
      <NoSsr>
        <Select
          classes={classes}
          styles={selectStyles}
          inputId="react-select-multiple"
          TextFieldProps={{
            label: props.label,
            InputLabelProps: {
              name: props.name,
              htmlFor: 'react-select-multiple',
              shrink: true,
            },
          }}
          placeholder={props.placeholder}
          options={props.dataset}
          components={new_components}
          value={props.state}
          onChange={(value) => props.handle(value, props.name)}
          maxMenuHeight={props.maxMenu ? props.maxMenu : 100}
          isClearable
          isMulti
        />
      </NoSsr>
    </div>
  );
}

export { SingleSelect, MultiSelect };
