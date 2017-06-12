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

        var globalY = height;
        var radius = 10;

        var points = scope.data.nodes;

        var g = svg.append("g")
              .selectAll("circle")
              .data(points)
              .enter().append("circle")
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return getY(); })
              .attr("r", radius)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .on("click", handleClick);

        function handleMouseOver(d, i) {
          d3.select(this).attr('r', radius * 2).style('fill', 'orange');


          svg.append("text").attr({
            id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
            x: function() { return xScale(d.x) - 30; },
            y: function() { return yScale(d.y) - 15; }
          })
            .text([1, 2, 3]);
          // d3.select(this).append("text").attr('x', ).attr('y', )
          //   .text(function() {
          //     return 'hi';
          //   });
        }

        function handleMouseOut(d, i) {
          d3.select(this).attr('r', radius).style('fill', 'black');

          d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
        }

        function getY() {
          var len = points.length + 1,
              pixels = height / len;

          globalY = globalY - pixels;

          return globalY;
        }


        function handleClick() {

        }

        svg.call(d3.zoom()
                 .scaleExtent([1 / 2, 8])
                 .on("zoom", zoomed));

        function zoomed() {
          g.attr("transform", d3.event.transform);
        }

        function getObject() {
          return EnterprisesService.getEnterprise()
            .then(function(response) {
              return response.partners;
            });
        }
      }
    };
  }
}());
