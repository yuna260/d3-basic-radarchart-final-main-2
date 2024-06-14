import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
const attributes = [
  "Housing",
  "Jobs",
  "Civic_Engagement",
  "Health",
  "Life_Satisfaction",
  "Work_Life_Balance",
  "Safety",
];

const tooltip = d3
  .select("#svg-container")
  .append("div")
  .attr("class", "tooltip");

const legend = ["OECD Average", "Selected Country"];
const radius = [0, 2, 4, 6, 8, 10];
const colorScale = d3.scaleOrdinal().range(["white", "skyblue"]);

const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
const svg2 = d3.select("#svg-container2").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 65, right: 50, bottom: 65, left: 50 };

// group

const g = svg
  .append("g") // group
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
const radiusScale = d3.scaleLinear().domain([0, 10]).range([0, minLen]);

const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

// color
const pointColor = "white";

// line radial
const radarLine = d3
  .lineRadial()
  // .curve(d3.curveLinearClosed)
  .curve(d3.curveCardinalClosed)
  .angle((d, i) => angleScale(i))
  .radius((d) => radiusScale(selectedPlayer[d]));

// svg elements
let players, selectedPlayer;
let selectedName = "Average";
let radiusAxis, angleAxis, axis;
let path, path2, points, labels, legendRects, legendTexts, textbox;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];

d3.json("data/radar_chart_data_complete.json")
  .then((raw_data) => {
    data = raw_data.filter((d) => d.Housing > 1);
    console.log(data);

    players = [...new Set(data.map((d) => d.Country))];
    selectedPlayer = data.filter((d) => d.Country === selectedName)[0];

    // Add dropdown
    const dropdown = document.getElementById("options");

    players.map((d) => {
      const option = document.createElement("option");
      option.value = d;
      option.innerHTML = d;
      option.selected = d === selectedName ? true : false;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function () {
      selectedName = dropdown.value;
      updatePlayer();
    });

    //  line
    radarLine.radius((d) => radiusScale(selectedPlayer[d]));

    //  axis
    radiusAxis = g
      .selectAll("radius-axis")
      .data(radius)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (d) => radiusScale(d))
      .attr("stroke-width", 0.7)
      .attr("fill", "rgba(10,10,10,0.1)") // 0.01
      .attr("stroke", "darkgrey"); // #ccc

    angleAxis = g
      .selectAll("angle-axis")
      .data(attributes)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => getXPos(10, i))
      .attr("y2", (d, i) => getYPos(10, i))
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);

    // path
    path = g
      .append("path")
      .datum(attributes)
      .attr("d", radarLine)
      .attr("fill", "none")
      .attr("stroke", pointColor)
      .attr("stroke-width", 3.3)
      .attr("fill", pointColor)
      .style("fill-opacity", 0.1);

    path2 = g
      .append("path")
      .datum(attributes)
      .attr("d", radarLine)
      .attr("fill", "none")
      .attr("stroke", "skyblue")
      .attr("stroke-width", 1.3)
      .style("stroke-opacity", 0.5);
    // .attr("fill", "grey")
    // .style("fill-opacity", 0.0);

    // points
    points = g
      .selectAll("points")
      .data(attributes)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => getXPos(selectedPlayer[d], i))
      .attr("cy", (d, i) => getYPos(selectedPlayer[d], i))
      .attr("r", 2.3)
      .attr("fill", pointColor)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2.6)
      .on("mousemove", function (event, d, index) {
        tooltip
          .data(data)
          .style("left", event.pageX + 0 + "px")
          .style("top", event.pageY - 52 + "px")
          .style("display", "block")
          .html(`${d} : ${selectedPlayer[d]}`);

        d3.select(this).style("stroke-width", 1).attr("stroke", "#111");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
      });

    // labels
    labels = g
      .selectAll("labels")
      .data(attributes)
      .enter()
      .append("text")
      .attr("x", (d, i) => getXPos(13, i))
      .attr("y", (d, i) => getYPos(12, i) + 5)
      .attr("fill", "#fff")
      .text((d) => d)
      .attr("class", "labels");

    axis = g
      .selectAll("axis")
      .data(radius)
      .enter()
      .append("text")
      .attr("x", (d, i) => getXPos(d, 7))
      .attr("y", (d, i) => getYPos(d, 7) + 10)
      .attr("fill", "white")
      .text((d) => d)
      .attr("class", "label2");

    // player name
    d3.select("#player-name").text(selectedPlayer.Country);
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

// Legend
legendRects = svg
  .selectAll("legend-rects")
  .data(legend)
  .enter()
  .append("rect")
  .attr("x", (d, i) => width - margin.right - 23)
  .attr("y", (d, i) => height - margin.bottom - 50 - 25 * i)
  .attr("width", 17)
  .attr("height", 17)
  .attr("fill", (d) => colorScale(d.legend))
  .attr("fill", (d) => colorScale(d));

legendTexts = svg
  .selectAll("legend-texts")
  .data(legend)
  .enter()
  .append("text")
  .attr("fill", "grey")
  .attr("x", (d, i) => width - margin.right - 23 + 25)
  .attr("y", (d, i) => height - margin.bottom - 50 - 25 * i + 13)
  .text((d) => d)
  .attr("class", "legend-texts");

// textbox = svg
//   .selectAll("textbox")
//   .data(data)
//   .enter()
//   .append("text")
//   .attr("fill", "red")
//   .attr("x", (d, i) => width - margin.right - 30)
//   .attr("y", (d, i) => height - margin.bottom - 50 - 25 * i + 13)
//   .text((d) => d)
//   .attr("class", "legend-texts");

////////////////////////////////////////////////////////////////////
////////////////////////////  Update  //////////////////////////////
const updatePlayer = () => {
  selectedPlayer = data.filter((d) => d.Country === selectedName)[0];

  //  line
  radarLine.radius((d) => radiusScale(selectedPlayer[d]));

  // path
  path.transition().duration(1000).attr("d", radarLine);

  // points
  points
    .transition()
    .duration(1000)
    .attr("cx", (d, i) => getXPos(selectedPlayer[d], i))
    .attr("cy", (d, i) => getYPos(selectedPlayer[d], i));

  // player name
  d3.select("#player-name").text(selectedPlayer.Country);
};

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  g updated
  g.attr("transform", `translate(${width / 2}, ${height / 2})`);

  //  scale updated
  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
  radiusScale.range([0, minLen]);

  //  axis updated
  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXPos(10, i))
    .attr("y2", (d, i) => getYPos(10, i));

  //  line updated
  radarLine.radius((d) => radiusScale(selectedPlayer[d]));

  // path updated
  path.attr("d", radarLine);

  path2.attr("d", radarLine);

  // points updated
  points
    .attr("cx", (d, i) => getXPos(selectedPlayer[d], i))
    .attr("cy", (d, i) => getYPos(selectedPlayer[d], i));

  // labels updated
  labels
    .attr("x", (d, i) => getXPos(14, i))
    .attr("y", (d, i) => getYPos(14, i) + 5);
});

////////////////// functions
const getXPos = (dist, index) => {
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2);
};

const getYPos = (dist, index) => {
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};
