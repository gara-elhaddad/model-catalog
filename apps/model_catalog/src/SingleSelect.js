import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';

import { formatLabel } from "./utils";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 700,
        maxWidth: 900,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function SingleSelect(props) {
    const classes = useStyles();
    const fieldId = "select-" + props.label.replace(" ", "-");
    const fieldLabelId = fieldId + "-label";
    const fieldName = props.name || props.label.toLowerCase().replace(" ", "_");

    return (
        <div>
            <FormControl className={classes.formControl}>
                <Autocomplete
                    labelId={fieldLabelId}
                    id={fieldId}
                    name={fieldName}
                    value={props.value ? props.value : ""}
                    options={props.itemNames}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label={formatLabel(props.label)} />}
                    onChange={props.handleChange}
                />
                <FormHelperText>{props.helperText}</FormHelperText>
            </FormControl>
        </div>

    );
}
