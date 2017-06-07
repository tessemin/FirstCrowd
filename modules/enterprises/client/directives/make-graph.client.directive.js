(function () {
  'use strict';

  angular
    .module('enterprises')
    .directive('makeGraph', makeGraph);

  function makeGraph($window) {
    return {
      restrict: 'EA',
      scope: { data: '=' },
      link: function(scope, element, attrs) {

        var width = 960,
            height = 500;

        var svg = d3.select("#graph").append("svg")
              .attr("width", width)
              .attr("height", height);

        var graph = scope.data;

        graph.links.forEach(function(d) {
          d.source = graph.nodes[d.source];
          d.target = graph.nodes[d.target];
        });

        var link = svg.append("g")
              .attr("class", "link")
              .selectAll("line")
              .data(graph.links)
              .enter().append("line")
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

        var node = svg.append("g")
              .attr("class", "node")
              .selectAll("circle")
              .data(graph.nodes)
              .enter().append("circle")
              .attr("r", 10)
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; })
              .call(d3.drag().on("drag", dragged));

        // var brush = svg.append("g")
        //       .attr("class", "brush")
        //       .call(d3.brush()
        //             .extent([[0, 0], [width, height]])
        //             .on("start brush end", brushed));

        // function brushed() {
        //   var selection = d3.event.selection;
        //   node.classed("selected", selection && function(d) {
        //     return selection[0][0] <= d.x && d.x < selection[1][0]
        //       && selection[0][1] <= d.y && d.y < selection[1][1];
        //   });
        // }

        function dragged(d) {
          d.x = d3.event.x, d.y = d3.event.y;
          d3.select(this).attr("cx", d.x).attr("cy", d.y);
          link.filter(function(l) { return l.source === d; }).attr("x1", d.x).attr("y1", d.y);
          link.filter(function(l) { return l.target === d; }).attr("x2", d.x).attr("y2", d.y);
        }


        //     let margin = parseInt(attrs.margin) || 20,
        //         barHeight = parseInt(attrs.barHeight) || 20,
        //         barPadding = parseInt(attrs.barPadding) || 5;

        //     let svg = d3.select(element[0])
        //           .append('svg')
        //           .style('width', '100%');

        //     window.onresize = function() {
        //       scope.$apply();
        //     };

        //     scope.$watch('data', function(newVals, oldVals) {
        //       return scope.render(newVals);
        //     }, true);

        //     // Watch for resize event
        //     scope.$watch(function() {
        //       return angular.element($window)[0].innerWidth;
        //     }, function() {
        //       scope.render(scope.data);
        //     });


        //     scope.render = function(data) {
        //       svg.selectAll('*').remove();
        //       if (!data) return;

        //  let width = d3.select(element[0]).node().offsetWidth - margin,
        //     // calculate the height
        //     height = data.length * (barHeight + barPadding),
        //     // Use the category20() scale function for multicolor support
        //      color = d3.scaleOrdinal(d3.schemeCategory20),
        //     // our xScale
        //     xScale = d3.scaleLinear()
        //       .domain([0, d3.max(data, function(d) {
        //         return d.score;
        //       })])
        //       .range([0, width]);

        // // set the height based on the calculations above
        // svg.attr('height', height);

        // //create the rectangles for the bar chart
        // svg.selectAll('rect')
        //   .data(data).enter()
        //     .append('rect')
        //     .attr('height', barHeight)
        //     .attr('width', 140)
        //     .attr('x', Math.round(margin/2))
        //     .attr('y', function(d,i) {
        //       return i * (barHeight + barPadding);
        //     })
        //     .attr('fill', function(d) { return color(d.score); })
        //     .transition()
        //       .duration(1000)
        //       .attr('width', function(d) {
        //         return xScale(d.score);
        //       });
        //     };
      }
    };
  }
}());
