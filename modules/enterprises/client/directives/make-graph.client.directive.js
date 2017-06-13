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

        var g1, g2, g3, c1, c2, c3;
        getObject().then(function (obj) {

          var disp, y;
          for (var item in obj){
            if (item === 'supplier') {
              disp = 100;
            } else if (item === 'competitor') {
              disp = 300;
            } else if (item === 'customer') {
              disp = 500;
            }


            var g = svg.append("g")
                  .selectAll("rect")
                  .data(obj[item])
                  .enter().append("rect")
                  .attr("x", function(d) { return disp; })
                  .attr("y", function(d) { return getY(obj, item); })
                  .attr("rx", 5)
                  .attr("ry", 5)
                  .attr("width", 90)
                  .attr("height", 50)
                  .style("fill", "white")
                  .attr("stroke", "black")
                  .attr("stroke-width", 3)
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut)
                  .on("click", handleClick);

            var c = svg.append("g")
                  .selectAll("circle")
                  .data(obj[item])
                  .enter().append("circle")
                  .attr("cx", function(d) { return disp + 10; })
                  .attr("cy", function(d) { return getY(obj, item) + 10; })
                  .attr("r", 10)
                  .attr("fill", "white")
                  .attr("stroke", "black")
                  .attr("stroke-width", 3);

            if (item === 'supplier') {
              g1 = g;
              c1 = c;
            } else if (item === 'competitor') {
              g2 = g;
              c2 = c;
            } else if (item === 'customer') {
              g3 = g;
              c3 = c;
            }

          }
        });

        function resetGlobalY(){
          globalY = height;
        }


        function handleMouseOver(d, i) {
          // d3.select(this).attr('r', radius * 2).style('fill', 'orange');

          var tooltip = d3.select('body').append('div')
                .style('position','absolute')
                .style('padding','0 10px')
                .style('opacity',0)
                .attr('id','tooltip');

          tooltip.transition()
            .style('opacity', .9)
            .style('background', 'lightsteelblue');
          tooltip.html(d.companyName + ": " + d.URL )
            .style('left',(d3.event.pageX - 35) + 'px')
            .style('top', (d3.event.pageY - 30) + 'px');
        }

        function handleMouseOut(d, i) {
          // d3.select(this).attr('r', radius).style('fill', 'steelblue');
          d3.select('#tooltip').remove();  // Remove text location
        }

        function getY(obj, item) {
          var len = obj[item].length + 1,
              pixels = height / len;

          globalY = globalY - pixels;
          if (globalY - pixels === 0){
            var y = globalY;
            globalY = height;
            return y;
          }
          return globalY;
        }


        function handleClick() {

        }

        svg.call(d3.zoom()
                 .scaleExtent([1 / 2, 8])
                 .on("zoom", zoomed));

        function zoomed() {
          c1.attr("transform", d3.event.transform);
          c2.attr("transform", d3.event.transform);
          c3.attr("transform", d3.event.transform);
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
