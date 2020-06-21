import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import SaveIcon from "@material-ui/icons/Save";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import SearchIcon from '@material-ui/icons/Search';
import Typography from "@material-ui/core/Typography";

//STYLE
import { withStyles } from "@material-ui/styles";
import style from "./style";

//EASY_MATERIAL
import Widget from "../../components/Widget/Widget";
import {
    EasyTextField,
    EasyButton,
    EasyAutoSelect,
    EasyMuiDataTable,
    EasyDialog,
    EasyPicker
} from "../../components/EasyMaterial/EasyMaterialComponents";

//FOTCH
import {
    Fotch,
    capitalize,
    getJSONExcel,
    // validateStringSize,
} from "../../fausto";

//COMPONENTS
import PageTitle from "../../components/PageTitle/PageTitle";

//EXCEL
import XLSX from 'xlsx';
import moment from "moment";
//Redux
import { connect } from 'react-redux';
import { fotchActions } from '../../redux/actions'

const fotchSPPC = new Fotch(process.env.REACT_APP_API_SOLE)


class audit_ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "AUDIT"
        };

    }

    handleOverride = (value, name) => {
        console.log("Value handleOverride", value);
        console.log("handleOverride of " + name + ": " + value);
        if (value !== null) {
            this.setState({ [name]: value });
        } else {
            value = "";
            this.setState({ [name]: value });
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <>
                <PageTitle title={this.state.title} />
                <div>
                    <Widget disableWidgetMenu overflow="unset">
                        <br />
                        <Grid container spacing={5}>


                        </Grid>
                        <br />
                    </Widget>
                    <br />

                </div>
            </>
        );
    }
}

const audit = withStyles(style)(audit_);
const connectedComponent = connect()(audit)
export { connectedComponent as audit };
