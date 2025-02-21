import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/Info";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import Link from "@material-ui/core/Link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC";
import Button from "@material-ui/core/Button";
import { yellow } from "@material-ui/core/colors";
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import { corsProxy, filterKeys } from "./globals";
import { formatLabel } from "./utils";
import "./App.css";

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);


const styles = (theme) => ({
  header: {
    lineHeight: 1.5,
    fontSize: "30px",
    WebkitTextSizeAdjust: "100%",
  },
  roundedBox: {
    position: "relative",
    width: "100%",
    padding: "1em 1.5em",
    margin: "2em auto",
    color: "#000",
    background: "#FFD180",
    overflow: "hidden",
    borderRadius: "10px 10px 10px 10px",
    textAlign: "center",
  },
  body: {
    paddingTop: theme.spacing(1),
  },
  panel: {
    padding: theme.spacing(3),
  },
});

const useMediaStyles = makeStyles({
  root: {
    width: "100%",
    marginLeft: "5%",
    marginRight: "5%",
    // maxWidth: 325,
  },
  media: {
    height: 200,
    borderBottom: "solid 1px",
  },
});

function MediaCard(props) {
  const classes = useMediaStyles();
  return (
    <Grid className={classes.root}>
      <Card
        style={{
          width: "90%",
          backgroundColor: "#DCEDC8",
          borderStyle: "solid",
          borderWidth: 2,
        }}
      >
        <CardActionArea
          onClick={() => {
            props.onClick(props.id);
          }}
        >
          <CardMedia
            className={classes.media}
            image={
              "https://object.cscs.ch/v1/AUTH_c0a333ecf7c045809321ce9d9ecdfdea/VF_paper_demo/featured_models/" +
              props.id +
              ".jpg"
            }
            title={props.title}
          />
          <CardContent style={{ marginLeft: 5, marginRight: 5 }}>
            <div style={{ height: 30 }}>
              <ResponsiveEllipsis
                text={props.title}
                maxLine="1"
                ellipsis="..."
                trimRight
                basedOn="letters"
                style={{
                  fontSize: 16,
                  fontWeight: "bolder",
                  lineHeight: "1.5",
                }}
              />
            </div>
            <div style={{ height: 30 }}>
              <ResponsiveEllipsis
                text={props.citation}
                maxLine="2"
                ellipsis="..."
                trimRight
                basedOn="letters"
                style={{
                  fontSize: 14,
                  fontStyle: "oblique",
                  lineHeight: "1.5",
                }}
              />
            </div>
          </CardContent>
        </CardActionArea>
        <CardActions style={{ marginLeft: 5, marginRight: 5 }}>
          <Button
            size="small"
            color="primary"
            style={{ fontWeight: "bolder" }}
            onClick={() => {
              props.onClick(props.id);
            }}
          >
            View Model
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}

function PlotGraph(props) {
  //   console.log(props.data);
  const Plot = createPlotlyComponent(Plotly);
  var layout = {};

  layout = {
    showlegend: true,
    hovermode: "closest",
    title: "<b>" + formatLabel(props.filter) + "</b>",
    // autosize: true,
    height: 400,
    width: 500,
    margin: { t: 50, b: 50, l: 0 },
  };

  // replace 'null' filter value with 'not specified'
  let data = JSON.parse(
    JSON.stringify(props.data).replace("null", "not specified")
  );

  return (
    <Plot
      data={[
        {
          values: props.data ? Object.values(data) : null,
          labels: props.data ? Object.keys(data) : null,
          type: "pie",
        },
      ]}
      layout={layout}
      config={{
        displaylogo: false,
      }}
      onClick={(data) => {
        console.log(data["points"][0]["label"]);
        if (data["points"][0]["label"] !== "not specified") {
          let modelFilters = {};
          filterKeys.forEach(function (key, index) {
            if (key !== props.filter) {
              modelFilters[key] = [];
            } else {
              modelFilters[key] = [data["points"][0]["label"]];
            }
          });
          props.handleConfig("Only Models", modelFilters);
        }
      }}
    />
  );
}


class Introduction extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      stats: null
    };
  }

  componentDidMount() {
    this.mounted = true;
    const headers = {
      //'origin: ?,
      'x-requested-with': 'XMLHttpRequest',
    };
    fetch(
      corsProxy +
      "https://object.cscs.ch/v1/AUTH_c0a333ecf7c045809321ce9d9ecdfdea/VF_paper_demo/vf_stats/models_stats.json",
      { headers }
    )
      .then((response) => response.json())
      .then((jsonData) => {
        // jsonData is parsed json object received from url
        console.log(jsonData);
        if (this.mounted) {
          this.setState({
            stats: jsonData,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        if (this.mounted) {
          this.setState({
            stats: null,
          });
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>

        <div
          style={{
            paddingLeft: "5%",
            paddingRight: "5%",
            textAlign: "justify",
            fontSize: 16,
            lineHeight: 1.75,
            paddingBottom: "20px",
          }}
        >
          <div className="title-solid-style" style={{ fontSize: 44 }}>EBRAINS Model Catalog</div>
          <div className="title-solid-style" style={{ fontSize: 32, color: "#00A595" }}>A framework for collaborative and reproducible modelling in neuroscience</div>
        </div>
        <div style={{ marginBottom: "40px", }}>
          <div className="rainbow-row">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        {/* <div
          style={{
            paddingLeft: "5%",
            paddingRight: "5%",
            textAlign: "justify",
            fontSize: 16,
            lineHeight: 1.75,
          }}
        >
          abcde
        </div> */}

        <Grid container spacing={3} className={classes.body}>
          <Grid item xs={6} style={{ paddingTop: 0 }}>
            <div
              className="note rounded intro"
              style={{
                marginLeft: "5%",
                marginRight: "0%",
                width: "95%",
                textAlign: "justify",
                fontSize: 16,
                lineHeight: 1.75,
                marginTop: "0px",
                marginBottom: "20px"
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                <PlayCircleFilledIcon
                  style={{ color: yellow[700], verticalAlign: "text-top" }}
                />{" "}
                Getting started
              </Typography>
              <Typography variant="body1" gutterBottom>
                To show a list of models and validation tests, select the
                species, brain region, model scope, etc. by clicking on the
                configure icon{" "}
                <SettingsIcon style={{ verticalAlign: "text-bottom" }} /> at the
                top right. You can specify multiple filters and also select
                multiple values per filter. You also have the option to display
                only models or only tests, as required.
              </Typography>
              <Typography variant="body1" gutterBottom>
                <Link href="/docs/find.html">See documentation</Link>
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6} style={{ paddingTop: 0 }}>
            <div
              className="note rounded intro"
              style={{
                marginLeft: "0%",
                marginRight: "5%",
                width: "95%",
                textAlign: "justify",
                fontSize: 16,
                lineHeight: 1.75,
                marginTop: "0px",
                marginBottom: "20px"
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                <InfoIcon
                  style={{ color: yellow[700], verticalAlign: "text-top" }}
                />{" "}
                About
              </Typography>
              <Typography variant="body1" gutterBottom>
                The EBRAINS Model Catalog contains information about models
                developed and/or used within the EBRAINS research
                infrastructure. It allows you to find information about
                models and results obtained using those
                models, showcasing how those models have been validated
                against experimental findings.
              </Typography>
              <Typography variant="body1" gutterBottom>
                <Link href="/docs">More information</Link>
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Grid>
          <div className="box rounded centered smallbox titleText" style={{ width: "95%" }}>
            <span
              style={{
                fontWeight: "bolder",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Featured Models
            </span>
          </div>
          <Grid
            style={{
              paddingLeft: "3.5%",
              paddingRight: "3.5%",
            }}
          >
            <Slider
              {...{
                autoplay: true,
                autoplaySpeed: 5000,
                slidesToShow: 3,
                slidesToScroll: 1,
                responsive: [
                  {
                    breakpoint: 1200,
                    settings: {
                      slidesToShow: 3,
                      slidesToScroll: 1,
                      infinite: true,
                      dots: true,
                    },
                  },
                  {
                    breakpoint: 900,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                      initialSlide: 2,
                    },
                  },
                  {
                    breakpoint: 600,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    },
                  },
                ],
              }}
            >
              <MediaCard
                id="3772094a-8e2d-4075-8f05-9be62c8d8a5d"
                image_title={"Golding_et_al_2001_dichotomy"}
                title={"Dichotomy of action-potential backpropagation in CA1 pyramidal neuron dendrites (Golding et al 2001)"}
                citation={
                  "Nace L. Golding, William L. Kath, Nelson Spruston, Sára Sáray"
                }
                onClick={this.props.handleSelectFeaturedModel}
              />
              <MediaCard
                id="528ec0e6-2f21-413c-9abd-d131f7150882"
                image_title={"CA1_Bianchi_2012"}
                title={"Mechanisms of the depolarization block in CA1 pyramidal neurons - Bianchi et al., 2012"}
                citation={
                  "Daniela Bianchi, Addolorata Marasco, Alessandro Limongiello, Cristina Marchetti, Hélène Marie, Brunello Tirozzi, Michele Migliore, Sára Sáray"
                }
                onClick={this.props.handleSelectFeaturedModel}
              />
              <MediaCard
                id="09cbcd03-1e39-497a-a34e-090dde3617d8"
                image_title={"Basal ganglia network model"}
                title={"Basal ganglia network model"}
                citation={"Shreyas M Suryanarayana"}
                onClick={this.props.handleSelectFeaturedModel}
              />
              <MediaCard
                id="1ccc23ec-d3a6-43b6-b96f-41e9c4221a15"
                image_title={"SpiNNCer: Neuromorphic cerebellum implementation on SpiNNaker"}
                title={"SpiNNCer: Neuromorphic cerebellum implementation on SpiNNaker"}
                citation={
                  "Petruț Antoniu Bogdan, Beatrice Marcinnò, Claudia Casellato, Stefano Casali, Andrew G. D. Rowley, Michael Hopkins, Francesco Leporati, Egidio D'Angelo, Oliver Rhodes"
                }
                onClick={this.props.handleSelectFeaturedModel}
              />
              <MediaCard
                id="c28c4e1f-0ef3-4ccd-9a81-8e792aa349a4"
                image_title={"Model of two-photon calcium signals"}
                title={"Model of two-photon calcium signals"}
                citation={"Nuria Tort-Colet, Alain Destexhe"}
                onClick={this.props.handleSelectFeaturedModel}
              />
              <MediaCard
                id="03d26f01-9197-4fae-97d7-09b33274b76f"
                image_title={"CA1_int_cNAC_060314AM2_20190328165336"}
                title={"CA1_int_cNAC_060314AM2_20190328165336"}
                citation={"Rosanna Migliore"}
                onClick={this.props.handleSelectFeaturedModel}
              />
            </Slider>
          </Grid>
          <br />
        </Grid>
        {this.state.stats && (
          <Grid>
            <div className="box rounded centered smallbox titleText" style={{ width: "95%" }}>
              <span
                style={{
                  fontWeight: "bolder",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                Distribution of Models
              </span>
            </div>
            <Grid
              container
              spacing={2}
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              {[
                "species",
                "brain_region",
                "cell_type",
                "model_scope",
                "abstraction_level",
              ].map((filter, i) => {
                return (
                  <Grid
                    item
                    key={filter}
                    style={{ paddingTop: 0, paddingBottom: 0 }}
                  >
                    <PlotGraph
                      data={this.state.stats ? this.state.stats[filter] : null}
                      filter={filter}
                      handleConfig={this.props.handleConfig}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        )}
        <br />
        <br />
        <div className="rainbow-row" style={{ paddingLeft: "2.5%", paddingRight: "2.5%" }}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <br />
        <br />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Introduction);
