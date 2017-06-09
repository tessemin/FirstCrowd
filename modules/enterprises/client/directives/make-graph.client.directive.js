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

        var newsvg = d3.select("#graph").append("svg")
              .attr("width", 800)
              .attr("height", 600);

        var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            transform = d3.zoomIdentity;;

        var points = scope.data.nodes;
        console.log(points);

        var radius = 10;
        var g = svg.append("g");

        g.selectAll("circle")
          .data(points)
          .enter().append("circle")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("r", radius)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick);

        function handleMouseOver() {
          d3.select(this).attr('r', radius * 2).style('fill', 'orange');

          d3.select(this).append("text").attr('x', d3.select(this).attr('cx')).attr('y', d3.select(this).attr('cy'))
            .text(function() {
              return 'hi';
            });
        }

        function handleMouseOut() {

          d3.select(this).attr('r', radius).style('fill', 'black');

        }

        function handleClick() {

        }

        svg.call(d3.zoom()
                 .scaleExtent([1 / 2, 8])
                 .on("zoom", zoomed));

        function zoomed() {
          g.attr("transform", d3.event.transform);
        }
      }
    };
  }
}());
