import React, { useState, useEffect, Component } from 'react';

//import { forwardRef } from 'react';

import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';

import MUIDataTable from "mui-datatables";


import {
  EasyButton,
  EasyDialog
} from "../../components/EasyMaterial/EasyMaterialComponents"



//ExpandableRow
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Collapse from "@material-ui/core/Collapse";

//Icons
import BrushIcon from '@material-ui/icons/Brush';
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

//Tooltip
import Tooltip from "@material-ui/core/Tooltip";

//Styles
import { withStyles } from "@material-ui/core/styles";

const ExpandableRow = props => {
  //Convierte componente variable a Mayúscula
  const { component: Component } = props
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(false);
  const { rowData, rowMeta, expandCallback } = props;
  const colSpan = rowData.length + 1;
  //Ciclo de vida DidMount versión Hooks
  useEffect(() => {
    setExpanded(!expanded);
    // console.log(rowData)
    // console.log(rowMeta)
    // console.log(Component)
    // return () => {
    //   setExpanded(!expanded);
    //   console.log("Dimounting...");
    // };
    //Si encuentra la función callback la invoca enviando 2 parámetros
    if (expandCallback) {
      const { dataIndex } = rowMeta //Se extrae el dataIndex del rowMeta
      expandCallback(dataIndex, setData)
    }
    else
      console.error("No ha recibido función callback")
    console.log("/*Debe recibir 2 parámetros: rowData y setData*/")
  }, []);


  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {/*with clone cloneElement(component, { data: {testing: "testing", row: rowData} })*/}
          {/*Si todavía no hay data muestra el circular progress, si no hay componente, mostrará un mensaje con toda la data de la fila*/}
          {Component ? data ? <Component data={data} /> : <CircularProgress /> : "No ha recibido componente, pero se tienen estos datos: " + rowData}
        </Collapse>
      </TableCell>
    </TableRow>
  );
};


//Custom Toolbar
const defaultToolbarSelectStyles = {
  iconButton: {
    marginRight: "24px",
    top: "50%",
    display: "inline-block",
    position: "relative"
    //transform: "translateY(-50%)"
  },
  customIcon: {
    color: "#000"
  }
};

class CustomToolbarSelect_ extends React.Component {


  handleUpdate = () => {
    console.error("No hay función update del toolbar de MuiDatatable!")
    console.log("click! current selected rows", this.props.selectedRows);
    //console.log("click! current selected rows", this.props.displayData);
    this.props.setSelectedRows([])
  };
  handleCreate = () => {
    console.error("No hay función create del toolbar de MuiDatatable!")
    console.log("click! current selected rows", this.props.selectedRows);
  };
  handleDelete = () => {
    console.error("No hay función delete del toolbar de MuiDatatable!")
    console.log("click! current selected rows", this.props.selectedRows);
  };

  render() {
    const { classes } = this.props;
    const { selectedRows: { data } } = this.props
    var dataIndex = null;
    if (this.props.multiIndexAction) {
      dataIndex = data.map(element => element.dataIndex)
    }
    else {
      dataIndex = data.length === 1 ? data[0].dataIndex : false
      //console.log("El arreglo de selección de filas es mayor a 1")
    }
    return (
      <div className={"custom-toolbar-select"}>
        {this.props.create &&
          <Tooltip title={"Add"}>
            <IconButton className={classes.iconButton} onClick={this.props.handleCreate ? () => this.props.handleCreate(dataIndex) : this.handleCreate}>
              <AddIcon className={classes.customIcon} />
            </IconButton>
          </Tooltip>
        }
        {this.props.update &&
          <Tooltip title={"Edit"}>
            <IconButton className={classes.iconButton} onClick={this.props.handleUpdate ? () => this.props.handleUpdate(dataIndex) : this.handleUpdate}>
              <BrushIcon className={classes.customIcon} />
            </IconButton>
          </Tooltip>
        }
        {this.props.delete &&
          <Tooltip title={"Delete"}>
            <IconButton className={classes.iconButton} onClick={this.props.handleDelete ? () => {
              this.props.setOpenDialog(true)//Abre el dialog
              this.props.handleDialogDelete(dataIndex)//Envia el dataIndex afuera para que lo trate el dialog
            } : this.handleDelete}>
              <DeleteForeverIcon className={classes.customIcon} />
            </IconButton>
          </Tooltip>
        }
      </div>
    );
  }
}

const CustomToolbarSelect = withStyles(defaultToolbarSelectStyles, {
  name: "CustomToolbarSelect"
})(CustomToolbarSelect_);

//Linear progress
class PureLinearProgress extends Component {

  shouldComponentUpdate(nextProps, nextState) {

    // console.log("#----------->Actual Props<------------#")
    // console.log(this.props)
    // console.log("#----------->Next Props<------------#")
    // console.log(nextProps)
    // console.log("#----------------END----------------#")
    const msg = (this.props.loading !== nextProps.loading) ? "Render Linear Progress!" : "No Render Linear Progress"
    console.log(msg);
    return this.props.loading !== nextProps.loading;
  }


  render() {
    return (
      this.props.loading ? <LinearProgress /> : null
    )
  }
}


export default function MaterialTable_({ ...props }) {
  const abortController = new AbortController();

  const [loading, setLoading] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [arrowDelete, setArrowDelete] = useState(false)

  const [index, setIndex] = useState(null)

  const [rows, setRows] = useState([]) //rows handle

  var timeout;

  useEffect(() => {
    //setLoading(props.loading ? true: false);
    setLoading(true);
    return () => {
      clearTimeout(timeout)
      abortController.abort()
    }
  }, []);

  useEffect(() => {
    setRows([])//rows handle
    console.log("Updating rows data...")
  }, [props.state.data]);

  useEffect(() => {
    console.log("se está actualizando el estado... HOOKS!")
    /*NEW */
    // setLoading(true);
    // setTimeout(() => {
    //     setLoading(false);
    // }, 800);

    // if(loading){
    //   setTimeout(() => {
    //       setLoading(false);
    //   }, 800);
    // }
    /*NEW */
    setLoading(true);
    timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [props.state]);

  //const [state, setState] = useState({});

  var options = {
    selectableRows: props.selectableRows === false ? "none" : props.selectableRows ? props.selectableRows : 'multiple',
    filter: true,
    filterType: 'dropdown',
    responsive: 'stacked',
    rowsSelected: rows, //se obtiene desde un estado hooks //rows handle
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => {
      console.log(rowsSelected)
      setRows(rowsSelected)
    },//rows handle
    //page: 2,
    onColumnSortChange: (changedColumn, direction) => console.log('changedColumn: ', changedColumn, 'direction: ', direction),
    onChangeRowsPerPage: numberOfRows => console.log('numberOfRows: ', numberOfRows),
    onChangePage: currentPage => console.log('currentPage: ', currentPage),
    // textLabels: {
    //   body: {
    //     noMatch: "Lo siento, no hay registros!",
    //   },
    //   filter: {
    //     all: "Todos los registros",
    //     title: "Filtros disponibles",
    //     reset: "Resetear filtros",
    //   },
    //   pagination: {
    //     next: "Siguiente página",
    //     previous: "Previa página",
    //     rowsPerPage: "Filas por página:",
    //     displayRows: "de",
    //   },
    //   toolbar: {
    //     search: "Buscar",
    //     downloadCsv: "Download CSV",
    //     print: "Imprimir",
    //     viewColumns: "Ver columnas",
    //     filterTable: "Filtrar tablas",
    //   },
    //   viewColumns: {
    //     title: "Ver columnas",
    //     titleAria: "Show/Hide Table Columns",
    //   },
    //   selectedRows: {
    //     text: "fila(s) seleccionada(s)",
    //     delete: "Delete",
    //     deleteAria: "Delete Selected Rows",
    //   },

    // }
  };


  //Verify if has expandable options
  if (props.expand) {
    options = {
      ...options,

      expandableRows: true,
      expandableRowsOnClick: true,
      isRowExpandable: (dataIndex, expandedRows) => {
        // Prevent expand/collapse of any row if there are 4 rows expanded already (but allow those already expanded to be collapsed)
        if (
          expandedRows.data.length > 4 &&
          expandedRows.data.filter(d => d.dataIndex === dataIndex).length === 0
        )
          return false;
        return true;
      },
      rowsExpanded: props.rowsExpanded,
      renderExpandableRow: (rowData, rowMeta) => {
        return <ExpandableRow rowData={rowData} rowMeta={rowMeta} component={props.expandComponent} expandCallback={props.expandCallback} />;
      },
      onRowsExpand: (curExpanded, allExpanded) => {
        //this.setState({ open: true });
        // console.log(curExpanded);
        //console.log(props.state.data[curExpanded[0].dataIndex])
        // if(props.expandCallback)
        //   props.expandCallback()
      }
    }
  }
  //HANDLE DELETE WITH DIALOG
  const handleDialog = (value) => {
    setOpenDialog(false);

    if (value) {
      console.log("Se realiza delete!");
      console.log(arrowDelete)
      props.handleDelete(arrowDelete)
    } else {
      console.log("No se realiza delete...");
    }
  };

  const handleDialogDelete = (arrow) => {
    //Index o dato que llamado del delete del toolbar
    console.log(arrow)
    setArrowDelete(arrow)
  }
  //HANDLE DELETE WITH DIALOG

  //Verify if has custom toolbar for create or update
  if (props.create || props.update || props.delete) {
    options = {
      ...options,
      customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
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

          //Handledialog for delete
          setOpenDialog={props.handleDelete ? setOpenDialog : false}
          handleDialogDelete={props.handleDelete ? handleDialogDelete : false}
        />
      )
    }
  }



  const handleDelete = () => {
    //let state = {...props.state}
    let data = [...props.state.data]
    data.splice(index, 1)
    props.handle({ ...props.state, data }, props.name);
    setIndex(null);
  };

  const pre_columns = [
    {
      name: "Delete",
      options: {
        filter: true,
        sort: false,
        empty: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            /*
          <EasyButton label="Eliminar" type="slim" color="redB" size="small" onClick={() => {
            const { colaboradores } = this.state;
            //data.shift();
            console.log(colaboradores.data);
            console.log(tableMeta)
            //index
            const index = tableMeta.rowIndex;
            console.log("Index: "+index)
            var data = [...this.state.colaboradores.data];
            data.splice(index,1)
            this.setState({
              colaboradores:{...this.state.colaboradores, data: data}
            });
            //this.setState({ data });
          }}/>*/
            <>
              <EasyButton label="Delete" type="slim" color="red" size="small" onClick={() => {
                setOpenDialog(true);

                console.log(tableMeta)
                //index
                const index = tableMeta.rowIndex;
                console.log("Index: " + index)
                setIndex(index);
                //let state = Object.assign({}, props.state);
                //let state = {...props.state}
                //state.data.splice(index,1)

                //setState({[props.state]: "data"});
                //setState({data});
                /*
                props.handle(state, props.name);*/
              }} />

            </>
          );
        }
      }
    },
    /*
          {
    name: "Edit",
    options: {
      filter: true,
      sort: false,
      empty: true,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <button onClick={() => window.alert(`Clicked "Edit" for row ${tableMeta.rowIndex}`)}>
            Edit
          </button>
        );
      }
    }
  },
  {
    name: "Add",
    options: {
      filter: true,
      sort: false,
      empty: true,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <button onClick={() => {
            const { data } = this.state;
            //data.unshift(["Mason Ray", "Computer Scientist", "San Francisco", 39, "$142,000"]);
            data.push(["Mason Ray", "Computer Scientist", "San Francisco", 39, "$142,000"])
            this.setState({ data });
          }}>
            Add
          </button>
        );
      }
    }
  },
    */
  ]
  var columns = props.state ? props.state.columns : []
  // if (props.delete){
  //     columns = columns.concat(pre_columns)
  // }


  return (
    <>
      <PureLinearProgress loading={loading} />
      <MUIDataTable
        title={props.title}
        data={props.state ? props.state.data : []}
        columns={columns}
        options={options} />

      <EasyDialog title="Are you sure to delete the record??" description="This will delete the record and cannot be recovered!" isOpen={openDialog} handleDialog={handleDialog} type="confirm" />
    </>
  );
}