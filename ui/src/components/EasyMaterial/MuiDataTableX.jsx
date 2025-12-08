import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  Collapse,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Expandable Row Component
const ExpandableRow = ({ rowData, expandComponent: Component, expandCallback }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expandCallback && rowData?.id) {
      setLoading(true);
      expandCallback(rowData.id, (result) => {
        setData(result);
        setLoading(false);
      });
    }
  }, [rowData?.id, expandCallback]);

  if (!Component) {
    return <Box sx={{ p: 2 }}>No component provided</Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : data ? (
        <Component data={data} />
      ) : null}
    </Box>
  );
};

// Custom Toolbar Component
const CustomToolbar = ({
  onCreateClick,
  onUpdateClick,
  selectedRows,
  showCreate,
  showUpdate,
  showDelete,
}) => {
  const hasSelection = selectedRows.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, p: 1, alignItems: 'center' }}>
      {showCreate && (
        <Tooltip title="Add new record">
          <IconButton
            size="small"
            onClick={() => onCreateClick(null)}
            sx={{ color: '#1976d2' }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
      {showUpdate && hasSelection && (
        <Tooltip title="Edit selected record">
          <IconButton
            size="small"
            onClick={() => onUpdateClick(selectedRows[0])}
            sx={{ color: '#1976d2' }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
      {showDelete && hasSelection && (
        <Box sx={{ ml: 'auto' }}>
          {/* Delete handled via actions column */}
        </Box>
      )}
      <GridToolbar />
    </Box>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmDialog = ({ open, onConfirm, onCancel }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Are you sure you want to delete this record?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This action will permanently delete the record and cannot be recovered.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function MaterialTableV7({
  title,
  state,
  handle,
  name,
  handleCreate,
  handleUpdate,
  handleDelete,
  expand,
  expandComponent,
  expandCallback,
  selectableRows = 'single',
  create = false,
  update = false,
  delete: showDelete = false,
  multiIndexAction = false,
  rowsExpanded,
  ...props
}) {
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  let timeoutId;

  // Initial loading
  useEffect(() => {
    setLoading(true);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle state updates
  useEffect(() => {
    setLoading(true);
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Handle delete with confirmation
  const handleDeleteClick = (id) => {
    setRowToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (rowToDelete !== null && handleDelete) {
      handleDelete(rowToDelete);
    }
    setOpenDeleteDialog(false);
    setRowToDelete(null);
  };

  // Toggle row expansion
  const toggleRowExpanded = (id) => {
    const newExpanded = new Set(expandedRowIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRowIds(newExpanded);
  };

  // Build action column
  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    type: 'actions',
    width: 150,
    getActions: (params) => {
      //params has all row
      const actions = [];
      console.log(params);
      // extract index before
      const index = rows.findIndex(r => r.id === params.id);
      console.log(index);
      if (update && handleUpdate) {
        actions.push(
          <Tooltip key="edit" title="Edit2">
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleUpdate(index)}
              color="primary"
            />
          </Tooltip>
        );
      }

      if (expand) {
        const isExpanded = expandedRowIds.has(params.id);
        actions.push(
          <Tooltip key="expand" title={isExpanded ? 'Collapse' : 'Expand'}>
            <GridActionsCellItem
              icon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              label={isExpanded ? 'Collapse' : 'Expand'}
              onClick={() => toggleRowExpanded(params.id)}
              color="primary"
            />
          </Tooltip>
        );
      }

      if (showDelete && handleDelete) {
        actions.push(
          <Tooltip key="delete" title="Delete">
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteClick(params.id)}
              color="error"
            />
          </Tooltip>
        );
      }

      return actions;
    },
  };


  const original_columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'firstName',
      headerName: 'First name',
      width: 150,
      editable: true,
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 150,
      editable: true,
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 200,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
  ];
  // Prepare columns
  let columns = state?.columns
    ? state.columns.map((col) => ({
      field: col.name || col.field,
      headerName: col.name || col.headerName || col.label || '',
      // flex: col.flex || 1,
      width: 150,
      sortable: col.sortable !== false,
      filterable: col.filterable !== false,
      editable: false,
      ...col, // Spread other properties
    }))
    : [];

  const original_rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  ];
  // Add actions column if any action is available
  if (update || showDelete || expand) {
    columns.push(actionColumn);
  }

  // Prepare rows with detail panel
  const rows = state?.data || [];
  const detailPanelExpandedRowIds = expand ? Array.from(expandedRowIds) : [];

  return (
    <Box sx={{ width: '100%', height: 'auto' }}>
      {loading && <LinearProgress />}

      <DataGrid
        rows={rows || original_rows}
        columns={columns || original_columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        pagination
        paginationModel={{ pageSize: 10, page: 0 }}
        onPaginationModelChange={(model) => {
          // Handle pagination if needed
        }}
        checkboxSelection={selectableRows !== 'none'}
        disableSelectionOnClick
        selectionModel={selectedRows}
        onRowSelectionModelChange={(newSelection) => {
          console.log("onRowSelectionModelChange")
          console.log(newSelection)
          if (multiIndexAction) {
            setSelectedRows(newSelection);
          } else if (newSelection.length <= 1) {
            setSelectedRows(newSelection);
          }
        }}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #e0e0e0',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: '#f0f7ff !important',
          },
        }}
        slots={{
          toolbar: () => (
            <CustomToolbar
              onCreateClick={handleCreate}
              onUpdateClick={handleUpdate}
              selectedRows={selectedRows}
              showCreate={create}
              showUpdate={update}
              showDelete={showDelete}
            />
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        detailPanels={
          expand && expandComponent
            ? [
              {
                id: 'expand-panel',
                renderDetailPanel: ({ row }) => (
                  <ExpandableRow
                    rowData={row}
                    expandComponent={expandComponent}
                    expandCallback={expandCallback}
                  />
                ),
                match: ({ id }) => expandedRowIds.has(id),
              },
            ]
            : undefined
        }
        {...props}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setOpenDeleteDialog(false);
          setRowToDelete(null);
        }}
      />
    </Box>
  );
}