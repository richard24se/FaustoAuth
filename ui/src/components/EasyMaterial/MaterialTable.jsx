import React from 'react';
import MaterialTable from 'material-table';

import { forwardRef } from 'react';
import ArrowUpward from '@material-ui/icons/ArrowUpward';

export default function MaterialTable_({...props}) {
    const tableIcons = {
        SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    }; 

    const [loading, setLoading] = React.useState(false)
    /*
    const updateLoading = flag => {
        setLoading(flag)
        console.log("actualizando");
        //setState({ ...loading, flag });
    }*/
    /*
    React.useEffect( () => {
        updateLoading(true);
        setTimeout(() => {
            updateLoading(false);    
        }, 600);        
    }, []);*/
    
    React.useEffect( () => {
        console.log("se está actualizando el estado... HOOKS!")
        setLoading(true);
        setTimeout(() => {
            setLoading(false);    
        }, 600); 
    }, [props.state]);
    

    

    const [state, setState] = React.useState({
        columns: [
        { title: 'Name', field: 'name' },
        { title: 'Surname', field: 'surname' },
        { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
        {
            title: 'Birth Place',
            field: 'birthCity',
            lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
        },
        ],
        data: [
        { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
        {
            name: 'Zerya Betül',
            surname: 'Baran',
            birthYear: 2017,
            birthCity: 34,
        },
        ],
    });
    React.useEffect( () => {
      console.log("State...")        
    }, [state]);

  return (
    <MaterialTable
      title={props.title}
      columns={props.state ? props.state.columns : []}
      data={props.state ? props.state.data : []}
      options={{
          search: false,
          pageSize: 3,
          pageSizeOptions: [3,5,10,20],
          //padding: 'dense',
          //loadingType: 'linear',
          actionsColumnIndex: -1,
          actionsCellStyle: {
              width: '160px'
          }
      }}
      icons={tableIcons}
      localization={{
        body: {
            editRow:{
                deleteText: 'Estás seguro de eliminar el registro?'
            }
        },
        header: {
            actions: "Acciones"
        },
        pagination:{
            labelRowsSelect: "filas"
        }
      }}
      isLoading={loading}
      editable={{
          /*
        onRowAdd: newData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.push(newData);
              setState({ ...state, data });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data[data.indexOf(oldData)] = newData;
              setState({ ...state, data });
            }, 600);
          }),*/
        onRowDelete: props.delete ? (oldData =>
          new Promise(resolve => {
            setTimeout(() => {
              
              const data = [...props.state.data]
              data.splice(data.indexOf(oldData), 1);
              props.handle({ ...props.state, data }, props.name);
              /*const data = [...state.data];*/
              resolve();
            }, 600);
          })) : false,
      }}
    />
  );
}