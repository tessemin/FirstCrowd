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
        var g_levels = 2;
        var g_height = 600;
        var g_width = 1000;
        var radius = 20;
        d3().then(function(d3) {
          console.log(scope);
          // if ($scope)
          getGraph().then(function(enterpriseData) {
            d3.select('.footer').remove();
            var header = getBounds(d3.select('header')._groups[0][0]);
            var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);

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

            var svg = d3.select('#graph').append('svg')
                  .attr('width', width)
                  .attr('height', height - header.offsetHeight - 5);

            var g = svg.append('g');
            var i = 0;
            var duration = 750;

            getThreeCustLevels(enterpriseData).then(function(data) {
              getThreeSuppLevels(enterpriseData).then(function(data2) {

                // declares a tree layout and assigns the size
                // var treemap = d3.tree().size([height, width]);
                var treemap2 = d3.tree()
                      .nodeSize([10, 10])
                      .separation(function(a, b) {
                        return a.parent === b.parent ? 8 : 3;
                      });

                var root2 = d3.hierarchy(data2, function(d) { return d.children; });
                console.log(root2);
                // Assigns parent, children, height, depth
                root2.x0 = height / 2;
                root2.y0 = 0;

                updateSupp(root2);
                // makeLineArrow();
                centerHome();
                makeHomeButton();


                function updateSupp(source) {
                  // Assigns the x and y position for the nodes
                  var treeData = treemap2(root2);

                  // Compute the new tree layout.
                  var nodes = treeData.descendants();
                  var links = treeData.descendants().slice(1);

                  // Normalize for fixed-depth.
                  nodes.forEach(function(d) { d.y = -d.depth * 180; });


                  var defs = svg.append('defs')
                        .selectAll('pattern')
                        .data(nodes)
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
                        .attr('xlink:href', function (d) { return d.data.img; });

                  // ****************** Nodes section ***************************

                  // Update the nodes...
                  var node = g.selectAll('.node')
                        .data(nodes, function(d) { return d.id || (d.id = ++i); });

                  // Enter any new modes at the parent's previous position.
                  var nodeEnter = node.enter().append('g')
                        .attr('class', 'node')
                        .attr('transform', function(d) {
                          return 'translate(' + source.y0 + ',' + source.x0 + ')';
                        })
                        .on('click', clickSupp);

                  // Add Circle for the nodes
                  nodeEnter.append('circle')
                    .attr('class', 'node')
                    .transition()
                    .duration(duration)
                    .attr('r', 1e-6)
                    .style('fill', function(d, i) { return 'url(#image' + i + ')'; });
                  // .style('fill', function(d) {
                  //   return d._children ? 'lightsteelblue' : 'red';
                  // });

                  // Add labels for the nodes
                  nodeEnter.append('text')
                    .style('pointer-events', 'none')
                  // .attr('dy', '.35em')
                    .attr('x', function(d) {
                      return d.children || d._children ? -13 : 13;
                    })
                    .attr('y', function(d) {
                      return d.children || d._children ? -13 : 13;
                    })
                    .attr('text-anchor', function(d) {
                      return d.children || d._children ? 'end' : 'start';
                    })
                    .text(function(d) { return d.data.companyName; });

                  // UPDATE
                  var nodeUpdate = nodeEnter.merge(node);

                  // Transition to the proper position for the node
                  nodeUpdate.transition()
                    .duration(duration)
                    .attr('transform', function(d) {
                      return 'translate(' + d.y + ',' + d.x + ')';
                    });

                  // Update the node attributes and style
                  nodeUpdate.select('circle.node')
                    .transition()
                    .duration(duration)
                    .attr('r', radius)
                    .style('fill', function(d, i) { return 'url(#image' + i + ')'; })
                  // .style('fill', function(d) {
                  //   return d._children ? 'lightsteelblue' : 'red';
                  // })
                    .attr('cursor', 'pointer');

                  defs.data(nodes);

                  // Remove any exiting nodes
                  var nodeExit = node.exit();
                  // .attr('transform', function(d) {
                  //   return 'translate(' + source.y + ',' + source.x + ')';
                  // })
                  // .remove();

                  // On exit reduce the node circles size to 0
                  nodeExit.select('circle')
                    .transition()
                    .duration(duration)
                    .attr('r', 1e-6);

                  // On exit reduce the opacity of text labels
                  nodeExit.select('text')
                    .style('fill-opacity', 1e-6);

                  // ****************** links section ***************************
                  // link = link.enter().append('line').attr('marker-end', 'url(#end)').merge(link);
                  // Update the links...
                  var link = g.selectAll('path.link')
                        .data(links, function(d) { return d.id; });

                  // Enter any new links at the parent's previous position.
                  var linkEnter = link.enter().insert('path', 'g')
                        .attr('class', 'link')
                        .attr('marker-end', 'url(#end)')
                        .attr('d', function(d) {
                          var o = { x: source.x0, y: source.y0 };
                          return diagonalS(o, o);
                        });

                  // UPDATE
                  var linkUpdate = linkEnter.merge(link);

                  // Transition back to the parent element position
                  linkUpdate.transition()
                    .duration(duration)
                    .attr('d', function(d) { return diagonalS(d, d.parent); });

                  // Remove any exiting links
                  var linkExit = link.exit().transition()
                        .duration(duration)
                        .attr('d', function(d) {
                          var o = { x: source.x, y: source.y };
                          return diagonalS(o, o);
                        })
                        .remove();

                  // Store the old positions for transition.
                  nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                  });
                }

                // Toggle children on click.
                function clickSupp(d) {
                  console.log('supp');
                  centerNode(d);
                  if (d.children) {
                    d._children = d.children;
                    d.children = null;
                  } else {
                    d.children = d._children;
                    d._children = null;
                  }
                  updateSupp(d);
                }


                function diagonalS(s, d) {

                  var path = `M ${ s.y } ${ s.x }
            C ${ (s.y + d.y) / 2 } ${ s.x },
              ${ (s.y + d.y) / 2 } ${ d.x },
              ${ d.y } ${ d.x }`;

                  return path;
                }
              });


              // declares a tree layout and assigns the size
              // var treemap = d3.tree().size([height, width]);
              var treemap = d3.tree()
                    .nodeSize([10, 10])
                    .separation(function(a, b) {
                      return a.parent === b.parent ? 8 : 3;
                    });
              // var treeData = {
              //   'name': 'Top Level',
              //   'children': [
              //     {
              //       'name': 'Level 2: A',
              //       'children': [
              //         { 'name': 'Son of A' },
              //         { 'name': 'Daughter of A' }
              //       ]
              //     },
              //     { 'name': 'Level 2: B' }
              //   ]
              // };

              var zoomListener = d3.zoom()
                    .scaleExtent([1 / 2, 1.5])
                    .on('zoom', zoom);

              svg.call(zoomListener);
              d3.select('svg').on('dblclick.zoom', null);

              var root = d3.hierarchy(data, function(d) { return d.children; });

              // Assigns parent, children, height, depth
              root.x0 = height / 2;
              root.y0 = 0;





              // Collapse after the second level
              // root.children.forEach(collapse);

              updateCust(root);
              // makeLineArrow();
              centerHome();
              makeHomeButton();

              //
              // functions
              //
              function makeHomeButton() {
                var home = d3.select('#graph')
                      .append('span')
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

              function makeLineArrow() {
                // build the arrow.
                svg.append('svg:defs').selectAll('marker')
                  .data(['end'])      // Different link/path types can be defined here
                  .enter().append('svg:marker')    // This section adds in the arrows
                  .attr('id', String)
                  .attr('viewBox', '0 -5 10 10')
                  .attr('refX', 150)
                  .attr('refY', 0)
                  .attr('markerWidth', 8)
                  .attr('markerHeight', 8)
                  .attr('orient', 'auto')
                  .append('svg:path')
                  .attr('d', 'M0,-5L10,0L0,5');
              }

              // Collapse the node and all it's children
              function collapse(d) {
                if (d.children) {
                  d._children = d.children;
                  d._children.forEach(collapse);
                  d.children = null;
                }
              }

              function updateCust(source) {
                // Assigns the x and y position for the nodes
                var treeData = treemap(root);

                // Compute the new tree layout.
                var nodes = treeData.descendants();
                var links = treeData.descendants().slice(1);

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });


                var defs = svg.append('defs')
                      .selectAll('pattern')
                      .data(nodes)
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
                      .attr('xlink:href', function (d) { return d.data.img; });

                // ****************** Nodes section ***************************

                // Update the nodes...
                var node = g.selectAll('.node')
                      .data(nodes, function(d) { return d.id || (d.id = ++i); });

                // Enter any new modes at the parent's previous position.
                var nodeEnter = node.enter().append('g')
                      .attr('class', 'node')
                      .attr('transform', function(d) {
                        return 'translate(' + source.y0 + ',' + source.x0 + ')';
                      })
                      .on('click', clickCust);

                // Add Circle for the nodes
                nodeEnter.append('circle')
                  .attr('class', 'node')
                  .transition()
                  .duration(duration)
                  .attr('r', 1e-6)
                  .style('fill', function(d, i) { return 'url(#image' + i + ')'; });
                // .style('fill', function(d) {
                //   return d._children ? 'lightsteelblue' : 'red';
                // });

                // Add labels for the nodes
                nodeEnter.append('text')
                  .style('pointer-events', 'none')
                // .attr('dy', '.35em')
                  .attr('x', function(d) {
                    return d.children || d._children ? -13 : 13;
                  })
                  .attr('y', function(d) {
                    return d.children || d._children ? -13 : 13;
                  })
                  .attr('text-anchor', function(d) {
                    return d.children || d._children ? 'end' : 'start';
                  })
                  .text(function(d) { return d.data.companyName; });

                // UPDATE
                var nodeUpdate = nodeEnter.merge(node);

                // Transition to the proper position for the node
                nodeUpdate.transition()
                  .duration(duration)
                  .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                  });

                // Update the node attributes and style
                nodeUpdate.select('circle.node')
                  .transition()
                  .duration(duration)
                  .attr('r', radius)
                  .style('fill', function(d, i) { return 'url(#image' + i + ')'; })
                // .style('fill', function(d) {
                //   return d._children ? 'lightsteelblue' : 'red';
                // })
                  .attr('cursor', 'pointer');

                defs.data(nodes);

                // Remove any exiting nodes
                var nodeExit = node.exit();
                // .attr('transform', function(d) {
                //   return 'translate(' + source.y + ',' + source.x + ')';
                // })
                // .remove();

                // On exit reduce the node circles size to 0
                nodeExit.select('circle')
                  .transition()
                  .duration(duration)
                  .attr('r', 1e-6);

                // On exit reduce the opacity of text labels
                nodeExit.select('text')
                  .style('fill-opacity', 1e-6);

                // ****************** links section ***************************
                // link = link.enter().append('line').attr('marker-end', 'url(#end)').merge(link);
                // Update the links...
                var link = g.selectAll('path.link')
                      .data(links, function(d) { return d.id; });

                // Enter any new links at the parent's previous position.
                var linkEnter = link.enter().insert('path', 'g')
                      .attr('class', 'link')
                      .attr('marker-end', 'url(#end)')
                      .attr('d', function(d) {
                        var o = { x: source.x0, y: source.y0 };
                        return diagonal(o, o);
                      });

                // UPDATE
                var linkUpdate = linkEnter.merge(link);

                // Transition back to the parent element position
                linkUpdate.transition()
                  .duration(duration)
                  .attr('d', function(d) { return diagonal(d, d.parent); });

                // Remove any exiting links
                var linkExit = link.exit().transition()
                      .duration(duration)
                      .attr('d', function(d) {
                        var o = { x: source.x, y: source.y };
                        return diagonal(o, o);
                      })
                      .remove();

                // Store the old positions for transition.
                nodes.forEach(function(d) {
                  d.x0 = d.x;
                  d.y0 = d.y;
                });
              }
              // Creates a curved (diagonal) path from parent to the child nodes
              function diagonal(s, d) {

                var path = `M ${ s.y } ${ s.x }
            C ${ (s.y + d.y) / 2 } ${ s.x },
              ${ (s.y + d.y) / 2 } ${ d.x },
              ${ d.y } ${ d.x }`;

                return path;
              }

              function centerNode(source) {
                var t = d3.zoomTransform(svg.node());
                var x = -source.y0;
                var y = -source.x0;
                x = x * t.k + width / 2;
                y = y * t.k + height / 2;
                d3.select('svg')
                  .transition()
                  .duration(duration)
                  .call(zoomListener.transform, d3.zoomIdentity.translate(x, y).scale(t.k));
              }

              // Toggle children on click.
              function clickCust(d) {
                console.log('cust');
                centerNode(d);
                if (d.children) {
                  d._children = d.children;
                  d.children = null;
                } else {
                  d.children = d._children;
                  d._children = null;
                }
                updateCust(d);
              }

              function centerHome() {
                centerNode(root);
              }

              function zoom() {
                g.attr('transform', d3.event.transform);
              }

            });

            //
            // functions
            //
            function getThreeSuppLevels(data) {
              return new Promise(function(resolve, reject) {
                getSuppliers(data._id).then(function (res) {
                  data.children = res.suppliers;

                  data.children.forEach(child => getSuppliers(child._id).then(function(obj) {
                    child.children = obj.suppliers;
                    return child;
                    // console.log(data.children[i]);
                  })
                                       );

                  // for(var i = 0; i < data.children.length; i++) {
                  //   console.log(data.children[i]);
                  //   data.children[i].children.forEach(child => getCustomers(child._id).then(function(obj) {
                  //     return child.children = obj.customers;
                  //     // console.log(data.children[i]);
                  //  })
                  //                                    );
                  // }
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
                    // console.log(data.children[i]);
                  })
                                       );

                  // for(var i = 0; i < data.children.length; i++) {
                  //   console.log(data.children[i]);
                  //   data.children[i].children.forEach(child => getCustomers(child._id).then(function(obj) {
                  //     return child.children = obj.customers;
                  //     // console.log(data.children[i]);
                  //  })
                  //                                    );
                  // }
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

            function createNewGraph(rootNode) {
              // console.log(rootNode);

              spiderWeb(rootNode);

              // console.log('hi', rootNode);
              // console.log(root);

              var tree = d3.tree()
                    .size([g_height, g_width]);

              // console.log(tree);
            }

            function spiderWeb(startNode) {
              // console.log(startNode);
              // new Promise(
              // drawCustomers(startNode, g_levels).then(console.log('done'));
              // )
              // drawSuppliers(startNode, levels, width / 2);
            }

            function drawCustomers(parentNode, levels) {
              return new Promise((resolve, reject) => {
                console.log(levels);
                if (levels >= 1) {
                  EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
                    parentNode.children = [];
                    for (var i = 0; i < res.customers.length; i++) {
                      var newNode = res.customers[i];
                      newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                      parentNode.children.push(newNode);
                    }
                    // restart();
                    for (var j = 0; j < parentNode.children.length; j++) {
                      drawCustomers(parentNode.children[j], levels - 1).then(function(res) {
                        // console.log(res);
                        resolve();
                      });
                    }
                  });
                }
                resolve();
              });
            }


            // function drawSuppliers(root, levels, x) {
            //   if (levels >= 1) {
            //     EnterprisesService.getSuppliers({ 'enterpriseId': root._id }).then(function (res) {
            //       var tmpNode = [];
            //       for (var i = 0; i < res.suppliers.length; i++) {
            //         var newNode = res.suppliers[i];
            //         newNode.x = x - xStep;
            //         newNode.y = height / 2;
            //         newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';

            //         tmpNode.push(newNode);
            //         nodes.push(newNode);
            //         // links.push({ source: newNode, target: root });
            //        }
            //       // restart();
            //       for (var j = 0; j < tmpNode.length; j++) {
            //         drawSuppliers(tmpNode[j], levels - 1, x - xStep);
            //        }
            //      });
            //    }
            //  }

          });
        });

        function getGraph() {
          // EnterprisesService.setupGraph().then(function (res) {
          //   console.log(res);
          //  });
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
