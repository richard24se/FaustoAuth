import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';

import Select, { components, createFilter, CSSProperties } from 'react-select';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import NoSsr from '@mui/material/NoSsr';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import CancelIcon from '@mui/icons-material/Cancel';
import { FixedSizeList as List } from 'react-window';
import {
  StyledSelect

} from './style'
import { maxWidth } from '@mui/system';



//NEW
const DropdownIndicator = props => {
  return (
    <components.DropdownIndicator {...props}>
      {props.children}
    </components.DropdownIndicator>
  );
};
//NEW CLEAR INDICATOR

const ClearIndicator = (props) => {
  return (
    <components.ClearIndicator {...props}>
      {props.children}
    </components.ClearIndicator>
  );
};

function NoOptionsMessage(props) {
  const { innerProps, getStyles } = props;
  return (
    <Typography
      color="textSecondary"
      {...innerProps}
      style={getStyles('noOptionsMessage', props)}
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

function inputComponent({ inputRef, getStyles, ...props }) {
  return <div id="inputComponent" ref={inputRef}  {...props} />;
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
    getStyles,
    selectProps: { TextFieldProps },
  } = props;

  return (
    <TextField
      id="TextField"
      fullWidth
      InputProps={{
        inputComponent,
        style: getStyles("input", props),
        inputProps: {
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
  const { getStyles, innerRef, isFocused, isSelected, children } = props;

  return (
    <MenuItem
      ref={innerRef}
      selected={isSelected}
      component="div"
      // style={getStyles('option', props)}
      {...rest}
    >
      {children}
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
  const { getStyles, innerProps = {}, children } = props;
  return (
    <Typography color="textSecondary" style={getStyles("placeholder", props)} {...innerProps}>
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
  const { children, getStyles, innerProps } = props;
  return (
    <Typography style={getStyles('singleValue', props)} {...innerProps}>
      {children}
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

const ValueContainer0 = ({
  children,
  ...props
}) => (
  <components.ValueContainer id="ValueContainer" test="test1" {...props}>{children}</components.ValueContainer>
);

function ValueContainer(props) {
  const { children, getStyles, innerRef, innerProps } = props;
  return (
    <div
      id="ValueContainer"
      // className={getClassNames("valueContainer", props)}
      ref={innerRef} {...innerProps}
      style={getStyles("valueContainer", props)}

    // style={{
    //   display: 'flex',
    //   flexWrap: 'wrap',
    //   flex: 1,
    //   alignItems: 'center',
    //   overflow: 'hidden',
    // }}
    >
      {children}
    </div>
  );
}

ValueContainer.propTypes = {
  /**
   * The children to be rendered.
   */
  children: PropTypes.node,
  selectProps: PropTypes.object.isRequired,
};

function MultiValue(props) {
  const { children, getStyles, removeProps } = props;
  return (
    <Chip
      tabIndex={-1}
      label={children}
      style={getStyles('multiValue', props)}
      onDelete={removeProps.onClick}
      deleteIcon={<CancelIcon {...removeProps} style={getStyles('multiValueRemove', props)} />}
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
  const { children, getStyles, innerProps } = props;
  return (
    <Paper square {...innerProps} style={getStyles('menu', props)}>
      {children}
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
const HEIGHT = 35;

class MenuList extends React.Component {

  render() {
    const { options, children, maxHeight, getValue } = this.props;
    const value = getValue()?.[0];
    const realValue = value === undefined ? 0 : value.value;
    const initialOffset = options.findIndex((o) => o.value === realValue) * HEIGHT;
    const childrenHeight = HEIGHT * children.length;
    const calculatedMaxHeight = childrenHeight > maxHeight ? maxHeight : childrenHeight + 1;
    const calculatedInitialScrollOffset = childrenHeight > maxHeight ? initialOffset : 0;

    return (
      <List
        height={calculatedMaxHeight}
        itemCount={children.length}
        itemSize={HEIGHT}
        initialScrollOffset={calculatedInitialScrollOffset}

      >
        {({ index, style }) => <div style={style} >{children[index]}</div>}
      </List>
    );
  }
}

const newComponents = {
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
  MenuList,
};

const ifDatasetDiff = (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.dataset) === JSON.stringify(nextProps.dataset) &&
    JSON.stringify(prevProps.state) === JSON.stringify(nextProps.state)
  );
};

const SingleSelect = memo(function ReactSingleSelect({
  label,
  name,
  placeholder,
  dataset,
  state,
  handle,
  maxMenu,
  ...props
}) {
  const theme = useTheme();

  const selectStyles = {
    container: (base) => ({
      ...base,
      width: '100%',
      marginTop: "8px",
      // maxWidth: 223,
      // minWidth: "203px",
      flex: 1,
    }),
    control: (base, state) => ({
      ...base,
      width: '100%',
      minHeight: '56px',
      borderRadius: '4px',
      border: `1px solid ${state.isFocused ? theme.palette.primary.main : theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: state.isFocused
        ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
        : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      cursor: 'pointer',
    }),
    valueContainer: (base) => ({
      ...base,
      // paddingRight: '40px',
      paddingRight: '0px',
      paddingLeft: '0px',
      display: 'flex',
      flexWrap: 'wrap',
      flex: 1,
      alignItems: 'center',
      overflow: 'hidden',
      // background: "purple"
    }),
    input: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      display: 'flex',
      padding: 0,
      height: 'auto',
      // maxWidth: 290,
      // margin: 0,
      // padding: 0,
      // // minWidth: 200,
      '& input': {
        font: 'inherit',
        maxWidth: 133,
        // padding: "20px !important",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      fontSize: '1rem',
      fontWeight: 400,
      // position: 'absolute',
      left: 0,
      bottom: 6,
    }),

    singleValue: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      fontSize: '1rem',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      position: 'absolute',
      right: '8px',
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? theme.palette.primary.main : theme.palette.text.secondary,
      transition: 'all 0.2s ease',
      transform: state.isFocused ? 'rotate(180deg)' : 'rotate(0deg)',
      padding: '6px',
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.primary.main,
      },
    }),
    clearIndicator: (base, state) => ({
      ...base,
      color: theme.palette.text.secondary,
      padding: '6px',
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.error.main,
      },
    }),
    menu: (base) => ({
      ...base,
      marginTop: '4px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[8],
      borderRadius: '4px',
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 1300,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? theme.palette.primary.main
        : state.isFocused
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
      color: state.isSelected
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
      padding: '12px 16px',
      cursor: 'pointer',
      fontWeight: state.isSelected ? 600 : 400,
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: state.isSelected
          ? theme.palette.primary.main
          : alpha(theme.palette.primary.main, 0.12),
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      padding: '2px 8px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.08),
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      padding: '12px 16px',
      textAlign: 'center',
    }),
  };

  useEffect(() => {
    console.log('Re-Render Single Select');
    console.log(props);
  }, [state]);

  return (
    <StyledSelect>
      <NoSsr>
        <Select
          styles={selectStyles}
          inputId="react-select-single"
          TextFieldProps={{
            label,
            InputLabelProps: {
              name,
              htmlFor: 'react-select-single',
              shrink: true,
            },
          }}
          placeholder={placeholder}
          options={dataset}
          components={newComponents}
          value={state}
          onChange={(value) => handle(value, name)}
          maxMenuHeight={maxMenu || 100}
          isClearable
          filterOption={createFilter({ ignoreAccents: false })}
          isOptionDisabled={(option) => option.disabled === true}
          {...props}
        />
      </NoSsr>
    </StyledSelect>
  );
}, ifDatasetDiff);

SingleSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  dataset: PropTypes.arrayOf(PropTypes.object).isRequired,
  state: PropTypes.object,
  handle: PropTypes.func.isRequired,
  maxMenu: PropTypes.number,
};

const MultiSelect = memo(function ReactMultiSelect({
  label,
  name,
  placeholder,
  dataset,
  state,
  handle,
  maxMenu,
  ...props
}) {
  const theme = useTheme();

  const selectStyles = {
    container: (base) => ({
      ...base,
      width: '100%',
    }),
    control: (base, state) => ({
      ...base,
      width: '100%',
      minHeight: '56px',
      borderRadius: '4px',
      border: `1px solid ${state.isFocused ? theme.palette.primary.main : theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: state.isFocused
        ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
        : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      cursor: 'pointer',
    }),
    valueContainer: (base) => ({
      ...base,
      paddingRight: '40px',
      padding: '8px 12px',
    }),
    input: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      margin: 0,
      padding: 0,
      '& input': {
        font: 'inherit',
        padding: 0,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      fontSize: '1rem',
      fontWeight: 400,
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      fontSize: '1rem',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      position: 'absolute',
      right: '8px',
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? theme.palette.primary.main : theme.palette.text.secondary,
      transition: 'all 0.2s ease',
      transform: state.isFocused ? 'rotate(180deg)' : 'rotate(0deg)',
      padding: '6px',
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.primary.main,
      },
    }),
    clearIndicator: (base, state) => ({
      ...base,
      color: theme.palette.text.secondary,
      padding: '6px',
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.error.main,
      },
    }),
    menu: (base) => ({
      ...base,
      marginTop: '4px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[8],
      borderRadius: '4px',
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 1300,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? theme.palette.primary.main
        : state.isFocused
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
      color: state.isSelected
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
      padding: '12px 16px',
      cursor: 'pointer',
      fontWeight: state.isSelected ? 600 : 400,
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: state.isSelected
          ? theme.palette.primary.main
          : alpha(theme.palette.primary.main, 0.12),
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      padding: '2px 8px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.08),
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      padding: '12px 16px',
      textAlign: 'center',
    }),
  };

  return (
    <StyledSelect>
      <NoSsr>
        <Select
          styles={selectStyles}
          inputId="react-select-multiple"
          TextFieldProps={{
            label,
            InputLabelProps: {
              name,
              htmlFor: 'react-select-multiple',
              shrink: true,
            },
          }}
          placeholder={placeholder}
          options={dataset}
          components={newComponents}
          value={state}
          onChange={(value) => handle(value, name)}
          maxMenuHeight={maxMenu ? maxMenu : 120}
          isClearable
          isMulti
          isOptionDisabled={(option) => option.disabled === true}
          {...props}
        />
      </NoSsr>
    </StyledSelect>
  );
}, ifDatasetDiff);

MultiSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  dataset: PropTypes.arrayOf(PropTypes.object).isRequired,
  state: PropTypes.object,
  handle: PropTypes.func.isRequired,
  maxMenu: PropTypes.number,
};

export { SingleSelect, MultiSelect };