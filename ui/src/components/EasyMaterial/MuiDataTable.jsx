import React, { useState, useEffect, memo } from 'react';
import {
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  TextField,
  MenuItem,
  Chip,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CancelIcon from '@mui/icons-material/Cancel';

import { EasyButton, EasyDialog } from "./EasyMaterialComponents";

// Styled components for CustomToolbarSelect
const StyledToolbarSelect = styled('div')({
  // This will be the root of the toolbar
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(3), // 24px
  top: "50%",
  display: "inline-block",
  position: "relative",
  //transform: "translateY(-50%)" // This can be handled by flexbox or other layout
}));

const StyledCustomIcon = styled('div')({ // This will be the icon itself
  color: "#000"
});

// Styled Linear Progress
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  // Add any specific styles for the linear progress if needed
}));

const PureLinearProgress = memo(({ loading }) => {
  useEffect(() => {
    console.log(`Render Linear Progress! Loading: ${loading}`);
  }, [loading]);

  return loading ? <StyledLinearProgress /> : null;
});

const ExpandableRow = ({ component: Component, rowData, rowMeta, expandCallback }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(false);
  const colSpan = rowData.length + 1;

  useEffect(() => {
    setExpanded(true); // Always expand when component mounts
    if (expandCallback) {
      const { dataIndex } = rowMeta;
      expandCallback(dataIndex, setData);
    } else {
      console.error("ExpandableRow: No expandCallback function provided.");
    }
  }, [expandCallback, rowMeta]);

  return (
    <TableRow>
      <TableCell colSpan={colSpan} style={{ paddingBottom: 0, paddingTop: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {Component ? (data ? <Component data={data} /> : <CircularProgress />) : (
            <p>No component provided, but here is the data: {JSON.stringify(rowData)}</p>
          )}
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

const CustomToolbarSelect = ({
  selectedRows,
  displayData,
  setSelectedRows,
  handleUpdate: propHandleUpdate,
  handleCreate: propHandleCreate,
  handleDelete: propHandleDelete,
  create,
  update,
  delete: deleteProp, // Renamed to avoid conflict with reserved keyword
  multiIndexAction,
  setOpenDialog,
  handleDialogDelete,
}) => {
  const handleUpdate = () => {
    console.error("No hay función update del toolbar de MuiDatatable!");
    console.log("click! current selected rows", selectedRows);
    setSelectedRows([]);
  };
  const handleCreate = () => {
    console.error("No hay función create del toolbar de MuiDatatable!");
    console.log("click! current selected rows", selectedRows);
  };
  const handleDelete = () => {
    console.error("No hay función delete del toolbar de MuiDatatable!");
    console.log("click! current selected rows", selectedRows);
  };

  var dataIndex = null;
  if (multiIndexAction) {
    dataIndex = selectedRows.data.map(element => element);
  } else {
    dataIndex = selectedRows.data.length === 1 ? selectedRows.data[0] : false;
  }
  console.log("CustomToolbarSelect")
  console.log("CustomToolbarSelect")
  console.log(dataIndex)
  console.log(selectedRows.data.length)
  console.log(selectedRows)
  console.log(propHandleUpdate)


  return (
    <StyledToolbarSelect>
      {create && (
        <Tooltip title={"Add"}>
          <StyledIconButton onClick={propHandleCreate ? () => propHandleCreate(dataIndex) : handleCreate}>
            <AddIcon />
          </StyledIconButton>
        </Tooltip>
      )}
      {update && (
        <Tooltip title={"Edit"}>
          <StyledIconButton onClick={propHandleUpdate ? () => { console.log(dataIndex); return propHandleUpdate(dataIndex) } : handleUpdate}>
            <BrushIcon />
          </StyledIconButton>
        </Tooltip>
      )}
      {deleteProp && (
        <Tooltip title={"Delete"}>
          <StyledIconButton onClick={propHandleDelete ? () => {
            setOpenDialog(true);
            handleDialogDelete(dataIndex);
          } : handleDelete}>
            <DeleteForeverIcon />
          </StyledIconButton>
        </Tooltip>
      )}
    </StyledToolbarSelect>
  );
};

// Export the main component
export default function MaterialTable_({ ...props }) {
  const abortController = new AbortController();

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [arrowDelete, setArrowDelete] = useState(false);
  const [index, setIndex] = useState(null);
  const [rows, setRows] = useState([]); //rows handle

  var timeout;

  useEffect(() => {
    setLoading(true);
    return () => {
      clearTimeout(timeout);
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    setRows([]); //rows handle
    console.log("Updating rows data...");
  }, [props.state.data]);

  useEffect(() => {
    console.log("se está actualizando el estado... HOOKS!");
    setLoading(true);
    timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [props.state]);

  //HANDLE DELETE WITH DIALOG
  const handleDialog = (value) => {
    setOpenDialog(false);

    if (value) {
      console.log("Se realiza delete!");
      console.log(arrowDelete);
      props.handleDelete(arrowDelete);
    } else {
      console.log("No se realiza delete...");
    }
  };

  const handleDialogDelete = (arrow) => {
    console.log(arrow);
    setArrowDelete(arrow);
  };
  //HANDLE DELETE WITH DIALOG

  const handleDelete = () => {
    let data = [...props.state.data];
    data.splice(index, 1);
    props.handle({ ...props.state, data }, props.name);
    setIndex(null);
  };

  const columns = props.state ? props.state.columns : [];
  const data = props.state ? props.state.data : [];

  // MUIDataTable options translation (simplified for now)
  const selectableRows = props.selectableRows === false ? "none" : props.selectableRows ? props.selectableRows : 'multiple';

  // Custom Toolbar Select
  const customToolbarSelect = (selectedRows, displayData, setSelectedRows) => (
    <CustomToolbarSelect
      selectedRows={selectedRows}
      displayData={displayData}
      setSelectedRows={setSelectedRows}
      handleUpdate={props.handleUpdate ? props.handleUpdate : false}
      handleCreate={props.handleCreate ? props.handleCreate : false}
      handleDelete={props.handleDelete ? props.handleDelete : false}
      create={props.create ? props.create : false}
      update={props.update ? props.update : false}
      delete={props.delete ? props.delete : false}
      multiIndexAction={props.multiIndexAction ? props.multiIndexAction : false}
      setOpenDialog={props.handleDelete ? setOpenDialog : false}
      handleDialogDelete={handleDialogDelete}
    />
  );

  return (
    <>
      <PureLinearProgress loading={loading} />
      {props.title && <Typography variant="h6">{props.title}</Typography>} {/* Display title */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {selectableRows !== "none" && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={rows.length > 0 && rows.length < data.length}
                    checked={data.length > 0 && rows.length === data.length}
                    onChange={(event) => {
                      if (event.target.checked) {
                        const newSelecteds = data.map((n, index) => index);
                        setRows(newSelecteds);
                        return;
                      }
                      setRows([]);
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => (
                <TableCell key={index}>{column.label || column.name}</TableCell>
              ))}
              {props.delete && <TableCell>Actions</TableCell>} {/* Add a header for actions */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => {
              const isItemSelected = rows.indexOf(rowIndex) !== -1;
              return (
                <React.Fragment key={rowIndex}>
                  <TableRow
                    hover
                    onClick={(event) => {
                      if (selectableRows !== "none") {
                        const selectedIndex = rows.indexOf(rowIndex);
                        let newSelected = [];

                        if (selectedIndex === -1) {
                          newSelected = newSelected.concat(rows, rowIndex);
                        } else if (selectedIndex === 0) {
                          newSelected = newSelected.concat(rows.slice(1));
                        } else if (selectedIndex === rows.length - 1) {
                          newSelected = newSelected.concat(rows.slice(0, -1));
                        } else if (selectedIndex > 0) {
                          newSelected = newSelected.concat(
                            rows.slice(0, selectedIndex),
                            rows.slice(selectedIndex + 1),
                          );
                        }
                        setRows(newSelected);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    {selectableRows !== "none" && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>{row[column.name]}</TableCell>
                    ))}
                    {props.delete && (
                      <TableCell>
                        <EasyButton label="Delete" type="slim" color="red" size="small" onClick={() => {
                          setOpenDialog(true);
                          setIndex(rowIndex); // Set the index of the row to be deleted
                        }} />
                      </TableCell>
                    )}
                  </TableRow>
                  {props.expand && (
                    <ExpandableRow
                      rowData={row}
                      rowMeta={{ dataIndex: rowIndex }}
                      component={props.expandComponent}
                      expandCallback={props.expandCallback}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Render custom toolbar if needed */}
      {(props.create || props.update || props.delete) && customToolbarSelect({ data: rows }, data, setRows)}

      <EasyDialog title="Are you sure to delete the record??" description="This will delete the record and cannot be recovered!" isOpen={openDialog} handleDialog={handleDialog} type="confirm" />
    </>
  );
}
