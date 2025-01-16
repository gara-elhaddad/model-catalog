import { Button, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ListItemText from "@material-ui/core/ListItemText";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import axios from "axios";
import React from "react";
import Theme from "./theme";
import ContextMain from "./ContextMain";
import { copyToClipboard } from "./utils";
import { withSnackbar } from "notistack";
import { corsProxy } from "./globals";

var filesize = require("filesize");

class ResultFile extends React.Component {
    signal = axios.CancelToken.source();
    static contextType = ContextMain;

    constructor(props, context) {
        super(props, context);
        const [authContext] = this.context.auth;

        this.state = {
            auth: authContext,
           
            file_size: this.props.r_file.size,
            // content_type: this.props.r_file.content_type,
            url: this.props.r_file.download_url,
            download_url: this.props.r_file.download_url,
            share_url: this.props.r_file.download_url,
            project_id: this.props.project_id,
            filename: this.props.r_file.download_url
                .split("/")
                .pop()
                .split("#")[0]
                .split("?")[0],
            index: this.props.index + 1,
            loaded: false,
            valid: null,
            fileurl: null,
        };

        this.clickPanel = this.clickPanel.bind(this);
    }

    componentDidMount() {
        // files in Collaboratory v2 storage need a suffix to the URL for direct downloads
        if (this.state.url.includes("drive.ebrains.eu")) {
            if (this.state.url.endsWith("?dl=1")) {
                this.setState({
                    url: this.state.url.slice(0, -5),
                    download_url: this.state.url,
                    
                });
            } else {
                this.setState({ download_url: this.state.url + "?dl=1" });
            }
        
          
        }
        let config2 = {
            headers: {
                Authorization: "Bearer " + this.state.auth.token,
            },
        };
        console.log('my principal bucket storage:')
        console.log(this.props.project_id)
        // check if file urls are valid
        let config = {
            cancelToken: this.signal.token,
        };
        let query_url = "";
        if (this.state.url.includes("drive.ebrains.eu")) {
            config["headers"] = {
                Authorization: "Bearer " + this.state.auth.token,
            };
            const url_parts = this.state.url.match(".*/lib/(.*)/file(/.*)");
            query_url =
                "https://drive.ebrains.eu/api2/repos/" +
                url_parts[1] +
                "/file/detail/?p=" +
                url_parts[2];

            // Obtaining Collab Drive share URL to avoid authentication loop issue when previewing file inside iframe
            let query_share_url = corsProxy + "https://drive.ebrains.eu/api2/repos/" + url_parts[1] + "/file/shared-link/";
            var formdata = new FormData();
            formdata.append("p", url_parts[2]);
            axios
            .put(query_share_url, formdata, config)
            .then((res) => {
                this.setState({
                    share_url: res.headers["location"],
                });
            })
            .catch((err) => {
                console.log("Error creating share link!");
                this.setState({
                    share_url: null,
                });
            });
        } else {
            query_url = this.state.url;
        }
        console.log('this.props.bucket_storage:')
        console.log(this.props.project_id)
        console.log('this.props.id:')
        console.log(this.props.id)
        const url_bucket='https://data-proxy.ebrains.eu/api/v1/buckets/';
        const url_bucket_object= url_bucket+this.props.project_id+'/'+ this.state.filename+'?inline=false&redirect=false';
        //const url_bucket_object= url_bucket+this.props.project_id+'?limit=50';
        axios
        .get(url_bucket_object, config2)
            
        
        .then(response => {
           console.log('file')
           console.log(response.data);
           this.setState({
            fileurl: response.data});
            console.log('statefileurl');
            console.log(this.state.fileurl)

           })
        .catch(error => {
            console.log(error);
            });
        // Since Collaboratory v2 storage and CSCS storage gives CORS related issues,
        // we use an intermediate proxy server to resolve this
        query_url = corsProxy + query_url;

        axios
            .head(query_url, config)
            .then((res) => {
                this.setState({
                    valid: true,
                });
                if (!this.state.file_size) {
                    this.setState({
                        file_size: res.headers["content-length"],
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    valid: false,
                });
                if (!this.state.file_size) {
                    this.setState({
                        file_size: "?",
                    });
                }
            });
    }

    clickPanel(event, expanded) {
        if (!this.state.loaded && expanded) {
            this.setState({ loaded: true });
        }
    }

    render() {
        console.log('my file url:')
        console.log(this.state.fileurl)
        var fsize = isNaN(this.state.file_size)
            ? this.state.file_size
            : filesize(this.state.file_size);
        return (
            <Grid style={{ marginBottom: 10 }}>
                <Accordion
                    style={{ backgroundColor: Theme.bodyBackground }}
                    onChange={this.clickPanel}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        style={{ backgroundColor: Theme.lightBackground }}
                    >
                        <Grid
                            container
                            justifyContent="space-between"
                            align-items="center"
                            fontSize={16}
                            my={0}
                            py={0}
                            fontWeight="fontWeightBold"
                        >
                            <Grid item>
                                <Typography variant="body2">
                                    {this.state.index + ") "}
                                    <strong>{this.state.filename}</strong>
                                    {this.state.file_size && " (" + fsize + ")"}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Link
                                    underline="none"
                                    style={{ cursor: "pointer" }}
                                    href={this.state.download_url}
                                    
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                  

                                    {this.state.valid && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            style={{
                                                backgroundColor:
                                                    Theme.buttonPrimary,
                                            }}
                                        >
                                            Download


                                        </Button>
                                        
                                    )}
                                </Link>
                            </Grid>
                           
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box style={{ width: "100%" }} my={2}>
                            <Typography
                                variant="body2"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    copyToClipboard(
                                        this.state.url,
                                        this.props.enqueueSnackbar,
                                        this.props.closeSnackbar,
                                        "File URL copied"
                                    )
                                }
                            >
                                <strong>File URL: </strong>
                               
                               
                            </Typography>
                            <br />
                            {/* check to avoid loading file if not requested by clicking on the exapansion panel */}
                            {/* If file is accessible (valid = true) */}
                            {this.state.loaded && this.state.valid && (
                                <div>
                                    <iframe
                                        title={"iFrame_" + this.props.index}
                                        id={"iFrame_" + this.props.index}
                                        style={{
                                            width: "100%",
                                            height: "400px",
                                        }}
                                        src={this.state.share_url}
                                    />
                                </div>
                            )}
                            {/* If file is inaccessible (valid = false) */}
                            {this.state.loaded && this.state.valid === false && (
                                
                                <div>
                                    <Typography
                                        variant="body2"
                                        style={{ color: "red" }}
                                    >
                                          {console.log('this.state.fileurl')}
                                            {console.log(this.state.fileurl)}

                                        This file is currently not accessible!
                                        <Grid item>
                                <Link
                                    underline="none"
                                    style={{ cursor: "pointer" }}
                                    href={this.state.fileurl}
                                    
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                  

                                  
                                        <Button
                                            variant="contained"
                                            size="small"
                                            style={{
                                                backgroundColor:
                                                    Theme.buttonPrimary,
                                            }}
                                        >
                                            Download
                                          
                                        </Button>
                                        
                                 
                                </Link>
                            </Grid>
                                    </Typography>
                                </div>
                            )}
                            {/* If file is still being evaluated (valid = null) */}
                            {this.state.loaded && this.state.valid === null && (
                                <div>
                                    <Typography variant="body2">
                                        Loading...
                                    </Typography>
                                </div>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        );
    }
}

class ResultRelatedFiles extends React.Component {
    render() {
        
        if (!this.props.result_files) {
            return (
                <Typography variant="subtitle1">
                    <b>
                        Loading...
                    </b>
                </Typography>
            );
        } else if (this.props.result_files.length === 0) {
            return (
                <Typography variant="subtitle1">
                    <b>
                        No files were generated during the validation process!
                    </b>
                </Typography>
            );
        } else {
            return (
                <Grid container>
                    <Box px={2} pb={0}>
                        <Typography variant="subtitle1">
                            <b>
                                File(s) generated during the validation process:
                            </b>
                        </Typography>
                    </Box>
                    <br />
                    <br />
                    <Grid item xs={12}>
                        {/* <TableContainer component={Paper}>
						<Table>
							<TableBody>
								{this.props.result_files.map((r_file, ind) => (
									<ResultFile r_file={r_file} key={ind} />
								))}
							</TableBody>
						</Table>
					</TableContainer> */}

                        {this.props.result_files.map((r_file, ind) => (
                            <ResultFile
                                r_file={r_file}
                                key={ind}
                                index={ind}
                                id={this.props.id}
                                project_id={this.props.project_id}
                                enqueueSnackbar={this.props.enqueueSnackbar}
                                closeSnackbar={this.props.closeSnackbar}
                            />
                        ))}
                    </Grid>
                </Grid>
            );
        }
    }
}

export default withSnackbar(ResultRelatedFiles);
