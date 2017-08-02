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
        var levels = 2;
        var radius = 20;

        d3().then(function(d3) {
          var header = getBounds(d3.select('header')._groups[0][0]);
          var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);
          var footer = getBounds(d3.select('footer')._groups[0][0]);

          var width = $window.innerWidth;
          var height = $window.innerHeight;

          d3.select('.display').style('height', function() {
            return (height - sideHeight.offsetTop - header.offsetHeight) + 'px';
          });
          d3.select('.side-list').style('max-height', function() {
            return (height - header.offsetHeight - sideHeight.offsetTop - sideHeight.offsetHeight - 80) + 'px';
          });
          d3.select('.content').style('margin-top', function() {
            return header.offsetHeight + 'px';
          });


          var svg = d3.select('.graph')
                .append('svg')
                .attr('width', width)
                .attr('height', height - header.offsetHeight - footer.offsetHeight - 20);

          var i = 0;
          var duration = 750;

          var group = svg.append('g').attr('class', 'everything');

          var zoomListener = d3.zoom()
                .scaleExtent([1 / 2, 1.5])
                .on('zoom', zoom);

          svg.call(zoomListener);
          d3.select('svg').on('dblclick.zoom', null);

          function zoom() {
            group.attr('transform', d3.event.transform);
          }

          getGraph().then(function(rootNode) {
            centerHome();
            makeHomeButton();
            getThreeCustLevels(rootNode).then(function(data1) {
              getThreeSuppLevels(rootNode).then(function(data2) {

                getGraphSuppliers(rootNode);
                // Create d3 hierarchies
                var right = d3.hierarchy(data1);
                var left = d3.hierarchy(data2);
                var count = 0;

                // Render both trees
                drawTree(right, 'right');
                drawTree(left, 'left');


                // draw single tree
                function drawTree(root, pos) {

                  var SWITCH_CONST = 1;
                  if (pos === 'left') {
                    SWITCH_CONST = -1;
                  }

                  var width = +svg.attr('width'),
                    height = +svg.attr('height');

                  var g = d3.select('.everything').append('g');

                  // Create new default tree layout
                  var tree = d3.tree()
                    .nodeSize([radius / 1.5, radius * 10])
                    .separation(function(a, b) {
                      return a.parent === b.parent ? 8 : 3;
                    });
                  // Set the size
                  // Remember the tree is rotated
                  // so the height is used as the width
                  // and the width as the height

                  tree(root);

                  var nodes = root.descendants();
                  var links = root.links();
                  // Set both root nodes to be dead center vertically

                  nodes.forEach(function(node) {
                    if (node.y !== 0) node.y = node.y * SWITCH_CONST;
                  });

                  var link = g.selectAll('.link-' + pos)
                        .data(links)
                        .enter();

                  link.append('path')
                    .attr('class', 'link-' + pos)
                    .attr('d', function(d) {
                      return 'M' + d.target.y + ',' + d.target.x +
                        'C' + (d.target.y + d.source.y) / 2.5 + ',' + d.target.x +
                        ' ' + (d.target.y + d.source.y) / 2 + ',' + d.source.x +
                        ' ' + d.source.y + ',' + d.source.x;
                    });

                  var tmp = count;
                  var defs = svg.append('defs')
                        .selectAll('pattern')
                        .data(nodes)
                        .enter()
                        .append('pattern')
                        .attr('id', function () { return 'image' + count++; })
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('height', radius * 2)
                        .attr('width', radius * 2)
                        .append('image')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('height', radius * 2)
                        .attr('width', radius * 2)
                        .attr('xlink:href', function (d) { return d.data.img; });

                  // Create nodes
                  var node = g.selectAll('.node-' + pos)
                        .data(nodes)
                        .enter()
                        .append('g')
                        .attr('class', function(d) {
                          return 'node-' + pos + (d.children ? ' node--internal' : ' node--leaf');
                        })
                        .attr('transform', function(d) {
                          return 'translate(' + d.y + ',' + d.x + ')';
                        });

                  node
                    .append('circle')
                    .style('fill', function(d, i) { return 'url(#image' + (i + tmp) + ')'; })
                    .attr('id', function(d, i) { return 'node' + (i + tmp); })
                    .attr('node-num', function(d, i) { return (i + tmp); })
                    .attr('r', radius);

                  node
                    // .on('dblclick', function(d) {
                    //   d3.selectAll('text').remove();
                    //   d3.selectAll('rect').remove();
                    //   centerNode(d3.select(this)._groups[0][0].__data__);
                    //   scope.$parent.vm.chooseCompany({ selected: d3.select(this)._groups[0][0].__data__.data });
                    // })
                    .on('click', function(d, i) {
                      console.log(d);
                      d3.selectAll('text').remove();
                      d3.selectAll('rect').remove();
                      centerNode(d3.select(this)._groups[0][0].__data__);


                      d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', function(d, i) { return 'node' + i; });
                      d3.select(this).transition().duration(300)
                        .style('stroke', 'red')
                        .style('stroke-width', 5)
                        .attr('id', 'selected-circle');

                      var items = [
                        { 'func': removeGraph, 'text': 'See this Company\'s Graph', 'y': 1 },
                        { 'func': viewCatalog, 'text': 'See Product & Service Catalog', 'y': 2 },
                        { 'func': viewDemands, 'text': 'See Demands', 'y': 3 },
                        { 'func': viewSuppliers, 'text': 'See Suppliers', 'y': 4 },
                        { 'func': viewCustomers, 'text': 'See Customers', 'y': 5 },
                        { 'func': viewCompetitors, 'text': 'See Competitors', 'y': 6 }
                      ];

                      var menuWidth = 200;
                      var itemHeight = 30;
                      var menuHeight = itemHeight * items.length;
                      var coords = getScreenCoords(d3.select(this)._groups[0][0].__data__.x,
                                                   d3.select(this)._groups[0][0].__data__.y,
                                                   menuHeight,
                                                   menuWidth);

                      var x = coords.x;
                      var y = coords.y;

                      var menuItems = g.selectAll('rect').data(items).enter()
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
                                d.func(d3.select('#selected-circle')._groups[0][0].__data__);
                              } else {
                                d.func(d3.select('#selected-circle')._groups[0][0].__data__.data);
                              }
                            })
                            .style('stroke', 'black')
                            .style('stroke-width', 0.5)
                            .attr('x', x)
                            .attr('y', function(d) {
                              return y + (30 * (d.y));
                            });

                      var menuText = g.selectAll('text').data(items).enter()
                            .append('text')
                            .style('cursor', 'default')
                            .style('pointer-events', 'none')
                            .attr('x', x + 3)
                            .attr('y', function(d) {
                              return y + 20 + (30 * (d.y));
                            })
                            .text(function (d) { return d.text; });
                    });

                  // node.append('text')
                  //   .attr('dy', 30)
                  //   .style('text-anchor', 'middle')
                  //   .text(function(d) {
                  //     return d.data.companyName;
                  //   });
                }
              });
            });

            //
            // functions!
            //
            function getScreenCoords(x, y, menuHeight, menuWidth) {
              var xn = y + 30;
              var yn = x - 50;
              return { x: xn, y: yn };
            }

            function makeHomeButton() {
              var home = d3.select('.graph')
                .append('span')
                .attr('id', 'home-button')
                .style('margin-top', function() { return (header.offsetHeight - 30) + 'px'; })
                .attr('class', 'glyphicon glyphicon-home home')
                .on('click', centerHome)
                .on('mousedown', function() {
                  d3.select(this).style('color', 'gray');
                })
                .on('mouseup', function() {
                  d3.select(this).style('color', 'lightgray');
                });
            }

            function centerNode(source) {
              var t = d3.zoomTransform(group.node());
              var x = -source.y;
              var y = -source.x;
              x = x * t.k + width / 2;
              y = y * t.k + height / 2;
              d3.selectAll('svg')
                .transition()
                .duration(duration)
                .call(zoomListener.transform, d3.zoomIdentity.translate(x, y).scale(t.k));
            }

            function centerHome() {
              rootNode.x = 0;
              rootNode.y = 0;
              centerNode(rootNode);
            }

            function viewCompetitors(x) {
              scope.$parent.vm.viewCompetitors({ selected: x });
            }

            function viewCustomers(x) {
              scope.$parent.vm.viewCustomers({ selected: x });
            }

            function viewSuppliers(x) {
              scope.$parent.vm.viewSuppliers({ selected: x });
            }

            function viewDemands(x) {
              scope.$parent.vm.viewDemands({ selected: x });
            }

            function viewCatalog(x) {
              scope.$parent.vm.viewCatalog({ selected: x });
            }
          });

          function getGraphSuppliers(obj) {
            var data = obj;
            getAllLeafNodes(data);
          }

          function getAllLeafNodes(data) {
            var leafNodes = [];
            if (data.hasOwnProperty('children')) {
              for (var i = 0; i < data.children.length; i++) {
                leafNodes = leafNodes.concat(getAllLeafNodes(data.children[i]));
              }

              // for (i = 0; i < leafNodes.length; i++) {
              //   leafNodes = leafNodes.concat(getAllLeafNodes(leafNodes[i]));
              // }
              console.log(leafNodes);
              // return [];
            } else {
              leafNodes.push(data);
            }
            return leafNodes;
          }

          function getThreeSuppLevels(data) {
            return new Promise(function(resolve, reject) {
              getSuppliers(data._id).then(function (res) {
                data.children = res.suppliers;

                data.children.forEach(child => getSuppliers(child._id).then(function(obj) {
                  child.children = obj.suppliers;
                  return child;
                }));
                resolve(data);
              });
            });
          }

          function getThreeCustLevels(data) {
            return new Promise(function(resolve, reject) {
              getCustomers(data._id).then(function (res) {
                data.children = res.customers;

                data.children.forEach(child => getCustomers(child._id).then(function(obj) {
                  child.children = obj.customers;
                  return child;
                }));
                resolve(data);
              });
            });
          }

          function getSuppliers(id) {
            return EnterprisesService.getSuppliers({ 'enterpriseId': id });
          }

          function getCustomers(id) {
            return EnterprisesService.getCustomers({ 'enterpriseId': id });
          }

          function getGraph() {
            // EnterprisesService.setupGraph().then(function (res) {
            //   console.log(res);
            // });
            return EnterprisesService.getEnterprise()
              .then(function(response) {
                var rootNode = {};
                rootNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                rootNode.companyName = response.profile.companyName;
                rootNode._id = response._id;
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

          function removeGraph() {
            d3.select('.everything').remove();
            d3.select('#home-button').remove();
          }
        });

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
