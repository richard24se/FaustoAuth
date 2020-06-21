import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import MailIcon from "@material-ui/icons/Mail";
import DeleteIcon from "@material-ui/icons/Delete";
import Label from "@material-ui/icons/Label";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import InfoIcon from "@material-ui/icons/Info";
import ForumIcon from "@material-ui/icons/Forum";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import AlarmIcon from "@material-ui/icons/Alarm";
import IconButton from "@material-ui/core/IconButton";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import Button from "@material-ui/core/Button";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LinearProgress from "@material-ui/core/LinearProgress";
import SquareFootIcon from "@material-ui/icons/SquareFoot";
import AssignmentIcon from "@material-ui/icons/Assignment";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Grid from '@material-ui/core/Grid';
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
