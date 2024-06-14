import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  First SVG  ///////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width1 = parseInt(d3.select("#svg-container").style("width"));
let height1 = parseInt(d3.select("#svg-container").style("height"));

const margin1 = { top: 25, right: 150, bottom: 60, left: 150 };

const formatXAxis1 = d3.format("~s");

// scale
const xScale1 = d3.scaleLinear().range([margin1.left, width1 - margin1.right]);
const yScale1 = d3.scaleLinear().range([height1 - margin1.bottom, margin1.top]);
const radiusScale1 = d3.scaleSqrt().range([0, 20]);
const colorScale1 = d3
  .scaleOrdinal()
  .range(["yellowgreen", "coral", "skyblue", "orange"]);

// axis
const xAxis1 = d3.axisBottom(xScale1).tickFormat((d) => formatXAxis1(d));
const yAxis1 = d3.axisLeft(yScale1).ticks(5);

const tooltip1 = d3
  .select("#svg-container")
  .append("div")
  .attr("class", "tooltip");

let data1 = [];
let circles1;
let region1;
let legendTexts1;
let legendRects1;

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
  data1 = raw_data.map((d) => {
    d.population = parseInt(d.population);
    d.income = parseInt(d.income);
    d.year = parseInt(d.year);
    d.life_expectancy = parseInt(d.happiness);
    return d;
  });

  region1 = [...new Set(data1.map((d) => d.region))];

  xScale1.domain([15000, d3.max(data1, (d) => d.income)]);
  yScale1.domain([20, 100]);
  radiusScale1.domain([0, d3.max(data1, (d) => d.population)]);
  colorScale1.domain(region1);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height1 - margin1.bottom})`)
    .call(xAxis1);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin1.left}, 0)`)
    .call(yAxis1);

  // Legend
  legendRects1 = svg
    .selectAll("legend-rects")
    .data(region1)
    .enter()
    .append("rect")
    .attr("x", (d, i) => width1 - margin1.right - 83)
    .attr("y", (d, i) => height1 - margin1.bottom - 70 - 25 * i)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (d) => colorScale1(d));

  legendTexts1 = svg
    .selectAll("legend-texts")
    .data(region1)
    .enter()
    .append("text")
    .attr("x", (d, i) => width1 - margin1.right - 83 + 20)
    .attr("y", (d, i) => height1 - margin1.bottom - 70 - 25 * i + 10)
    .text((d) => d)
    .attr("class", "legend-texts")
    .attr("fill", "white");

  circles1 = svg
    .selectAll("circles")
    .data(data1)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale1(d.income))
    .attr("cy", (d) => yScale1(d.happiness))
    .attr("r", (d) => radiusScale1(d.population))
    .attr("fill", (d) => colorScale1(d.region))
    .attr("stroke", "#fff")
    .on("mousemove", function (event, d) {
      tooltip1
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 15 + "px")
        .style("display", "block")
        .html(
          `${d.country}<div>-<div>score:${d.life_expectancy}
          <div> population:${d.population}
          <div> income:${d.income}`
        );

      d3.select(this).style("stroke-width", 1).attr("stroke", "#111");
    })
    .on("mouseout", function () {
      tooltip1.style("display", "none");
      d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
    });

  const updateChart1 = (selectedPlayer2) => {
    circles1
      .attr("fill", (d) => {
        if (d.country === selectedPlayer2.Country) {
          return colorScale1(d.region);
        } else {
          return "grey";
        }
      })
      .attr("stroke-width", (d) => {
        if (d.country === selectedPlayer2.Country) {
          return 4;
        } else {
          return 1;
        }
      });
  };

  // Make updateChart1 accessible globally
  window.updateChart1 = updateChart1;

  const resizeFirstSvg = () => {
    width1 = parseInt(d3.select("#svg-container").style("width"));
    height1 = parseInt(d3.select("#svg-container").style("height"));

    svg.attr("width", width1).attr("height", height1);

    xScale1.range([margin1.left, width1 - margin1.right]);
    yScale1.range([height1 - margin1.bottom, margin1.top]);

    svg
      .select(".x-axis")
      .attr("transform", `translate(0,${height1 - margin1.bottom})`)
      .call(xAxis1);
    svg.select(".y-axis").call(yAxis1);

    legendRects1
      .attr("x", (d, i) => width1 - margin1.right - 83)
      .attr("y", (d, i) => height1 - margin1.bottom - 70 - 25 * i);

    legendTexts1
      .attr("x", (d, i) => width1 - margin1.right - 83 + 20)
      .attr("y", (d, i) => height1 - margin1.bottom - 70 - 25 * i + 10);

    circles1
      .attr("cx", (d) => xScale1(d.income))
      .attr("cy", (d) => yScale1(d.happiness))
      .attr("r", (d) => radiusScale1(d.population));
  };

  window.addEventListener("resize", resizeFirstSvg);
});

////////////////////////////////////////////////////////////////////
////////////////////////////  Second SVG  //////////////////////////

const attributes = [
  "Housing",
  "Jobs",
  "Civic Engagement",
  "Health",
  "Life Satisfaction",
  "Life Balance",
  "Safety",
];

const tooltip2 = d3
  .select("#svg-container2")
  .append("div")
  .attr("class", "tooltip");

const legend2 = ["OECD Average", "Selected Country"];
const radius2 = [0, 2, 4, 6, 8, 10];
const colorScale2 = d3.scaleOrdinal().range(["white", "yellow"]);

const svg2 = d3.select("#svg-container2").append("svg").attr("id", "svg2");

let width2 = parseInt(d3.select("#svg-container2").style("width"));
let height2 = parseInt(d3.select("#svg-container2").style("height"));
const margin2 = { top: 65, right: 50, bottom: 120, left: 50 }; // Adjusted bottom margin to make space for text box

const g = svg2
  .append("g")
  .attr("transform", `translate(${width2 / 2}, ${height2 / 2})`);

let minLen2 = d3.min([height2 / 2 - margin2.top, width2 / 2 - margin2.right]);
const radiusScale2 = d3.scaleLinear().domain([0, 11]).range([0, minLen2]);

const angleScale2 = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

const pointColor2 = "white";

let selectedPlayer2 = "Average";

const radarLine2 = d3
  .lineRadial()
  .curve(d3.curveCardinalClosed)
  .angle((d, i) => angleScale2(i))
  .radius((d) => radiusScale2(selectedPlayer2[d]));

let data2 = [];
let radiusAxis2,
  angleAxis2,
  path,
  path2,
  points2,
  labels2,
  legendRects2,
  legendTexts2;

d3.json("data/radar_chart_data_complete.json")
  .then((raw_data) => {
    data2 = raw_data.filter((d) => d.Housing > 1);

    const players2 = [...new Set(data2.map((d) => d.Country))];
    selectedPlayer2 = data2.filter((d) => d.Country === "Average")[0];

    const dropdown = document.getElementById("options");

    players2.map((d) => {
      const option = document.createElement("option");
      option.value = d;
      option.innerHTML = d;
      option.selected = d === "Average" ? true : false;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function () {
      selectedPlayer2 = data2.filter((d) => d.Country === dropdown.value)[0];
      updatePlayer2();
      updateTextBox(selectedPlayer2);
    });

    radarLine2.radius((d) => radiusScale2(selectedPlayer2[d]));

    radiusAxis2 = g
      .selectAll("radius-axis")
      .data(radius2)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (d) => radiusScale2(d))
      .attr("stroke-width", 0.7)
      .attr("fill", "rgba(10,10,10,0.1)")
      .attr("stroke", "darkgrey");

    angleAxis2 = g
      .selectAll("angle-axis")
      .data(attributes)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => getXPos2(10, i))
      .attr("y2", (d, i) => getYPos2(10, i))
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);

    path = g
      .append("path")
      .datum(attributes)
      .attr("d", radarLine2)
      .attr("fill", "none")
      .attr("stroke", pointColor2)
      .attr("stroke-width", 3.3)
      .attr("fill", pointColor2)
      .style("fill-opacity", 0.1);

    path2 = g
      .append("path")
      .datum(attributes)
      .attr("d", radarLine2)
      .attr("fill", "none")
      .attr("stroke", "yellow")
      .attr("stroke-width", 1.3)
      .style("stroke-opacity", 0.5);

    points2 = g
      .selectAll("points")
      .data(attributes)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => getXPos2(selectedPlayer2[d], i))
      .attr("cy", (d, i) => getYPos2(selectedPlayer2[d], i))
      .attr("r", 2.3)
      .attr("fill", pointColor2)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2.6)
      .on("mousemove", function (event, d) {
        tooltip2
          .data(data2)
          .style("left", event.pageX + 0 + "px")
          .style("top", event.pageY - 52 + "px")
          .style("display", "block")
          .html(`${d} : ${selectedPlayer2[d]}`);

        d3.select(this).style("stroke-width", 1).attr("stroke", "#111");
      })
      .on("mouseout", function () {
        tooltip2.style("display", "none");
        d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
      });

    labels2 = g
      .selectAll("labels")
      .data(attributes)
      .enter()
      .append("text")
      .attr("x", (d, i) => getXPos2(12, i))
      .attr("y", (d, i) => getYPos2(12, i) + 5)
      .attr("fill", "#fff")
      .text((d) => d)
      .attr("class", "labels");

    svg2
      .append("g")
      .attr("id", "explanation-group")
      .attr(
        "transform",
        `translate(${margin2.left}, ${height2 - margin2.bottom + 80})`
      );

    svg2
      .select("#explanation-group")
      .append("text")
      .attr("id", "explanation-text")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("");

    d3.select("#player-name").text(selectedPlayer2.Country);
    updateTextBox(selectedPlayer2);
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

legendRects2 = svg2
  .selectAll("legend-rects2")
  .data(legend2)
  .enter()
  .append("rect")
  .attr("x", (d, i) => width2 - margin2.right - 23)
  .attr("y", (d, i) => height2 - margin2.bottom - 20 - 30 * i)
  .attr("width", 17)
  .attr("height", 17)
  .attr("fill", (d) => colorScale2(d.legend))
  .attr("fill", (d) => colorScale2(d));

legendTexts2 = svg2
  .selectAll("legend-texts")
  .data(legend2)
  .enter()
  .append("text")
  .attr("fill", "grey")
  .attr("x", (d, i) => width2 - margin2.right - 23 + 25)
  .attr("y", (d, i) => height2 - margin2.bottom - 20 - 30 * i + 13)
  .text((d) => d)
  .attr("class", "legend-texts");

const updatePlayer2 = () => {
  radarLine2.radius((d) => radiusScale2(selectedPlayer2[d]));

  path.transition().duration(1000).attr("d", radarLine2);

  points2
    .transition()
    .duration(1000)
    .attr("cx", (d, i) => getXPos2(selectedPlayer2[d], i))
    .attr("cy", (d, i) => getYPos2(selectedPlayer2[d], i));

  d3.select("#player-name").text(selectedPlayer2.Country);
  updateTextBox(selectedPlayer2);

  window.updateChart1(selectedPlayer2);
};

const resizeSecondSvg = () => {
  width2 = parseInt(d3.select("#svg-container2").style("width"));
  height2 = parseInt(d3.select("#svg-container2").style("height"));

  svg2.attr("width", width2).attr("height", height2);

  minLen2 = d3.min([height2 / 2 - margin2.top, width2 / 2 - margin2.right]);
  radiusScale2.range([0, minLen2]);

  g.attr("transform", `translate(${width2 / 2}, ${height2 / 2})`);

  radiusAxis2.attr("r", (d) => radiusScale2(d));
  angleAxis2
    .attr("x2", (d, i) => getXPos2(10, i))
    .attr("y2", (d, i) => getYPos2(10, i));

  radarLine2.radius((d) => radiusScale2(selectedPlayer2[d]));

  path.attr("d", radarLine2);
  path2.attr("d", radarLine2);

  points2
    .attr("cx", (d, i) => getXPos2(selectedPlayer2[d], i))
    .attr("cy", (d, i) => getYPos2(selectedPlayer2[d], i));

  labels2
    .attr("x", (d, i) => getXPos2(14, i))
    .attr("y", (d, i) => getYPos2(14, i) + 5);

  // Adjust the explanation text position
  svg2
    .select("#explanation-group")
    .attr(
      "transform",
      `translate(${margin2.left}, ${height2 - margin2.bottom + 80})`
    );
};

window.addEventListener("resize", resizeSecondSvg);

const getXPos2 = (dist, index) => {
  return radiusScale2(dist) * Math.cos(angleScale2(index) - Math.PI / 2);
};

const getYPos2 = (dist, index) => {
  return radiusScale2(dist) * Math.sin(angleScale2(index) - Math.PI / 2);
};

const updateTextBox = (selectedPlayer) => {
  const explanationText = selectedPlayer.explanation;
  const textElement = d3.select("#explanation-text");

  // Clear previous wrapped text
  textElement.selectAll("tspan").remove();

  // Split the text into words
  const words = explanationText.split(" ");
  let line = [];
  let lineNumber = 0;
  const lineHeight = 1.1; // ems
  const x = 0;
  const y = 0;
  let tspan = textElement
    .append("tspan")
    .attr("x", x)
    .attr("dy", `${lineHeight}em`);

  words.forEach((word) => {
    line.push(word);
    tspan.text(line.join(" "));
    if (
      tspan.node().getComputedTextLength() >
      width2 - margin2.left - margin2.right
    ) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      tspan = textElement
        .append("tspan")
        .attr("x", x)
        .attr("dy", `${lineHeight}em`)
        .text(word);
    }
  });
};
