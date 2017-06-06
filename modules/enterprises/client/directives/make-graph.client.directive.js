(function () {
  'use strict';

  angular
    .module('enterprises')
    .directive('makeGraph', makeGraph);

  // function makeGraph($window) {
  function makeGraph() {

    return {
      restrict: 'EA',
      template: "<svg width='850' height='200'></svg>",
      scope: { data: '=' },
      link: function(scope, elem, attrs){

        var width = 1000,
            height = 600;

        var svg = d3.select("div#graph").append("svg").attr("width",width)
                    .attr("height",height);

        var nodeData = [
          {'x':225,'y':100,'id':'First'}, {'x': 50, 'y': 50, 'id': 'Second'},
          {'x':500,'y':340,'id':'Third'}, {'x': 100, 'y': 200, 'id': 'Fourth'},
          {'x':325,'y':400,'id':'Fifth'}, {'x': 250, 'y': 40, 'id': 'Sixth'}
        ];

        var simulation = d3.forceSimulation(nodeData);

        simulation.force("xAxis",d3.forceX(width/2)).force("yAxis",d3.forceY(height/2));

         var node = svg.selectAll("circle").data(nodeData)
                    .enter().append("circle")
                    .attr("r",30).attr("cx",width/2).attr("cy",height/2)
                    .attr("fill","black").attr("opacity",0.5)
                    .call(d3.drag()
                    .on("start",dragstarted)
                    .on("drag",dragged)
                    .on("end",dragended));

         function dragstarted(d)
         {
            simulation.restart();
            simulation.alpha(1.0);
            d.fx = d.x;
            d.fy = d.y;
         }

         function dragged(d)
         {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
         }

         function dragended(d)
         {
            d.fx = null;
            d.fy = null;
            simulation.alphaTarget(0.1);
         }

         function ticked(){
             node.attr("cx", function(d){ return d.x;})
             .attr("cy", function(d){ return d.y;});
         }

            simulation.on("tick",ticked());

      }
    };
  }
}());

//     var width,height;
//     var chartWidth, chartHeight;
//     var margin;
//     var svg = d3.select("#graph").append("svg");
//     var chartLayer = svg.append("g").classed("chartLayer", true);

//     main();

//     function main() {
//       var range = 100;
//       var data = {
//         nodes:d3.range(0, range).map(function(d){ return {label: "l"+d ,r:~~d3.randomUniform(8, 28)()};}),
//         links:d3.range(0, range).map(function(){ return {source:~~d3.randomUniform(range)(), target:~~d3.randomUniform(range)()};})
//       };

//       setSize(data);
//       drawChart(data);
//     }

//     function setSize(data) {
//       width = document.querySelector("#graph").clientWidth;
//       height = document.querySelector("#graph").clientHeight;

//       margin = {top:0, left:0, bottom:0, right:0 };


//       chartWidth = width - (margin.left+margin.right);
//       chartHeight = height - (margin.top+margin.bottom);

//       svg.attr("width", width).attr("height", height);


//       chartLayer
//         .attr("width", chartWidth)
//         .attr("height", chartHeight)
//         .attr("transform", "translate("+[margin.left, margin.top]+")");


//     }

//     function drawChart(data) {

//       var simulation = d3.forceSimulation()
//             .force("link", d3.forceLink().id(function(d) { return d.index; }))
//             .force("collide",d3.forceCollide( function(d){return d.r + 8; }).iterations(16) )
//             .force("charge", d3.forceManyBody())
//             .force("center", d3.forceCenter(chartWidth / 2, chartWidth / 2))
//             .force("y", d3.forceY(0))
//             .force("x", d3.forceX(0));

//       var link = svg.append("g")
//             .attr("class", "links")
//             .selectAll("line")
//             .data(data.links)
//             .enter()
//             .append("line")
//             .attr("stroke", "black");

//       var node = svg.append("g")
//             .attr("class", "nodes")
//             .selectAll("circle")
//             .data(data.nodes)
//             .enter().append("circle")
//             .attr("r", function(d){  return d.r; })
//             .call(d3.drag()
//                   .on("start", dragstarted)
//                   .on("drag", dragged)
//                   .on("end", dragended));

//     }

//     var ticked = function() {
//       link
//         .attr("x1", function(d) { return d.source.x; })
//         .attr("y1", function(d) { return d.source.y; })
//         .attr("x2", function(d) { return d.target.x; })
//         .attr("y2", function(d) { return d.target.y; });

//       node
//         .attr("cx", function(d) { return d.x; })
//         .attr("cy", function(d) { return d.y; });
//     };

//     simulation
//       .nodes(data.nodes)
//       .on("tick", ticked);

//     simulation.force("link")
//       .links(data.links);



//     function dragstarted(d) {
//       if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//       d.fx = d.x;
//       d.fy = d.y;
//     }

//     function dragged(d) {
//       d.fx = d3.event.x;
//       d.fy = d3.event.y;
//     }

//     function dragended(d) {
//       if (!d3.event.active) simulation.alphaTarget(0);
//       d.fx = null;
//       d.fy = null;
//     }
//   }
// }());




//  //   makeGraph.$inject = ['$window'];

//  //   function makeGraph($window) {
//  //     return {
//  //       restrict: 'EA',
 //       template: "<svg width='850' height='200'></svg>",
 //       scope: { data: '=' },
 //       link: function(scope, elem, attrs){

 //         var width = 960,
 //     height = 500;

 //         var fill = d3.scaleOrdinal(d3.schemeCategory20);

 // var force = d3.layout.force()
 //     .size([width, height])
 //     .nodes([{}]) // initialize with a single node
 //     .linkDistance(30)
 //     .charge(-60)
 //     .on("tick", tick);

 // var svg = d3.select("body").append("svg")
 //     .attr("width", width)
 //     .attr("height", height)
 //     .on("mousemove", mousemove)
 //     .on("mousedown", mousedown);

 // svg.append("rect")
 //     .attr("width", width)
 //     .attr("height", height);

 // var nodes = force.nodes(),
 //     links = force.links(),
 //     node = svg.selectAll(".node"),
 //     link = svg.selectAll(".link");

 // var cursor = svg.append("circle")
 //     .attr("r", 30)
 //     .attr("transform", "translate(-100,-100)")
 //     .attr("class", "cursor");

 // restart();

 // function mousemove() {
 //   cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
 // }

 // function mousedown() {
 //   var point = d3.mouse(this),
 //       node = {x: point[0], y: point[1]},
 //       n = nodes.push(node);

 //   // add links to any nearby nodes
 //   nodes.forEach(function(target) {
 //     var x = target.x - node.x,
 //         y = target.y - node.y;
 //     if (Math.sqrt(x * x + y * y) < 30) {
 //       links.push({source: node, target: target});
 //     }
 //   });

 //   restart();
 // }

 // function tick() {
 //   link.attr("x1", function(d) { return d.source.x; })
 //       .attr("y1", function(d) { return d.source.y; })
 //       .attr("x2", function(d) { return d.target.x; })
 //       .attr("y2", function(d) { return d.target.y; });

 //   node.attr("cx", function(d) { return d.x; })
 //       .attr("cy", function(d) { return d.y; });
 // }

 // function restart() {
 //   link = link.data(links);

 //   link.enter().insert("line", ".node")
 //       .attr("class", "link");

 //   node = node.data(nodes);

 //   node.enter().insert("circle", ".cursor")
 //       .attr("class", "node")
 //       .attr("r", 5)
 //       .call(force.drag);

 //   force.start();
 // }


 // var d3 = $window.d3;
 // var data = scope.data;
 // var color = d3.scaleOrdinal(d3.schemeCategory10);
 // var el = elem[0];
 // var width = elem.clientWidth;
 // var height = elem.clientHeight;
 // var min = Math.min(width, height);
 // var pie = d3.pie().sort(null);
 // var arc = d3.arc()
 //       .outerRadius(min / 2 * 0.9)
 //       .innerRadius(min / 2 * 0.5);
 // var svg = d3.select(el).append('svg')
 //       .attr({width: width, height: height})

 // .append('g')
 // .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

 // svg.selectAll('svg:path').data(pie(data))
 //   .enter().append('svg:path')
 //   .style('stroke', 'white')
 //   .attr('svg:d', arc)
 //   .attr('fill', function(d, i) { return color(i); });
