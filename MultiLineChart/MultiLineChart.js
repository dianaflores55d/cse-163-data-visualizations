/*----------------------------------------------------------------------------- 
Diana Flores
CSE 163
Assignment 4: Creating an Animated Multi-Line Chart
File: MultiLineChart.html
Contructs the Animated Multi-Line Chart using D3 

Definitions for My Undertanding of Material:
1) interpolation - calculating a function's value based on the value of other
datapoints in a given sequence (i.e. scales interpolates data on our 
visualization, D3 is able to interpolate values based on the value of other
datapoints)

Sources:
For understanding transform() and translate(): 
    https://css-tricks.com/transforms-on-svg-elements/
Removing black areas under each path/ line:
    https://stackoverflow.com/questions/42756085/why-my-d3-line-graphs-shows-black-areas-for-each-entity
-----------------------------------------------------------------------------*/ 

/* Defines the space around (margins) and the size (width and height) of our
SVG element (Bar Graph). */
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


/* Creates SVG element (in which to place our visuals) with margin & size
 properties defined earlier. Creates g element within SVG elem; SVG 
 elems within this g element will be grouped together. Translates (shifts)
 the origin of our grouped SVG elements to the right and down (by 
 adding margin.left and margin.top to their coordinates). */
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* Scales are functions that map from a domain (input) to a range (output).
It takes in data input and returns a scaled output value. 

Defines xScale, yScale, and zScale as scale function generators that take
in data input values. 

xScale is a time scale (variation of linear scale w/ temporal, i.e. date/ time,
domain) function generator that will take in Year data values and map those
values to a scaled value in the range 0 to width. 
range() - returns an array containing an arithmetic progression
        - often used to iterate over a sequence of uniformly-spaced numeric 
           vals, such as the indices of an array or the ticks of a linear scale

yScale is a linear scale (has a continuous domain, i.e. set of real #s or dates)
function generator that will take in EPC data values and will map those values
to a scaled range height to 0.

zScale is an ordinal scale (has a discrete domain, i.e. set of names or
categories) function generator that will take in country names and map those
values to a color in schemeCategory10 (an array of ten categorical colors
represented as RGB hex strings. 
scaleOrdinal() - accepts range argument
               - if range isn't specified, it defaults to an empty array 
                  (this happens since D3 doesn't know how you want to map
                  your continuous values)*/
var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);
var zScale = d3.scaleOrdinal(d3.schemeCategory10);


/* Defines line generator function: line()
line() - generates a line for the given array of data (passed as an arg)
       - lines are a sequence of [x,y] points
curve() - sets the curve shape for a line connecting an array of points
        - if no curve arg is specified, it returns the default curveLinear
curveBasis() - type of curve
           - produces a cubic basis spline using the specified array of points
x(), y() - x & y accessors tell line() where to place each point on the line
x() - passes scaled value of d.year
y() -  passes scaled value of d.epc */
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { 
        return xScale(d.year); 
    })
    .y(function(d) { 
        return yScale(d.epc); 
    });


/* Axisis are visual representation of a scale which is in turn the ticks on
our Bar Graph.

Defines xAxis and yAxis as axis function constructors.

axisBottom(scale) - constructs a new bottom-oriented axis generator for the 
    given scale, w/ empty tick arguments, a tick size of 6, & padding of 3. */
var xAxis = d3.axisBottom(xScale);

/* axisLeft(scale) - constructs a new left-oriented axis generator for the 
    given scale, w/ empty tick arguments, a tick size of 6, & padding of 3. 
continuousScale.ticks([count]) - returns approximately count representative 
    values from the scale's domain
    - if count isn't specified, it defaults to 10
continuousScale.tickFormat([count[, specifier]]) - returns a # format
    function suitable for displaying a tick value*/
var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat( function(d) { 
    return d; 
});


/* Defines gridXAxis & gridYAxis as axis function generators that will be used
to create X & Y gridlines. They use the same definition as xAxis & yAxis except
their tick lines' lengths are increased to the length of the width & height of
our multi-line graph (width for yAxis & height for xAxis). */ 
function gridXAxis() {
    return d3.axisBottom(xScale)
}

function gridYAxis() {
    return d3.axisLeft(yScale)
        .ticks(5)
}


/* parseTime() function for rowConverter()
formats Year data into desired year format */ 
var parseTime = d3.timeParse("%Y");


/* Defines rowConverter function
i - the index starting at 0 from the 1st row
columns - property that stores all column names detected in CSV file
rowConverter() - parses Year data into proper date format
               - parses epc data into float type*/
function rowConverter(d, i, columns) {
    d.year = parseTime(d.Year);
    for(i = 1; i < columns.length; ++i) {
        d[columns[i]] = +d[columns[i]];
    }
    return d;
}


/* calls csv() and defines callback function
csv(url, row, callback)
csv() - loads in data from url (file name of our CSVfile) & passes on data to
        row & callback
      - after loading in data, calls row() which is defined above
      - then, calls callback() which is defined below
row() - if specified, it is passed on an array representing the current row (d),
        the index (i) starting at zero from the 1st row, & the array of column
        names (columns)
callback() - anonymous callback function defined below & called after row() */
d3.csv("BRICSdata.csv", rowConverter, function(d) {
    
    
    /* Defines countries' epc data over the years as a collection of years & epc 
    slice() - Javascript method for arrays
    slice(1) - returns copy of array with 1st elem removed 
    Map object - collection of key-value pairs
               - keys are strings
    map([object[,key]]) - constructs a new map
          - if object is specified, copies all enumerable properties from obj
          into this map
          - object may be an array or another map
          - optional key function may be specified to compute the key for each
          value in the array (i.e. function(id) */
    var countries = d.columns.slice(1).map(function(i) {
        return {
            i: i,
            values: d.map(function(d) {
                return {year: d.year, epc: d[i]};
            })
        };
    });

    
    /* Defines the domain of our scales.
    Calls domain() on the scale function generators defined earlier. Passes on
    data to domain() so that data is bound with ranges specified in scales 
    earlier.
    
    xScale is a time scale (variation of linear scale w/ temporal, i.e. date/ 
    time, domain) function generator that will take in Year data values and map those values to a scaled value in the range 0 to width. 
    time.domain([domain]) -  see continuous.domain([domain])
    continuous.domain([domain]) - if domain is specified, sets the scale's
        domain to the specified array of #s
    extent(array[, accessor]) - returns the min & max value in the given array
        - an optional accessor function may be specified, which is equivalent
        to calling array.map(accessor) before computing the extent 

    yScale is a linear scale (has a continuous domain, i.e. set of real #s or 
    dates) function generator that will take in EPC data values and will map 
    those values to a scaled range height to 0. 
    continuous.domain([domain]) - see above explanation
    min(array[, accessor]) - returns min value in the given array
        - an optional accessor function may be specified, which is equivalent 
        to calling array.map(accessor) before computing min value
    max(array[, accessor]) - returns max value in the given array
        - an optional accessor function may be specified, which is equivalent 
        to calling array.map(accessor) before computing max value
    
    zScale is an ordinal scale (has a discrete domain, i.e. set of names or
    categories) function generator that will take in country names and map
    those values to a color in schemeCategory10 (an array of ten categorical 
    colors represented as RGB hex strings.
    ordinal.domain([domain]) - if domain is specified, sets the domain to the
        specified array of values. The 1st elem in domain is mapped to the 1st
        elem in the range, the 2nd domain val to the 2nd range val, & so on.
        Domain vals are storie internally in a map from stringified val to 
        index; the resulting index is then used to retrieve a val from the 
        range. If range is not specified using range(), we use the current
        range (which is schemeCategory10). */
    xScale.domain(d3.extent(d, function(d) { 
        return d.year; 
    }));
    
    yScale.domain([
        d3.min(countries, function(c) {
            return d3.min(c.values, function(d) {
                return d.epc;
            });
        }),
        d3.max(countries, function(c) {
            return d3.max(c.values, function(d) {
                return d.epc;
            });
        })
    ]);
    
    zScale.domain(countries.map(function(c) {
        return c.i;
    }));
    

    /* Draws xAxis by calling xAxis axis function generator.*/
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    
    /* Adds text label for x-axis. 
    Have to append text seperately from xAxis (something about x-axis makes it 
        so we can't directly append text to) */
    svg.append("text")
        .text("Year")
        .attr("transform", "translate(" + (width + 60) + " ," + (height + 15) + ")")
        .attr("fill", "black")
        .attr("font-family", "times")
        .style("text-anchor", "end");
    
    
    /* Adds X gridlines 
    tickSize(size) - size of each gridline is set to height
    tickFormat("") - no text is placed next to each gridline */
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(gridXAxis()
            .tickSize(-height)
            .tickFormat("")
        )
      
    
    /* Draws yAxis by calling yAxis axis function generator & adds text label 
        for the y-axis. */
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .text("Million BTUs Per Person")
        .attr("transform", "rotate(-90)" )
        .attr("x", -235)
        .attr("y", -37)
        .attr("fill","black")
        .attr("font-family","times")
        .style("text-anchor", "middle");
    
    
    /* Adds Y gridlines 
    tickSize(size) - size of each gridline is set to width
    tickFormat("") - no text is placed next to each gridline. */
    svg.append("g")
        .attr("class", "grid")
        .call(gridYAxis()
            .tickSize(-width)
            .tickFormat("")
        )

    
    /* Defines country element which will be bound to data for our multi-line
        graph
    selection.data([data[, key]]) - joins the specified array of data w/ the
        selected elems, returning a new selection: the elements successfully
        bound to data. 
        - in this case, the array of data (countries in which each elem is a [year, epc] pair) is bounded with each "country" elem
    selection.enter() - returns empty placeholder "country" elem to be bound
        with data*/
    var country = svg.selectAll(".country")
        .data(countries)
        .enter().append("g")
            .attr("class", "country");
   
    
    /* Creates different colored lines for each country on our multi-line graph
    Pairs of years and epc for each country are passed onto line() as [x,y]
        points on the graph. Line uses this data to draw each country's line.
    stroke() - takes in different colors from schemeCategory10 (1 color mapped
        to each country) & color's each country's line with their designated
        color
    fill - if fill isn't set to none, black areas will be underneath each
        country line */
    var path = country.append("path")
        .attr("class", "line")
        .style("stroke", function(d) { 
            return zScale(d.i); 
        })
        .style("fill", "none")
        .attr("d", function(d) { 
            return line(d.values); 
        })

    /* Animates multi-line graph.
    selection.node() - returns the 1st element in this selection
        - in this case, the selection is each country's path
    getTotalLength() - returns total length of the path in user units
        - in this case, it returns the total length of each country's path
    stroke-dasharray - sets the length of dashes in the stroke of SVG shapes 
        (in this case, the SVG shape is a line)
    stroke-dashoffset - defines the location along an SVG path where the dash
        of a stroke will begin. The higher the #, the further along the path
        the dashes will begin.
    transition() - selection-like interface for animating changes to the DOM
        - instead of applying changes instantly, transitions smoothly 
        interpolate the DOM from its current state to the desired state over a
        given duration
    duration() - sets duration timing (ms) for transition()
        - 2000ms = 2s
    ease() - adds smoothness to transition
    easeLinear - sets easing option to a constant rate of motion*/
    var totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition() 
        .duration(2000) 
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);    
    
    /* Adds country names to each line on our multi-line graph
    selection.datum([value]) - gets or sets the bound data for each selected 
        element
        - if value is a function, it's evaluated for each selected element, 
        in order, being passed the current datum (d), the current index (i),
        & the current group (nodes), w/ this as the current DOM element 
        (nodes[i])
    transform/ translate() - moves country labels to end of designated country
        line 
    x & dy - moves x & y position of country labels to the right & down*/
    country.append("text")
        .datum(function(d) { 
            return {
                i: d.i, 
                value: d.values[d.values.length - 1]
            }; 
        })
        .attr("transform", function(d) { 
            return "translate(" + xScale(d.value.year) + "," + yScale(d.value.epc) + ")"; 
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { 
            return d.i; 
        });
    

});