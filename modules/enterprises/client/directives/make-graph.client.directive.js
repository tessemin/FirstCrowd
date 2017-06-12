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
              .data(obj[item])
              .enter().append("circle")
              .attr("cx", function(d) { return disp; })
              .attr("cy", function(d) { return getY(obj, item); })
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



        var tooltip = d3.select('body').append('div')
              .style('position','absolute')
              .style('padding','0 10px')
              .style('opacity',0)
              .attr('id','tooltip');

        function handleMouseOver(d, i) {
          d3.select(this).attr('r', radius * 2).style('fill', 'orange');

          console.log(d);

          tooltip.transition()
            .style('opacity', .9)
            .style('background', 'lightsteelblue');
          tooltip.html(d.companyName + ": " + d.URL )
            .style('left',(d3.event.pageX - 35) + 'px')
            .style('top', (d3.event.pageY - 30) + 'px');


          // svg.append("text").attr('id', 'tooltip')
          //   .attr('x', function() { return d.x; })
          //   .attr('y', function() { return d.y; })
          //   .text('hi');
            // .text(function() { return d.companyName; });

          // d3.select(this).append("text").attr('x', ).attr('y', )
          //   .text(function() {
          //     return 'hi';
          //   });
        }

        function handleMouseOut(d, i) {
          d3.select(this).attr('r', radius).style('fill', 'black');

          tooltip.transition()
            .style('opacity', 0);
          // d3.select('#tooltip').remove();  // Remove text location
        }

        function getY(obj, item) {
          var len = obj[item].length + 1,
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
