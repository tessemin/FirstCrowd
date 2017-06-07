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

        let margin = parseInt(attrs.margin) || 20,
            barHeight = parseInt(attrs.barHeight) || 20,
            barPadding = parseInt(attrs.barPadding) || 5;

        let svg = d3.select(element[0])
              .append('svg')
              .style('width', '100%');

        window.onresize = function() {
          scope.$apply();
        };

        let mydata = [{name: "Greg", score: 98},{name: "Ari", score: 96},{name: 'Q', score: 75},{name: "Loser", score: 48}];

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          scope.render(mydata);
        });


        scope.render = function(data) {
          // our custom d3 code
          svg.selectAll('*').remove();
          if (!data) return;

     var width = d3.select(element[0]).node().offsetWidth - margin,
        // calculate the height
        height = data.length * (barHeight + barPadding),
        // Use the category20() scale function for multicolor support
         color = d3.scaleOrdinal(d3.schemeCategory20),
        // our xScale
        xScale = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) {
            return d.score;
          })])
          .range([0, width]);

    // set the height based on the calculations above
    svg.attr('height', height);

    //create the rectangles for the bar chart
    svg.selectAll('rect')
      .data(data).enter()
        .append('rect')
        .attr('height', barHeight)
        .attr('width', 140)
        .attr('x', Math.round(margin/2))
        .attr('y', function(d,i) {
          return i * (barHeight + barPadding);
        })
        .attr('fill', function(d) { return color(d.score); })
        .transition()
          .duration(1000)
          .attr('width', function(d) {
            return xScale(d.score);
          });
          console.log(data);
        };

      }
    };
  }
}());
