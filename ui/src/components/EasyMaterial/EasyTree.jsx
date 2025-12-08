import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import MailIcon from "@mui/icons-material/Mail";
import DeleteIcon from "@mui/icons-material/Delete";
import Label from "@mui/icons-material/Label";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import InfoIcon from "@mui/icons-material/Info";
import ForumIcon from "@mui/icons-material/Forum";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AlarmIcon from "@mui/icons-material/Alarm";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import LinearProgress from "@mui/material/LinearProgress";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Grid from '@mui/material/Grid';
import { useRef, useEffect, memo } from "react";

const useTreeItemStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.text.secondary,
    "&:focus > $content": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: "var(--tree-view-color)"
    }
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular
    }
  },
  group: {
    marginLeft: 0,
    "& $content": {
      paddingLeft: theme.spacing(2)
    }
  },
  expanded: {},
  label: {
    fontWeight: "inherit",
    color: "inherit"
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 0)
  },
  labelIcon: {
    marginRight: theme.spacing(1)
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1
  }
}));

function StyledTreeItem(props) {
  const main = useRef();
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <AssignmentIcon />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
          <SquareFootIcon />
          <Typography variant="caption" color="inherit">
            Metros
          </Typography>
          <IconButton
            className={classes.button}
            aria-label="delete"
            onClick={event => {
              alert("Eliming pez");
              //setActiveItemId(item.id);
              // if you want after click do expand/collapse comment this two line
              event.stopPropagation();
              //event.preventDefault();
            }}
          >
            <DeleteForeverOutlinedIcon />
          </IconButton>
          <IconButton
            className={classes.button}
            onClick={event => {
              //alert("Editing");
              main.current.focus();
              //setActiveItemId(item.id);
              // if you want after click do expand/collapse comment this two line
              event.stopPropagation();
              //event.preventDefault();
            }}
          >
            <EditOutlinedIcon />
          </IconButton>
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        //group: classes.group,
        label: classes.label
      }}
      {...other}
      ref={main}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    flexGrow: 1,
    maxWidth: "100%"
  },
  groupButton: {
    marginBottom: theme.spacing(1),
  }
}));

const CustomTreeItem = (props) => {
  const main = useRef();
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    component: Inner,
    children,
    data,
    inner_key,
    id,
    father,
    ...other
  } = props;

  return (
    <TreeItem
      key={inner_key}
      label={<Inner data={data} inner_ref={main} id={id} father={father} />}
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        //group: classes.group,
        label: classes.label
      }}
      {...other}
      ref={main}
      children={children}
      nodeId={id.toString()}
    />
  );
}

const drawTreeItems = (data, id_item, sub_item, component, father = null) => {
  //const Inner = component
  return data.map(t => {
    let children = undefined;
    if (father)
      t.father = father
    if (t[sub_item] && t[sub_item].length > 0) {
      children = drawTreeItems(t[sub_item], id_item, sub_item, component, t[id_item])
    }
    return (
      <CustomTreeItem key={t[id_item]} inner_key={t[id_item]} data={t} children={children} component={component} id={t[id_item]} father={father} color="#61b12f" bgColor="#e6f4ea" />
    )

  })
}



export const Tree = memo((props) => {
  const { data, id_item, sub_item, tree_component: TreeComponent } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState([]);
  const [expandedAll, setExpandedAll] = React.useState([]);
  const handleChange = (event, nodes) => {
    setExpanded(nodes);
  };
  const prevExpandedAll = []
  const getAllNodeId = (data, id_item, sub_item, handle) => {
    data.map(t => {
      handle(prev => [...prev, t[id_item].toString()])
      //prevExpandedAll.push(t[id_item])
      if (t[sub_item] && t[sub_item].length > 0) {
        getAllNodeId(t[sub_item], id_item, sub_item, handle)
      }

    })
  }
  useEffect(() => {
    setExpanded([])
    setExpandedAll([])
    getAllNodeId(data, id_item, sub_item, setExpandedAll)
  }, [data])

  useEffect(() => {
    console.log("Re-Render EasyTree")
    console.log(props)
  })

  return (
    <>
      {
        data && data.length > 0 &&
        <Grid container spacing={0} direction="row" justify="flex-end">
          <Grid item >
            <ButtonGroup color="primary" aria-label="outlined primary button group" className={classes.groupButton}>
              <Button size="small" onClick={() => {
                setExpanded(expandedAll)
              }}>Abrir todo</Button>
              <Button size="small" onClick={() => {
                setExpanded([]);
              }}>Cerrar todo</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      }


      {/* <LinearProgress
        variant="buffer"
        value={10}
        valueBuffer={11}
        style={{ height: 14 }}
      /> */}

      {/* <Button
        variant="contained"
        onClick={() => {
          console.log(expanded);
        }}
      >
        Mostrar expanded
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          console.log(expandedAll);
          console.log(prevExpandedAll)
          setExpanded(expandedAll)
        }}
      >
        Expandir todo
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          setExpanded([]);
        }}
      >
        Cerrar todo
      </Button> */}
      <TreeView
        className={classes.root}
        defaultExpanded={["3"]}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        expanded={expanded}
        onNodeToggle={handleChange}
      >
        {data && id_item && sub_item && TreeComponent ? drawTreeItems(data, id_item, sub_item, TreeComponent) : "Debes enviar los parámetros data, id_item, sub_item y el componente de tipo TreeItem"}

      </TreeView>
    </>
  );
})
