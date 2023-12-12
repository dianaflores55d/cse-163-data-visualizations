/*----------------------------------------------------------------------------- 
Diana Flores
CSE 163
Assignment 3: Creating a Bar Graph
File: BarGraphSamplev5.js
Contructs the Bar Graph using D3

Sources:
For understanding transform() and translate(): 
    https://css-tricks.com/transforms-on-svg-elements/
For understanding the difference between ordinal and linear scales:
    https://stackoverflow.com/questions/29785238/d3-difference-between-ordinal-and-linear-scales
-----------------------------------------------------------------------------*/ 

// Defines the space around (margins) and the size (width and height) of our
// SVG element (Bar Graph).
var margin = {top: 10, right: 40, bottom: 150, left: 60},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Creates SVG element (in which to place our visuals) with margin & size
// properties defined earlier. Creates g element within SVG elem; SVG 
// elems within this g element will be grouped together. Translates (shifts)
// the origin of our grouped SVG elements to the right and down (by 
// adding margin.left and margin.top to their coordinates).
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* --------------------------------------------------------------------
Scales are functions that map from a domain (input) to a range (output).
It takes in data input and returns a scaled output value. An axis is a visual
representation of a scale which is in turn the ticks on our Bar Graph
----------------------------------------------------------------------*/ 

// Defines xScale and yScale as scale function generators that take in data
// input values. xScale is a band scale function generator that will take in
// country data values and output a scaled value in the range 0 to width. It 
// also has padding that will give each bar in our Bar Graph some space between
// them. yScale is a linear scale function generator that will take in gdp data
// values and output a scaled value in the range height to 0. 
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);

var yScale = d3.scaleLinear().range([height, 0]);

// Defines xAxis and yAxis as axis function constructors, xAxis corresponding 
// to the bottom of our BarGraph and yAxis corresponding to the left of our
// Bar Graph. xAxis takes in xScale and while yAxis takes yScale defined 
// earlier. yScale defines the tick marks shown on the y-axis with an interval
// of 5 and $ sign.
var xAxis = d3.axisBottom(xScale);

var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat( function(d) { 
    return "$" + d; 
});


/* --------------------------------------------------------------------
To understand how to import data. See D3 API refrence on CSV. Understand
the difference between .csv, .tsv and .json files. To import a .tsv or
.json file use d3.tsv() or d3.json(), respectively.
----------------------------------------------------------------------*/ 

// data.csv contains the country name(key) and its GDP(value)
// d.key and d.value are very important commands
// Since d3 saves our numerical data (gdp) as strings, we use rowConverter() to
// convert that string data into numerical data. This is done with the '+' 
// sign. Additionally, rowConverter() allows us to refer to country data
// with the "key" identifier and gdp data with the "value" identifier. 

function rowConverter(data) {
    return {
        key: data.country,
        value: +data.gdp
    };
}

// csv() loads in data from our CSV file. After data is loaded, it 
// calls rowConverter() and our callback defined function below.
d3.csv("GDP2022TrillionUSDollars.csv",rowConverter).then(function(data) {
    
    // Defines the domain of our scales. 
    // Since xScale is a ordinal (specifically, band) scale, it has a 
    // discrete domain which consists of a set of country names.
    // Since yScale is a linear scale, it has a continuous domain 
    // which consists a set of numbers (countries' gdp).
    xScale.domain(data.map(function(d){ 
        return d.key; 
    }));
    yScale.domain([0,d3.max(data, function(d) {
        return d.value; 
    })]);
    
    // Creates rectangular bars using append("rect") to represent the data. 
    // Uses scales defined earlier to define size for each rectangular bar.
    // Additionally, animates rectangular bars using transition(), duration(),
    // and delay() so they gradually move to their correct positions on the Bar Graph.
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .transition().duration(1000)
        .delay(function(d,i) {
            return i * 200;
        })
        .attr("x", function(d) {
            return xScale(d.key);
        })
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
			 return height- yScale(d.value);
        })
        // create increasing to decreasing shade of blue
        .attr("fill", function(d, i) {
            return "rgb(0, 0, " + Math.round((i * 30) + 120) + ")";
        });
    
    // Creates gdp value labels with white text inside of each bar.
    // Uses scales defined earlier to define size for each label.
    // Additionally, animates labels using transiton(), duration(),
    // and delay() so they gradually move to their correct positions 
    // in the rectangular bars on the Bar Graph.
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .transition().duration(1000)
        .delay(function(d,i) {
            return i * 200;
        })
        .text(function(d) {
            return d.value;
        })
        .attr("x", function(d, i) {
            return xScale(d.key) + 20;
        })
        .attr("y", function(d) {
            return yScale(d.value) + 12;
        })
        .attr("font-family","sans-serif")
        .attr("font-size","13px")
        .attr("font-weight","bold")
        .attr("fill","white")
        .attr("text-anchor","middle");
  
    
    // Draws xAxis by calling xAxis axis function generator.
    // Also, positions the country labels at -60 degrees. 
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".25em")
        .attr("transform", "rotate(-60)" )
        .style("text-anchor", "end")
        .attr("font-size", "10px");
        
    
    // Draws yAxis by calling yAxis axis function generator.
    // Also, positions the label for y-axis at -90 degrees.
    // I added a "y" attribute to move the label to the left 
    // of the y-axis. Without it, it was right on top of the
    // y-axis, blocking the gdp labels there.
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .text("Trillions of US Dollars ($)")
        .attr("transform", "rotate(-90)" )
        .attr("x", -170)
        .attr("y", -45)
        .attr("dy", ".-3em")
        .attr("fill","black")
        .attr("font-family","times")
        .style("text-anchor", "middle")
      
});
