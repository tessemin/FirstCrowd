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
            transform = d3.zoomIdentity,
            globalY = 0,
            radius = 10;

        var g1, g2, g3, c1, c2, c3, t1, t2, t3;
        var rootNode = {}, flag = false;
        getObject().then(function (obj) {
          var disp, y, list = obj;
          for (var item in list) {
            if (item === 'supplier') {
              disp = 100;
            }
            else if (item === 'competitor') {
              var len = list[item].length;
              var mid = Math.ceil(len/2);
              list[item].splice(mid-1, 0, rootNode);
              disp = 300;
            }
            else if (item === 'customer') {
              disp = 500;
            }

            if (item === 'competitor') {
              flag = true;
            }

            var g = svg.append("g")
                  .selectAll("rect")
                  .data(list[item])
                  .enter().append("rect")
                  .attr("x", function(d) { return disp; })
                  .attr("y", function(d) { return getY(list, item, flag); })
                  .attr("rx", 5)
                  .attr("ry", 5)
                  .attr("width", 90)
                  .attr("height", 50)
                  .style("fill", "white")
                  .attr("stroke", "black")
                  .attr("stroke-width", 2)
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut)
                  .on("click", handleClick);

            if (item === "competitor") {
              flag = true;
            }

            var c = svg.append("g")
                  .selectAll("circle")
                  .data(list[item])
                  .enter().append("circle")
                  .attr("cx", function(d) { return disp + 10; })
                  .attr("cy", function(d) { return getY(list, item, flag) + 10; })
                  .attr("r", 10)
                  .attr("fill", "white")
                  .attr("stroke", "black")
                  .attr("stroke-width", 2);

            if (item === "competitor") {
              flag = true;
            }

            var t = svg.append("g")
                  .selectAll("text")
                  .data(list[item])
                  .enter().append("text")
                  .text(function(d) { return d.companyName; })
                  .attr("font-size", "4")
                  .attr("x", function(d) { return disp + 2; })
                  .attr("y", function(d) { return getY(list, item, flag) + 25; })
                  .attr("dx", "0")
                  .attr("dy", "0")
                  .call(wrap, 70);

            if (item === 'supplier') {
              g1 = g;
              c1 = c;
              t1 = t;
            } else if (item === 'competitor') {
              g2 = g;
              c2 = c;
              t2 = t;
            } else if (item === 'customer') {
              g3 = g;
              c3 = c;
              t3 = t;
            }
          }
        });

        function handleMouseOut(d, i) {
          // d3.select(this).attr('r', radius).style('fill', 'steelblue');
          d3.select('#tooltip').remove();  // Remove text location
        }

        function getY(obj, item) {
          var addedLen = 1;

          if(item === "competitor" && obj[item].len % 2 === 0) {
            addedLen += 1;
          }

          var len = obj[item].length + addedLen,
              pixels = height / len;

          globalY = globalY + pixels;

          if (flag) {
            globalY = globalY + pixels/2;
          }
          flag = false;

          if (globalY + pixels >= height) {
            var y = globalY;
            globalY = 0;
            return y - 50;
          }
          console.log(globalY);
          return globalY - 50;
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

        function handleClick() {

        }

        svg.call(d3.zoom()
                 .scaleExtent([1 / 2, 8])
                 .on("zoom", zoomed));

        function zoomed() {
          c1.attr("transform", d3.event.transform);
          c2.attr("transform", d3.event.transform);
          c3.attr("transform", d3.event.transform);
          t1.attr("transform", d3.event.transform);
          t2.attr("transform", d3.event.transform);
          t3.attr("transform", d3.event.transform);
          g1.attr("transform", d3.event.transform);
          g2.attr("transform", d3.event.transform);
          g3.attr("transform", d3.event.transform);
        }

        function getObject() {
          return EnterprisesService.getEnterprise()
            .then(function(response) {
              rootNode.companyName = response.profile.companyName;
              rootNode.URL = response.profile.URL;
              return response.partners;
            });
        }

        function wrap(text, width) {
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while ((word = words.pop())) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
          });
        }
      }
    };
  }
}());
