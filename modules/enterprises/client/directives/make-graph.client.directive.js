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
          d3.select('.footer').remove();
          var header = getBounds(d3.select('header')._groups[0][0]);
          var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);

          // var widthBot = 0;
          // var heightBot = 0;
          var width = $window.innerWidth;
          var height = $window.innerHeight;
          // var widthTop = width;
          // var heightTop = height;

          d3.select('.display').style('height', function() { return (height - sideHeight.offsetTop - header.offsetHeight) + 'px';});
          d3.select('.side-list').style('max-height', function() { return (height - header.offsetHeight - sideHeight.offsetTop - sideHeight.offsetHeight - 80) + 'px'; });
          d3.select('.content').style('margin-top', function() { return header.offsetHeight + 'px';});

          var svg = d3.select('#graph').append('svg')
                .style('padding', '30px')
                .attr('width', width)
                .attr('height', height - header.offsetHeight - 5);

          svg.on('mousedown', function(d) {
            console.log(d3.event);
          });

          var color = d3.scaleOrdinal(d3.schemeCategory10);

          //   function addNodeToGraph(newNode) {
          //         .on('click', function(d, i) {
          //           d3.selectAll('text').remove();
          //           d3.selectAll('rect').remove();

          //           d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', '');
          //           d3.select(this).transition().duration(300)
          //             .style('stroke', 'red')
          //             .style('stroke-width', 5)
          //             .attr('id', 'selected-circle');

          //           var items = [
          //             { 'func': centerNode, 'text': 'Center Graph on Company', 'y': 1 },
          //             { 'func': viewCatalog, 'text': 'View Product/Service Catalog', 'y': 2 },
          //             { 'func': viewDemands, 'text': 'View Demands', 'y': 3 },
          //             { 'func': viewSuppliers, 'text': 'View Suppliers', 'y': 4 },
          //             { 'func': viewCustomers, 'text': 'View Customers', 'y': 5 },
          //             { 'func': viewCompetitors, 'text': 'View Competitors', 'y': 6 }
          //           ];
          //           var menuWidth = 200;
          //           var itemHeight = 30;
          //           var x = d3.select(this)._groups[0][0].cx.baseVal.value + 40;
          //           if (x + menuWidth > width) {
          //             x = x - 280;
          //           }
          //           var y = d3.select(this)._groups[0][0].cy.baseVal.value - 70;
          //           var menuLen = items.length * itemHeight;
          //           if (y + menuLen > height) {
          //             y = y - 30;
          //           }

          //           menuItems = g.selectAll('rect').data(items).enter()
          //             .append('rect').attr('class', 'conmenu-items')
          //             .attr('width', menuWidth).attr('height', itemHeight)
          //             .style('fill', '#d3d3d3')
          //             .on('mouseout', function(d) {
          //               d3.select(this).style('fill', '#d3d3d3');
          //             })
          //             .on('mouseover', function(d) {
          //               d3.select(this).style('fill', '#fff');
          //             })
          //             .on('click', function(d) {
          //               d3.selectAll('text').remove();
          //               d3.selectAll('rect').remove();

          //               if (d.func === centerNode) {
          //                 d.func(d3.select('#selected-circle')._groups[0][0]);
          //               } else {
          //                 d.func(d3.select('#selected-circle')._groups[0][0].__data__);
          //               }
          //             })
          //             .style('stroke', 'black')
          //             .style('stroke-width', 0.5)
          //             .attr('x', x)
          //             .attr('y', function(d) {
          //               return y + (30 * (d.y));
          //             });

          //           menuText = g.selectAll('text').data(items).enter()
          //             .append('text')
          //             .style('cursor', 'default')
          //             .style('pointer-events', 'none')
          //             .attr('x', x + 3)
          //             .attr('y', function(d) {
          //               return y + 20 + (30 * (d.y));
          //             })
          //             .text(function (d) { return d.text; });
          //         });
          //   }


          getGraph().then(function(rootNode) {
            var radius = 15;
            var xStep = width / 4;
            var centerX = width / 2;
            var centerY = height / 2;
            var nodes = [rootNode],
                links = [];

            rootNode.x = centerX;
            rootNode.y = centerY;
            rootNode.img = 'http://www.e-pint.com/epint.jpg';

            var simulation = buildForces();
            makeLineArrow();

            var g = svg.append('g'),
              link = g.append('g').attr('stroke', '#000').attr('stroke-width', 1.5).selectAll('.link'),
              node = g.append('g').attr('stroke', '#fff').attr('stroke-width', 1.5).selectAll('.node');

            var menuText = g.append('text');
            var menuItems = g.append('rect');

            var zoom = d3.zoom()
                  .scaleExtent([1 / 4, 1.2])
                  .on('zoom', zoom_actions);

            svg.call(zoom);
            d3.select('svg').on('dblclick.zoom', null);

            makeHomeButton();

            spiderWeb(rootNode, 2);

            function makeNodeImages() {
              return svg.append('defs')
                .selectAll('pattern')
                .data(nodes)
                .enter()
                .append('pattern')
                .attr('id', function (d) { return 'image' + d.enterpriseId; })
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
            }

            function buildForces() {
              return d3.forceSimulation()
                .nodes(nodes)
                .force('charge', d3.forceManyBody().strength(0.2))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('link', d3.forceLink(links).id(function(d) { return d.enterpriseId; }).distance(20).strength(0))
                .force('x', d3.forceX().x(function(d) { return d.x; }).strength(3))
                // .force('y', d3.forceY(1).strength(0.1))
                .force('collision', d3.forceCollide().radius(function() {
                  return 30;
                }))
                .alphaTarget(0)
                .on('tick', ticked);
            }

            function makeLineArrow() {
              // build the arrow.
              svg.append('svg:defs').selectAll('marker')
                .data(['end'])      // Different link/path types can be defined here
                .enter().append('svg:marker')    // This section adds in the arrows
                .attr('id', String)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 100)
                .attr('refY', 0)
                .attr('markerWidth', 8)
                .attr('markerHeight', 8)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5');
            }

            function zoom_actions() {
              g.attr('transform', d3.event.transform);
            }

            function spiderWeb(node, levels) {
              drawCustomers(rootNode, levels, width / 2);
              drawSuppliers(rootNode, levels, width / 2);
            }

            function drawCustomers(root, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getCustomers({ 'enterpriseId': root.enterpriseId }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.customers.length; i++) {
                    var newNode = res.customers[i];
                    newNode.x = x + xStep;
                    newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    links.push({ source: root, target: newNode });
                  }
                  restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawCustomers(tmpNode[j], levels - 1, x + xStep);
                  }
                });
              }
            }

            function drawSuppliers(root, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getSuppliers({ 'enterpriseId': root.enterpriseId }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.suppliers.length; i++) {
                    var newNode = res.suppliers[i];
                    newNode.x = x - xStep;
                    newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    links.push({ source: newNode, target: root });
                  }
                  restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawSuppliers(tmpNode[j], levels - 1, x - xStep);
                  }
                });
              }
            }

            function restart() {
              var defs = makeNodeImages();

              // Apply the general update pattern to the nodes.
              node = node.data(nodes, function(d) { return d.id;});
              node.exit().remove();
              node = node.enter().append('circle').attr('fill', function(d) { return color(d.id); }).attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; }).style('fill', function(d) { return 'url(#image' + d.enterpriseId + ')'; }).attr('r', radius).merge(node);
              // Apply node behaviors
              node = node
                .on('mouseover', mouseover)
                .on('mouseout', mouseout)
                .on('dblclick', function(d) {
                  d3.selectAll('text').remove();
                  d3.selectAll('rect').remove();
                  centerNode(d3.select(this)._groups[0][0]);
                  scope.$parent.vm.chooseCompany({ selected: d3.select(this)._groups[0][0].__data__ });
                })
                .on('click', menuClick);

              // Apply the general update pattern to the links.
              link = link.data(links, function(d) { return d.source.id + '-' + d.target.id; });
              link.exit().remove();
              link = link.enter().append('line').attr('marker-end', 'url(#end)').merge(link);

              // Update and restart the simulation.
              simulation.nodes(nodes);
              simulation.force('link').links(links);
              simulation.alpha(0.3).restart();
            }

            function mouseout(d) {
              d3.select(this).transition().duration(600).attr('r', radius);
            }

            // TODO Finish hover highlighting
            function mouseover(d) {
              d3.select(this).transition().duration(600).attr('r', radius * 2);
              console.log(d3.select(this));
              var id = d3.select(this)._groups[0][0].__data__.enterpriseId;
              console.log(id);
              var connectingLinks = links.filter(function(d) {
                if(d.source.enterpriseId === id || d.target.enterpriseId === id) {
                  return d;
                }
              });

              console.log(connectingLinks);
              var sourceLinks = connectingLinks.map(d => d.source.enterpriseId);
              var targetLinks = connectingLinks.map(d => d.target.enterpriseId);
              console.log(sourceLinks);
              console.log(targetLinks);
            }

            function ticked() {
              node.attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });

              link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
            }

            function menuClick(d, i) {
                  d3.selectAll('text').remove();
                  d3.selectAll('rect').remove();

                  d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', '');
                  d3.select(this).transition().duration(300)
                    .style('stroke', 'red')
                    .style('stroke-width', 5)
                    .attr('id', 'selected-circle');

                  var items = [
                    { 'func': centerNode, 'text': 'Center Graph on Company', 'y': 1 },
                    { 'func': viewCatalog, 'text': 'View Product/Service Catalog', 'y': 2 },
                    { 'func': viewDemands, 'text': 'View Demands', 'y': 3 },
                    { 'func': viewSuppliers, 'text': 'View Suppliers', 'y': 4 },
                    { 'func': viewCustomers, 'text': 'View Customers', 'y': 5 },
                    { 'func': viewCompetitors, 'text': 'View Competitors', 'y': 6 }
                  ];
                  var menuWidth = 200;
                  var itemHeight = 30;
                  var x = d3.select(this)._groups[0][0].cx.baseVal.value + 40;
                  if (x + menuWidth > width) {
                    x = x - 280;
                  }
                  var y = d3.select(this)._groups[0][0].cy.baseVal.value - 70;
                  var menuLen = items.length * itemHeight;
                  if (y + menuLen > height) {
                    y = y - 30;
                  }

                  menuItems = g.selectAll('rect').data(items).enter()
                      .append('rect').attr('class', 'conmenu-items')
                      .attr('width', menuWidth).attr('height', itemHeight)
                      .style('fill', '#d3d3d3')
                      .on('mouseout', function(d) {
                        d3.select(this).style('fill', '#d3d3d3');
                      })
                      .on('mouseover', function(d) {
                        d3.select(this).style('fill', '#fff');
                      })
                      .on('click', function(d) {
                        d3.selectAll('text').remove();
                        d3.selectAll('rect').remove();

                        if (d.func === centerNode) {
                          d.func(d3.select('#selected-circle')._groups[0][0]);
                        } else {
                          d.func(d3.select('#selected-circle')._groups[0][0].__data__);
                        }
                      })
                      .style('stroke', 'black')
                      .style('stroke-width', 0.5)
                      .attr('x', x)
                      .attr('y', function(d) {
                        return y + (30 * (d.y));
                      });

                    menuText = g.selectAll('text').data(items).enter()
                      .append('text')
                      .style('cursor', 'default')
                      .style('pointer-events', 'none')
                      .attr('x', x + 3)
                      .attr('y', function(d) {
                        return y + 20 + (30 * (d.y));
                      })
                      .text(function (d) { return d.text; });

            }

            function makeHomeButton() {
              var home = d3.select('#graph')
                    .append('span')
                    .style('margin-top', function() { return (header.offsetHeight - 30) + 'px';})
                    .attr('class', 'glyphicon glyphicon-home home')
                    .on('click', centerHome)
                    .on('mousedown', function() {
                      d3.select(this).style('color', 'gray');
                    })
                    .on('mouseup', function() {
                      d3.select(this).style('color', 'lightgray');
                    });
            }

            // TODO centerHome by ids
            // centerNode(node._groups[0][ID GOES HERE]);
            function centerHome() {
              centerNode(node._groups[0][0]);
            }

            function centerNode(node) {
              var x = centerX - node.cx.baseVal.value;
              var y = centerY - node.cy.baseVal.value;
              svg.transition()
                .duration(500)
                .call(zoom.transform, d3.zoomIdentity.translate(x, y));
            }

            function viewCompetitors(x) { scope.$parent.vm.viewCompetitors({ selected: x }); }
            function viewCustomers(x) { scope.$parent.vm.viewCustomers({ selected: x }); }
            function viewSuppliers(x) { scope.$parent.vm.viewSuppliers({ selected: x }); }
            function viewDemands(x) { scope.$parent.vm.viewDemands({ selected: x }); }
            function viewCatalog(x) { scope.$parent.vm.viewCatalog({ selected: x }); }
          });

          // d3.select('.footer').remove();
          // var headerBox = d3.select('header')._groups[0][0];
          // var header = getBounds(headerBox);
          // var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);

          // var widthBot = 0;
          // var heightBot = 0;
          // var width = $window.innerWidth;
          // // var height = $window.innerHeight - header.offsetHeight;
          // var height = $window.innerHeight;
          // var widthTop = width;
          // var heightTop = height;

          // d3.select('.display').style('height', function() { return (height + 1 - sideHeight.offsetTop - header.offsetHeight) + 'px';});
          // d3.select('.side-list').style('max-height', function() { return (height - header.offsetHeight - sideHeight.offsetTop - sideHeight.offsetHeight - 80) + 'px'; });
          // d3.select('.content').style('margin-top', function() { return header.offsetHeight + 'px';});

          // var svg = d3.select('#graph').append('svg')
          //       // .style('padding', '30px')
          //       .attr('width', width)
          //       .attr('height', height - header.offsetHeight - 5);

          // var radius = 25;
          // var nodes_data = [];
          // var links_data = [];

          // getGraph().then(function(rootNode) {
          //   // var nodes = obj;
          //   // var rootNodeId = obj.rootNode._id;
          //   // wrapCoordinates(nodes);

          //   // set up the simulation and add forces
          //   var simulation = d3.forceSimulation()
          //         .nodes(nodes_data)
          //         .on('tick', ticked);

          //   var link_force = d3.forceLink(links_data)
          //         .id(function(d) { return d.enterpriseId; })
          //         .distance(220)
          //         .strength(0);

          //   var charge_force = d3.forceManyBody()
          //         .strength(100);

          //   var center_force = d3.forceCenter(width / 2, height / 2);

          //   simulation
          //     .force('charge_force', charge_force)
          //     .force('center_force', center_force)
          //     .force('links', link_force)
          //     .force('x', d3.forceX().x(function(d) {
          //       return d.x;
          //     }).strength(0.5))
          //     .force('collision', d3.forceCollide().radius(function() {
          //       return radius + 10;
          //     }));

          //   // add encompassing group for the zoom
          //   var g = svg.append('g')
          //         .attr('class', 'everything');

          //   var defs = svg.append('defs')
          //         .selectAll('pattern')
          //         .data(nodes_data)
          //         .enter()
          //         .append('pattern')
          //         // .attr('id', function (d, i) { return 'image' + i; })
          //         .attr('x', 0)
          //         .attr('y', 0)
          //         .attr('height', radius * 2)
          //         .attr('width', radius * 2)
          //         .append('image')
          //         .attr('x', 0)
          //         .attr('y', 0)
          //         .attr('height', radius * 2)
          //         .attr('width', radius * 2)
          //         .attr('xlink:href', function (d) { return d.img; });

          //   // build the arrow.
          //   svg.append('svg:defs').selectAll('marker')
          //     .data(['end'])      // Different link/path types can be defined here
          //     .enter().append('svg:marker')    // This section adds in the arrows
          //     .attr('id', String)
          //     .attr('viewBox', '0 -5 10 10')
          //     .attr('refX', 190)
          //     .attr('refY', 0)
          //     .attr('markerWidth', 6)
          //     .attr('markerHeight', 6)
          //     .attr('orient', 'auto')
          //     .append('svg:path')
          //     .attr('d', 'M0,-5L10,0L0,5');

          //   // draw lines for the links
          //   var link = g.append('g')
          //         .attr('class', 'link')
          //         .selectAll('line')
          //         .data(links_data)
          //         .enter().append('line')
          //         .attr('stroke-width', 1)
          //         .style('stroke', 'black')
          //         .attr('marker-end', 'url(#end)')
          //         .attr('x1', function(d) { return d.source.x; })
          //         .attr('y1', function(d) { return d.source.y; })
          //         .attr('x2', function(d) { return d.target.x; })
          //         .attr('y2', function(d) { return d.target.y; });

          //   var menuText = g.append('text');
          //   var menuItems = g.append('rect');
          //   var node = '';

          //   makeNodes();

          //   function makeNodes() {

          //   // draw circles for the nodes
          //   node = g.append('g')
          //         .attr('class', 'node')
          //         .selectAll('circle')
          //         .data(nodes_data)
          //         .enter()
          //         .append('circle')
          //         .attr('cx', function(d) { return d.x; })
          //         .attr('cy', function(d) { return d.y; })
          //         .attr('r', radius)
          //         .style('fill', function(d, i) { return 'url(#image' + i + ')'; })
          //         .style('stroke', 'black')
          //         .style('stroke-width', 1)
          //         .on('dblclick', function(d) {

          //           d3.selectAll('text').remove();
          //           d3.selectAll('rect').remove();
          //           centerNode(d3.select(this)._groups[0][0]);
          //           scope.$parent.vm.chooseCompany({ selected: d3.select(this)._groups[0][0].__data__ });
          //         })
          //         .on('click', function(d, i) {
          //           d3.selectAll('text').remove();
          //           d3.selectAll('rect').remove();

          //           d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', '');
          //           d3.select(this).transition().duration(300)
          //             .style('stroke', 'red')
          //             .style('stroke-width', 5)
          //             .attr('id', 'selected-circle');

          //           var items = [
          //             { 'func': centerNode, 'text': 'Center Graph on Company', 'y': 1 },
          //             { 'func': viewCatalog, 'text': 'View Product/Service Catalog', 'y': 2 },
          //             { 'func': viewDemands, 'text': 'View Demands', 'y': 3 },
          //             { 'func': viewSuppliers, 'text': 'View Suppliers', 'y': 4 },
          //             { 'func': viewCustomers, 'text': 'View Customers', 'y': 5 },
          //             { 'func': viewCompetitors, 'text': 'View Competitors', 'y': 6 }
          //           ];
          //           var menuWidth = 200;
          //           var itemHeight = 30;
          //           var x = d3.select(this)._groups[0][0].cx.baseVal.value + 40;
          //           if (x + menuWidth > width) {
          //             x = x - 280;
          //           }
          //           var y = d3.select(this)._groups[0][0].cy.baseVal.value - 70;
          //           var menuLen = items.length * itemHeight;
          //           if (y + menuLen > height) {
          //             y = y - 30;
          //           }

          //           menuItems = g.selectAll('rect').data(items).enter()
          //             .append('rect').attr('class', 'conmenu-items')
          //             .attr('width', menuWidth).attr('height', itemHeight)
          //             .style('fill', '#d3d3d3')
          //             .on('mouseout', function(d) {
          //               d3.select(this).style('fill', '#d3d3d3');
          //             })
          //             .on('mouseover', function(d) {
          //               d3.select(this).style('fill', '#fff');
          //             })
          //             .on('click', function(d) {
          //               d3.selectAll('text').remove();
          //               d3.selectAll('rect').remove();

          //               if (d.func === centerNode) {
          //                 d.func(d3.select('#selected-circle')._groups[0][0]);
          //               } else {
          //                 d.func(d3.select('#selected-circle')._groups[0][0].__data__);
          //               }
          //             })
          //             .style('stroke', 'black')
          //             .style('stroke-width', 0.5)
          //             .attr('x', x)
          //             .attr('y', function(d) {
          //               return y + (30 * (d.y));
          //             });

          //           menuText = g.selectAll('text').data(items).enter()
          //             .append('text')
          //             .style('cursor', 'default')
          //             .style('pointer-events', 'none')
          //             .attr('x', x + 3)
          //             .attr('y', function(d) {
          //               return y + 20 + (30 * (d.y));
          //             })
          //             .text(function (d) { return d.text; });
          //         });
          //   }


          //   function addNodeToGraph(newNode) {
          //         node
          //         .selectAll('circle')
          //         .data(nodes_data)
          //         .enter()
          //         .append('circle')
          //         .attr('cx', function(d) { return d.x; })
          //         .attr('cy', function(d) { return d.y; })
          //         .attr('r', radius)
          //         .style('fill', function(d, i) { return 'url(#image' + i + ')'; })
          //         .style('stroke', 'black')
          //         .style('stroke-width', 1)
          //         .on('dblclick', function(d) {

          //           d3.selectAll('text').remove();
          //           d3.selectAll('rect').remove();
          //           centerNode(d3.select(this)._groups[0][0]);
          //           scope.$parent.vm.chooseCompany({ selected: d3.select(this)._groups[0][0].__data__ });
          //         })
          //         .on('click', function(d, i) {
          //           d3.selectAll('text').remove();
          //           d3.selectAll('rect').remove();

          //           d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', '');
          //           d3.select(this).transition().duration(300)
          //             .style('stroke', 'red')
          //             .style('stroke-width', 5)
          //             .attr('id', 'selected-circle');

          //           var items = [
          //             { 'func': centerNode, 'text': 'Center Graph on Company', 'y': 1 },
          //             { 'func': viewCatalog, 'text': 'View Product/Service Catalog', 'y': 2 },
          //             { 'func': viewDemands, 'text': 'View Demands', 'y': 3 },
          //             { 'func': viewSuppliers, 'text': 'View Suppliers', 'y': 4 },
          //             { 'func': viewCustomers, 'text': 'View Customers', 'y': 5 },
          //             { 'func': viewCompetitors, 'text': 'View Competitors', 'y': 6 }
          //           ];
          //           var menuWidth = 200;
          //           var itemHeight = 30;
          //           var x = d3.select(this)._groups[0][0].cx.baseVal.value + 40;
          //           if (x + menuWidth > width) {
          //             x = x - 280;
          //           }
          //           var y = d3.select(this)._groups[0][0].cy.baseVal.value - 70;
          //           var menuLen = items.length * itemHeight;
          //           if (y + menuLen > height) {
          //             y = y - 30;
          //           }

          //           menuItems = g.selectAll('rect').data(items).enter()
          //             .append('rect').attr('class', 'conmenu-items')
          //             .attr('width', menuWidth).attr('height', itemHeight)
          //             .style('fill', '#d3d3d3')
          //             .on('mouseout', function(d) {
          //               d3.select(this).style('fill', '#d3d3d3');
          //             })
          //             .on('mouseover', function(d) {
          //               d3.select(this).style('fill', '#fff');
          //             })
          //             .on('click', function(d) {
          //               d3.selectAll('text').remove();
          //               d3.selectAll('rect').remove();

          //               if (d.func === centerNode) {
          //                 d.func(d3.select('#selected-circle')._groups[0][0]);
          //               } else {
          //                 d.func(d3.select('#selected-circle')._groups[0][0].__data__);
          //               }
          //             })
          //             .style('stroke', 'black')
          //             .style('stroke-width', 0.5)
          //             .attr('x', x)
          //             .attr('y', function(d) {
          //               return y + (30 * (d.y));
          //             });

          //           menuText = g.selectAll('text').data(items).enter()
          //             .append('text')
          //             .style('cursor', 'default')
          //             .style('pointer-events', 'none')
          //             .attr('x', x + 3)
          //             .attr('y', function(d) {
          //               return y + 20 + (30 * (d.y));
          //             })
          //             .text(function (d) { return d.text; });
          //         });
          //   }

          //   makeHomeButton();

          //   var zoom = d3.zoom()
          //         .scaleExtent([1 / 2, 1.2])
          //         .on('zoom', zoom_actions);

          //   svg.call(zoom);
          //   d3.select('svg').on('dblclick.zoom', null);

          //   spiderWeb(rootNode);

          //   /** Functions **/

          //   function drawNode() {
          //     node = node.data(nodes_data, function(d) { return d.enterpriseId; });
          //     simulation = simulation.nodes(nodes_data);

          //     // defs = defs.data(nodes_data);

          //     simulation.alpha(0.3).restart();
          //   }

          //   function spiderWeb(root) {
          //     root.x = width / 2;
          //     root.y = height / 2;
          //     root.img = 'http://www.e-pint.com/epint.jpg';

          //     nodes_data.push(root);
          //     drawNode();

          //     addLevelsToGraph(2, root);
          //   }

          //   function drawLink() {
          //     link = link.data(links_data, function(d) { return d.source.id + '-' + d.target.id; });
          //     link_force = d3.forceLink(links_data);
          //   }

          //   function addLevelsToGraph(levels, root) {
          //     EnterprisesService.getCustomers({'enterpriseId': root.enterpriseId}).then(function (res) {
          //       var nodes = res.customers;
          //       for (var i = 0; i < nodes.length; i++) {
          //         var newNode = nodes[i];
          //         newNode.x = width / 2 - 200;
          //         newNode.y = height / 2;

          //         nodes_data.push(newNode);
          //         drawNode();

          //         // var oldNode = root;
          //         // links_data.push(
          //         //   { 'source': oldNode, 'target': newNode }
          //         // );
          //         // drawLink();
          //       }
          //       console.log(nodes);
          //     });

          //     EnterprisesService.getSuppliers({'enterpriseId': root.enterpriseId}).then(function (res) {
          //       var nodes = res.suppliers;
          //       for (var i = 0; i < nodes.length; i++) {
          //         var newNode = nodes[i];
          //         newNode.x = width / 2 + 200;
          //         newNode.y = height / 2;

          //         nodes_data.push(newNode);
          //         drawNode();
          //         // var oldNode = root;
          //         // links_data.push(
          //         //   { 'source': newNode, 'target': oldNode }
          //         // );
          //         // drawLink();
          //       }
          //       console.log(nodes);
          //     });
          //   }

          //   function makeHomeButton() {
          //     var home = d3.select('#graph')
          //           .append('span')
          //           .style('margin-top', function() { return (header.offsetHeight - 30) + 'px';})
          //           .attr('class', 'glyphicon glyphicon-home home')
          //           .on('click', centerHome)
          //           .on('mousedown', function() {
          //             d3.select(this).style('color', 'gray');
          //           })
          //           .on('mouseup', function() {
          //             d3.select(this).style('color', 'lightgray');
          //           });
          //   }

          //   function centerHome() {
          //     centerNode(node._groups[0][nodes.rootNode.index]);
          //   }

          //   var centerX = width / 2;
          //   var centerY = height / 2;

          //   function centerNode(node) {
          //     var x = centerX - node.cx.baseVal.value;
          //     var y = centerY - node.cy.baseVal.value;
          //     svg.transition()
          //       .duration(500)
          //       .call(zoom.transform, d3.zoomIdentity.translate(x, y));
          //   }


          //   function viewCompetitors(x) {
          //     scope.$parent.vm.viewCompetitors({ selected: x });
          //   }

          //   function viewCustomers(x) {
          //     scope.$parent.vm.viewCustomers({ selected: x });
          //   }

          //   function viewSuppliers(x) {
          //     scope.$parent.vm.viewSuppliers({ selected: x });
          //   }

          //   function viewDemands(x) {
          //     scope.$parent.vm.viewDemands({ selected: x });
          //   }

          //   function viewCatalog(x) {
          //     scope.$parent.vm.viewCatalog({ selected: x });
          //   }

          //   function ticked() {
          //     node
          //       .attr('cx', function(d) { return d.x; })
          //       .attr('cy', function(d) { return d.y; });
          //     link
          //       .attr('x1', function(d) { return d.source.x; })
          //       .attr('y1', function(d) { return d.source.y; })
          //       .attr('x2', function(d) { return d.target.x; })
          //       .attr('y2', function(d) { return d.target.y; });
          //   }

          //   // Zoom functions
          //   function zoom_actions() {
          //     // console.log(d3.event.transform);
          //     // heightBot
          //     // heightTop
          //     // widthBot
          //     // widthTop

          //     g.attr('transform', d3.event.transform);
          //   }

          //   function getY(arr, item, prevY) {
          //     var len = arr.length + 1;
          //     var pixels = height / len;

          //     prevY = prevY + pixels;

          //     if (prevY + pixels >= height) {
          //       var y = prevY;
          //       prevY = 0;
          //       return y;
          //     }
          //     return prevY;
          //   }

          //   // addNodeAndLink({ enterpriseId: rootNodeId }, { x: 10, y: 20, enterpriseId: '1234' }, 'suppliers');
          //   // addNodeAndLink({ enterpriseId: rootNodeId }, { x: 10, y: 20, enterpriseId: '1234' }, 'customers');

          //   makeNodes();

          //   function addNodeAndLink(oldNode, newNode, name) {
          //     var newLink = { 'source': null, 'target': null };
          //     if (name === 'suppliers') {
          //       newLink.source = newNode.enterpriseId;
          //       newLink.target = oldNode.enterpriseId;
          //     } else if (name === 'customers') {
          //       newLink.source = oldNode.enterpriseId;
          //       newLink.target = newNode.enterpriseId;
          //     } else {
          //       return;
          //     }

          //     console.log(nodes_data);
          //     console.log(links_data);
          //     nodes_data = nodes_data.concat(newNode);
          //     links_data = links_data.concat(newLink);
          //     console.log(nodes_data);
          //     console.log(links_data);

          //     // makeNodes();

          //     simulation.nodes(nodes_data);
          //     // simulation.force('link').links(links_data);
          //     simulation.alpha(0.2).restart();
          //   }

          //   function wrapCoordinates(nodes) {
          //     var SUP_X = width / 4;
          //     var COM_X = width / 4 + width / 4;
          //     var CUS_X = width / 4 + width / 4 + width / 4;
          //     var index;
          //     var y;
          //     var linkIndex = 0;

          //     for (var item in nodes) {
          //       if (item === 'customer') {
          //         y = 0;
          //         for (index = 0; index < nodes[item].length; index++) {
          //           nodes[item][index].x = CUS_X;
          //           y = getY(nodes[item], item, y);
          //           nodes[item][index].y = y;
          //           nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
          //           nodes_data.push(nodes[item][index]);

          //           links_data[linkIndex] = { 'source': null, 'target': null };
          //           links_data[linkIndex].source = rootNodeId;
          //           links_data[linkIndex].target = nodes[item][index].enterpriseId;
          //           linkIndex++;
          //         }
          //       } else if (item === 'supplier') {
          //         y = 0;
          //         for (index = 0; index < nodes[item].length; index++) {
          //           nodes[item][index].x = SUP_X;
          //           y = getY(nodes[item], item, y);
          //           nodes[item][index].y = y;
          //           nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';
          //           nodes_data.push(nodes[item][index]);

          //           links_data[linkIndex] = { 'source': null, 'target': null };
          //           links_data[linkIndex].source = nodes[item][index].enterpriseId;
          //           links_data[linkIndex].target = rootNodeId;
          //           linkIndex++;
          //         }
          //       } else if (item === 'competitor') {
          //         y = 0;
          //         for (index = 0; index < nodes[item].length; index++) {
          //           nodes[item][index].x = COM_X;
          //           y = getY(nodes[item], item, y);
          //           nodes[item][index].y = y;
          //           nodes[item][index].img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/pencil-gear-128.png';
          //           nodes_data.push(nodes[item][index]);
          //         }
          //       } else if (item === 'rootNode') {
          //         nodes[item].x = width / 2;
          //         nodes[item].y = height / 2;
          //         nodes[item].img = 'http://www.e-pint.com/epint.jpg';
          //         nodes[item].enterpriseId = nodes[item]._id;
          //         nodes_data.push(nodes[item]);
          //       }
          //     }
          //     console.log(nodes);
          //   }
          // });
        });

        function getGraph() {
          // EnterprisesService.setupGraph().then(function (res) {
          //   console.log(res);
          // });
          return EnterprisesService.getEnterprise()
            .then(function(response) {
              console.log(response);
              var rootNode = {};
              rootNode.companyName = response.profile.companyName;
              rootNode._id = response._id;
              rootNode.enterpriseId = response._id;
              rootNode.URL = response.profile.URL;
              return rootNode;
            });
        }

        function getBounds(htmlElement) {
          return {
            offsetHeight: htmlElement.offsetHeight,
            offsetLeft: htmlElement.offsetLeft,
            offsetParent: htmlElement.offsetParent,
            offsetTop: htmlElement.offsetTop,
            offsetWidth: htmlElement.offsetWidth
          };
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
