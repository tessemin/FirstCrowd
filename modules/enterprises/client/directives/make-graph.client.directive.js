(function () {
  'use strict';

  angular
    .module('enterprises')
    .directive('makeGraph', makeGraph);

  makeGraph.$inject = ['$window', 'EnterprisesService'];

  function makeGraph($window, EnterprisesService) {
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

        var g, g1, g2, g3;
        getObject().then(function (obj) {

          var disp;
          for (var item in obj){
            if (item === 'supplier') {
              disp = 200;
            } else if (item === 'competitor') {
              disp = 400;
            } else if (item === 'customer') {
              disp = 600;
            }

            g = svg.append("g")
              .selectAll("circle")
              .data(item)
              .enter().append("circle")
              .attr("cx", function(d) { return disp; })
              .attr("cy", function(d) { return getY(item); })
              .attr("r", radius)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .on("click", handleClick);

            if (item === 'supplier') {
              g1 = g;
            } else if (item === 'competitor') {
              g2 = g;
            } else if (item === 'customer') {
              g3 = g;
            }

            globalY = height;
          }
        });

        function handleMouseOver(d, i) {
          d3.select(this).attr('r', radius * 2).style('fill', 'orange');


          svg.append("text").attr({
            id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
            x: function() { return xScale(d.x) - 30; },
            y: function() { return yScale(d.y) - 15; }
          })
            .text('hi');
          // d3.select(this).append("text").attr('x', ).attr('y', )
          //   .text(function() {
          //     return 'hi';
          //   });
        }

        function handleMouseOut(d, i) {
          d3.select(this).attr('r', radius).style('fill', 'black');

          d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
        }

        function getY(item) {
          var len = item.length + 1,
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
          g1.attr("transform", d3.event.transform);
          g2.attr("transform", d3.event.transform);
          g3.attr("transform", d3.event.transform);
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
