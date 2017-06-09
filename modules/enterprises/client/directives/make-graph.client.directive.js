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
          d3.select(this).attr(
            'r', radius * 2
          ).style('fill', 'orange');
          // Specify where to put label of text

          svg.append("text").attr('x', 400).attr('y', 300).attr('id', "t")
            // .attr(
          //   id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
          //   x: function() { return xScale(d.x) - 30; },
          //   y: function() { return yScale(d.y) - 15; }
          // })
            .text(function() {
              console.log('hi');
              return 'hi';
            });
        }

        function handleMouseOut() {

      // Use D3 to select element, change color back to normal
          d3.select(this).attr('r', radius).style('fill', 'black');

            // Select text by id and then remove

            d3.select("#t").remove();  // Remove text location
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
