(function () {
  'use strict';

  angular
    .module('enterprises')
    .directive('makeGraph', makeGraph);

  makeGraph.$inject = ['$window', 'EnterprisesService', '$document', '$q', '$rootScope'];

  function makeGraph($window, EnterprisesService, $document, $q, $rootScope) {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        selected: '=',
        select: '&'
      },
      link: function(scope, element, attrs) {

        d3().then(function(d3) {
          var width = $window.innerWidth;
          var height = $window.innerHeight;

          var svg = d3.select('#graph').append('svg')
                .attr('width', width)
                .attr('height', height);
          var radius = 20;
          var nodes_data = [];
          var links_data = [];

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
                  .strength(0);

            var charge_force = d3.forceManyBody()
                  .strength(100);

            var center_force = d3.forceCenter(width / 2, height / 2);

            simulation
              .force('charge_force', charge_force)
              .force('center_force', center_force)
              .force('links', link_force)
              .force('x', d3.forceX().x(function(d) {
                return d.x;
              }).strength(0.5))
              .force('collision', d3.forceCollide().radius(function() {
                return radius + 10;
              }));

            // add encompassing group for the zoom
            var g = svg.append('g')
                  .attr('class', 'everything');

            var defs = svg.append('defs');

                defs.selectAll('pattern')
                  .data(nodes_data)
                  .enter()
                  .append('pattern')
                  .attr('id', function (d, i) { return 'image' + i; })
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('height', radius * 2)
                  .attr('width', radius * 2)
                  .append('image')
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('height', radius * 2)
                  .attr('width', radius * 2)
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
                  .attr('class', 'link')
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


            // draw circles for the nodes
            var node = g.append('g')
                  .attr('class', 'node')
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
                  .on('click', function(d, i) {
                    centerNode(d3.select(this)._groups[0][0]);

                    var data = d3.select(this)._groups[0][0].__data__;
                    scope.$parent.vm.chooseCompany({ selected: data });
                  });

            makeHomeButton();
            var zoom = makeZoom();

            svg.call(zoom);

            /** Functions **/
            function makeZoom() {
              return d3.zoom()
                    .scaleExtent([1 / 2, 2])
                    .on('zoom', zoom_actions);
            }

            function makeHomeButton() {
              var home = d3.select('#graph')
                    .append('span')
                    .attr('class', 'glyphicon glyphicon-home home')
                    .on('click', centerHome)
                    .on('mousedown', function() {
                      d3.select(this).style('color', 'gray');
                    })
                    .on('mouseup', function() {
                      d3.select(this).style('color', 'lightgray');
                    });
            }

            function centerHome() {
              centerNode(node._groups[0][nodes.rootNode.index]);
            }

            var centerX = width / 2;
            var centerY = height / 2;

            function centerNode(node) {
              var x = centerX - node.cx.baseVal.value;
              var y = centerY - node.cy.baseVal.value;
              svg.transition()
                .duration(500)
                .call(zoom.transform, d3.zoomIdentity.translate(x, y));
            }

            function ticked() {
              node
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
              link
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
            }

            // Zoom functions
            function zoom_actions() {
              g.attr('transform', d3.event.transform);
            }

            function getY(arr, item, prevY) {
              var len = arr.length + 1;
              var pixels = height / len;

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
              var index;
              var y;
              var linkIndex = 0;

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
              console.log(nodes);
            }
          });
        });

        function getGraph() {
          return EnterprisesService.getEnterprise()
            .then(function(response) {
              console.log(response);

              var rootNode = {};
              rootNode.companyName = response.profile.companyName;
              rootNode._id = response._id;
              rootNode.URL = response.profile.URL;
              response.partners.rootNode = rootNode;


              EnterprisesService.getPartners({'enterpriseId': response._id}).then(function(res) {
                console.log(res);
              });
              return response.partners;
            });
        }

        function d3() {
          var d = $q.defer();
          function onScriptLoad() {
            // Load client in the browser
            $rootScope.$apply(function() { d.resolve(window.d3); });
          }
          // Create a script tag with d3 as the source
          // and call our onScriptLoad callback when it
          // has been loaded
          var scriptTag = $document[0].createElement('script');
          scriptTag.type = 'text/javascript';
          scriptTag.async = true;
          // 'public/lib/d3/d3.js',
          scriptTag.src = 'http://d3js.org/d3.v4.min.js';
          scriptTag.onreadystatechange = function () {
            if (this.readyState === 'complete') onScriptLoad();
          };
          scriptTag.onload = onScriptLoad;

          var s = $document[0].getElementsByTagName('body')[0];
          s.appendChild(scriptTag);

          return d.promise;
        }
      }
    };
  }
}());
