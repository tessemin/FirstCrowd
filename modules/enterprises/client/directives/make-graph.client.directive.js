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
              .attr("width", 1000)
              .attr("height", 760);

        var svg = d3.select('svg'),
          width = +svg.attr('width'),
          height = +svg.attr('height');

        var radius = 40;
        var nodes_data = [],
          links_data = [];

        getGraph().then(function(obj) {
          var nodes = obj;
          var rootNodeId = obj.rootNode._id;
          wrapCoordinates(nodes);

          // set up the simulation and add forces
          var simulation = d3.forceSimulation()
            .nodes(nodes_data)
            .on('tick', ticked);

          var link_force = d3.forceLink(links_data)
            .id(function(d) { return d._id; })
            .distance(220)
            .strength(1);

          var charge_force = d3.forceManyBody()
            .strength(30);

          var center_force = d3.forceCenter(width / 2, height / 2);

          simulation
            .force('charge_force', charge_force)
            .force('center_force', center_force)
            .force('links', link_force)
            .force('x', d3.forceX().x(function(d) {
              return d.x;
            }).strength(.5))
            .force('collision', d3.forceCollide().radius(function() {
              return radius + 1;
            }));

          // add encompassing group for the zoom
          var g = svg.append('g')
            .attr('class', 'everything');

          var defs = svg.append('defs')
                .selectAll('pattern')
                .data(nodes_data)
                .enter()
                .append('pattern')
                .attr('id', function (d, i) { return 'image' + i; })
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 80)
                .attr('width', 80)
                .append('image')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 80)
                .attr('width', 80)
                .attr('xlink:href', function (d) { return d.img; });

          // build the arrow.
          svg.append('svg:defs').selectAll('marker')
            .data(['end'])      // Different link/path types can be defined here
            .enter().append('svg:marker')    // This section adds in the arrows
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 80)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

          // draw lines for the links
          var link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links_data)
            .enter().append('line')
            .attr('stroke-width', 2)
            .style('stroke', 'black')
            .attr('marker-end', 'url(#end)')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });


          // var fruits = ["Apple", "Orange", "Banana", "Grape"];
          // var ctxMenu = d3.select("body")
          //       .append('div')
          //       .style('display', 'none')
          //       .attr('class', 'context-menu');

          var menu = g.append('g')
                .attr('class', 'node-menu')
                .selectAll('rect')
                .data(nodes_data)
                .enter()
                .append('rect')
                .style('fill', 'none')
                .style('stroke', 'transparent')
                .attr('width', 50)
                .attr('height', 100)
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; });

          // draw circles for the nodes
          var node = g.append('g')
            .attr('class', 'logo')
            .selectAll('circle')
            .data(nodes_data)
            .enter()
            .append('circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('r', radius)
            .style('fill', function(d, i) { return 'url(#image' + i + ')'; })
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .on('mouseover', function(d, i) {
              // console.log(d3.select(menu)['_groups'][0][0]['_groups'][0][i]);
              // d3.select(menu)['_groups'][0][0]['_groups'][0][i].style('fill', '#fff');
              d3.select(menu)[i].style('fill', '#fff');

            })
            .on('mouseout', function(d, i) {
              // d3.select(menu)['_groups'][0][0]['_groups'][0][i].style('fill', 'none');
            });

            // .on('click', function(d, i) {
            //   var x = d3.select(this)['_groups'][0][0].cx.baseVal.valueAsString;
            //   var y = d3.select(this)['_groups'][0][0].cy.baseVal.valueAsString;
            //       ctxMenu.selectAll("ul").remove();

            //       // create the div element that will hold the context menu
            //       // this gets executed when a contextmenu event occurs
            //       ctxMenu
  					//         .append('ul')
            //         .selectAll('li')
            //         .data(fruits).enter()
            //         .append('li')
            //         .style('list-style-image', function(d, i) {
            //           return 'url("http://loremflickr.com/48/48?i=' + i + '")';
            //         })
            //         .on('click' , function(d) { console.log(d); return d; })
            //         .text(function(d) { return d; });

            //       // show the context menu
            //       ctxMenu
            //         .style('left', (x - 2) + 'px')
            //         .style('top', (y - 2) + 'px')
            //         .style('display', 'block');
            //       d3.event.preventDefault();
            //   console.log(ctxMenu);
            // })
            // .on('mouseout', function() {

            //   // ctxMenu.selectAll("ul").remove();
            //   // d3.select(this).style('fill', '#fff');
            // });

          // add drag capabilities
          // var drag_handler = d3.drag()
          //   .on('start', drag_start)
          //   .on('drag', drag_drag)
          //   .on('end', drag_end);

          // drag_handler(node);
          // drag_handler(link);

          // add zoom capabilities
          var zoom_handler = d3.zoom()
            .scaleExtent([1 / 1.5, 2])
            .on('zoom', zoom_actions);

          zoom_handler(svg);

          /** Functions **/

          function ticked() {
            node
              .attr('cx', function(d) { return d.x; })
              .attr('cy', function(d) { return d.y; });
            link
              .attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });
            menu
              .attr('x', function(d) { return d.x - 25; })
              .attr('y', function(d) { return d.y + 25; });
          }

          // Zoom functions
          function zoom_actions() {
            g.attr('transform', d3.event.transform);
          }

          function getY(arr, item, prevY) {
            var len = arr.length + 1,
              pixels = height / len;

            prevY = prevY + pixels;

            if (prevY + pixels >= height) {
              var y = prevY;
              prevY = 0;
              return y;
            }
            return prevY;
          }

          function wrapCoordinates(nodes) {
            var SUP_X = width / 4;
            var COM_X = width / 4 + width / 4;
            var CUS_X = width / 4 + width / 4 + width / 4;
            var index,
              y,
              linkIndex = 0;

            for (var item in nodes) {
              if (item === 'customer') {
                y = 0;
                for (index = 0; index < nodes[item].length; index++) {
                  nodes[item][index].x = CUS_X;
                  y = getY(nodes[item], item, y);
                  nodes[item][index].y = y;
                  nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                  nodes_data.push(nodes[item][index]);

                  links_data[linkIndex] = { 'source': null, 'target': null };
                  links_data[linkIndex].source = rootNodeId;
                  links_data[linkIndex].target = nodes[item][index]._id;
                  linkIndex++;
                }
              } else if (item === 'supplier') {
                y = 0;
                for (index = 0; index < nodes[item].length; index++) {
                  nodes[item][index].x = SUP_X;
                  y = getY(nodes[item], item, y);
                  nodes[item][index].y = y;
                  nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';
                  nodes_data.push(nodes[item][index]);

                  links_data[linkIndex] = { 'source': null, 'target': null };
                  links_data[linkIndex].source = nodes[item][index]._id;
                  links_data[linkIndex].target = rootNodeId;
                  linkIndex++;
                }
              } else if (item === 'competitor') {
                y = 0;
                for (index = 0; index < nodes[item].length; index++) {
                  nodes[item][index].x = COM_X;
                  y = getY(nodes[item], item, y);
                  nodes[item][index].y = y;
                  nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/pencil-gear-128.png';
                  nodes_data.push(nodes[item][index]);
                }
              } else if (item === 'rootNode') {
                nodes[item].x = width / 2;
                nodes[item].y = height / 2;
                nodes[item].img = 'http://www.e-pint.com/epint.jpg';
                nodes_data.push(nodes[item]);
              }
            }
          }
        });

        function getGraph() {
          return EnterprisesService.getEnterprise()
            .then(function(response) {
              var rootNode = {};
              rootNode.companyName = response.profile.companyName;
              rootNode._id = response._id;
              rootNode.URL = response.profile.URL;
              response.partners.rootNode = rootNode;
              return response.partners;
            });
        }
//         // var g1, g2, g3, c1, c2, c3, t1, t2, t3;
//         // var rootNode = {}, flag = false;
//         // getObject().then(function (obj) {
//         //   var disp, y, list = obj;
//         //   for (var item in list) {
//         //     if (item === 'supplier') {
//         //       disp = 100;
//         //     }
//         //     else if (item === 'competitor') {
//         //       var len = list[item].length;
//         //       var mid = Math.ceil(len/2);
//         //       list[item].splice(mid-1, 0, rootNode);
//         //       disp = 300;
//         //     }
//         //     else if (item === 'customer') {
//         //       disp = 500;
//         //     }

//         //     if (item === 'competitor') {
//         //       flag = true;
//         //     }

//         //     var g = svg.append('g')
//         //           .selectAll('rect')
//         //           .data(list[item])
//         //           .enter().append('rect')
//         //           .attr('x', function(d) { return disp; })
//         //           .attr('y', function(d) { return getY(list, item, flag); })
//         //           .attr('rx', 5)
//         //           .attr('ry', 5)
//         //           .attr('width', 90)
//         //           .attr('height', 50)
//         //           .style('fill', 'white')
//         //           .attr('stroke', 'black')
//         //           .attr('stroke-width', 2)
//         //           .on('mouseover', handleMouseOver)
//         //           .on('mouseout', handleMouseOut)
//         //           .on('click', handleClick);

//         //     if (item === 'competitor') {
//         //       flag = true;
//         //     }

//         //     var c = svg.append('g')
//         //           .selectAll('circle')
//         //           .data(list[item])
//         //           .enter().append('circle')
//         //           .attr('cx', function(d) { return disp + 10; })
//         //           .attr('cy', function(d) { return getY(list, item, flag) + 10; })
//         //           .attr('r', 10)
//         //           .attr('fill', 'white')
//         //           .attr('stroke', 'black')
//         //           .attr('stroke-width', 2);

//         //     if (item === 'competitor') {
//         //       flag = true;
//         //     }

//         //     var t = svg.append('g')
//         //           .selectAll('text')
//         //           .data(list[item])
//         //           .enter().append('text')
//         //           .text(function(d) { return d.companyName; })
//         //           .attr('font-size', '4')
//         //           .attr('x', function(d) { return disp + 2; })
//         //           .attr('y', function(d) { return getY(list, item, flag) + 25; })
//         //           .attr('dx', '0')
//         //           .attr('dy', '0')
//         //           .call(wrap, 70);

//         //     if (item === 'supplier') {
//         //       g1 = g;
//         //       c1 = c;
//         //       t1 = t;
//         //     } else if (item === 'competitor') {
//         //       g2 = g;
//         //       c2 = c;
//         //       t2 = t;
//         //     } else if (item === 'customer') {
//         //       g3 = g;
//         //       c3 = c;
//         //       t3 = t;
//         //     }
//         //   }
//         // });

//         // function handleMouseOut(d, i) {
//         //   // d3.select(this).attr('r', radius).style('fill', 'steelblue');
//         //   d3.select('#tooltip').remove();  // Remove text location
//         // }
//         // function handleMouseOver(d, i) {
//         //   // d3.select(this).attr('r', radius * 2).style('fill', 'orange');
//         //   var tooltip = d3.select('body').append('div')
//         //         .style('position','absolute')
//         //         .style('padding','0 10px')
//         //         .style('opacity',0)
//         //         .attr('id','tooltip');

//         //   tooltip.transition()
//         //     .style('opacity', .9)
//         //     .style('background', 'lightsteelblue');
//         //   tooltip.html(d.companyName + ': ' + d.URL )
//         //     .style('left',(d3.event.pageX - 35) + 'px')
//         //     .style('top', (d3.event.pageY - 30) + 'px');
//         // }

//         // function wrap(text, width) {
//         //   text.each(function() {
//         //     var text = d3.select(this),
//         //         words = text.text().split(/\s+/).reverse(),
//         //         word,
//         //         line = [],
//         //         lineNumber = 0,
//         //         lineHeight = 1.1, // ems
//         //         y = text.attr('y'),
//         //         x = text.attr('x'),
//         //         dy = parseFloat(text.attr('dy')),
//         //         tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
//         //     while ((word = words.pop())) {
//         //       line.push(word);
//         //       tspan.text(line.join(' '));
//         //       if (tspan.node().getComputedTextLength() > width) {
//         //         line.pop();
//         //         tspan.text(line.join(' '));
//         //         line = [word];
//         //         tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
//         //       }
//         //     }
//         //   });
//         // }
      }
    };
  }
}());
