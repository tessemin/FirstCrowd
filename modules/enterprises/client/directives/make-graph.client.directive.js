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
        var radius = 50;
        var supplierCol = 0;
        var customerCol = 0;
        var zoomListener, group;

        d3().then(function(d3) {
          var header = getBounds(d3.select('header')._groups[0][0]);
          var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);
          var footer = getBounds(d3.select('footer')._groups[0][0]);

          var width = $window.innerWidth;
          var height = $window.innerHeight;

          d3.select('.display').style('height', function() {
            return (height - sideHeight.offsetTop - header.offsetHeight - footer.offsetHeight) + 'px';
          });
          d3.select('.side-list').style('min-height', function() {
            // return 50 + 'px';
            return (height - header.offsetHeight
                    - sideHeight.offsetTop
                    - sideHeight.offsetHeight
                    - footer.offsetHeight - 90) + 'px';
          });

          d3.select('.content').style('margin-top', function() {
            return header.offsetHeight + 'px';
          });

          var svg = d3.select('.graph')
                .append('svg')
                .attr('width', width)
                .attr('height', height - header.offsetHeight - footer.offsetHeight - 5);

          // var i = 0;
          var duration = 2000;


          var zoomListener;
          // var zoomListener = d3.zoom()
          //       .scaleExtent([1 / 10, 1 / 2])
          //       .on('zoom', zoom);


          d3.select('svg').on('dblclick.zoom', null);

          d3.select('.graph').append('div').attr('class', 'loader').html('')
            .style('top', function() {
              return -1 * height / 2 + 'px';
            });

          getGraph().then(function(rootNode) {

            var extent;
            var group;

            var graphPromises = [];
            var root1 = $.extend( {}, rootNode);
            var root2 = $.extend( {}, rootNode);

            graphPromises.push(getGraphCustomers(root1));
            graphPromises.push(getGraphSuppliers(root2));

            Promise.all(graphPromises).then(function(res) {
              function zoom() {
                group.attr('transform', d3.event.transform);
                // if ((d3.event.transform.x > (extent.minX ) // * d3.event.transform.k
                //     )
                //     && (d3.event.transform.x < (extent.maxX + width / 2 + 100) // * d3.event.transform.k
                //        )
                //     && (d3.event.transform.y > (extent.minY ) // * d3.event.transform.k
                //        )
                //     && (d3.event.transform.y < (extent.maxY + height / 2) // * d3.event.transform.k
                //        )) {
                //          group.attr('transform', d3.event.transform);
                //        }
                // else {
                //   if (d3.event.transform.x < (extent.minX) // * d3.event.transform.k
                //      ){
                //        getAnotherRow('customers');
                //      }
                //   else if (d3.event.transform.x > (extent.maxX + width / 2) // * d3.event.transform.k
                //           ){
                //             getAnotherRow('suppliers');
                //           }
                // }
              }

              // Create d3 hierarchies
              var tree = { 'suppliers': res[1], 'customers': res[0] };
              var count = 0;

              var treeHeight = { 'suppliers': tree.suppliers.height, 'customers': tree.customers.height };
              var treeBottom = { 'suppliers': [], 'customers': [] };

              // getBottomChildren(right, 'customers');
              // getBottomChildren(left, 'suppliers');
              getExtent();

              zoomListener = d3.zoom()
              // .extent([[extent.minX - 200, extent.minY - 200], [extent.maxX + 200, extent.maxY + 200]])
              // .translateExtent([[extent.minX - 200, extent.minY - 200], [extent.maxX + 200, extent.maxY + 200]])
                .scaleExtent([1 / 8, 1])
                .on('zoom', zoom);

              svg.call(zoomListener);
              group = svg.append('g').attr('class', 'everything');

              group.style('opacity', 0);

              d3.select('.loader').transition().duration(duration / 2).style('opacity', 0).remove();

              group.transition().duration(duration).style('opacity', 1);
              centerHome();
              makeHomeButton();


              async function checkForCoords(node, callback) {
                if (node && 'x' in node && 'y' in node) {
                  callback(node);
                } else {
                  setTimeout(function() { checkForCoords(node, callback); }, 0);
                }
              }

              function getExtent() {
                var retExtent = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
                treeBottom.suppliers.concat(treeBottom.customers).forEach((node) => {
                  checkForCoords(node, function(node) {
                    if (node.x < retExtent.minY) {
                      retExtent.minY = node.x;
                    }
                    if (node.x > retExtent.maxY) {
                      retExtent.maxY = node.x;
                    }
                    if (node.y < retExtent.minX) {
                      retExtent.minX = node.y;
                    }
                    if (node.y > retExtent.maxX) {
                      retExtent.maxX = node.y;
                    }
                  });
                });
                extent = retExtent;
              }

              // function getAnotherRow(group) {

              //   var obj;
              //   if (group === 'suppliers') {
              //     obj = $.extend( {}, left);
              //   } else if (group === 'customers') {
              //     obj = $.extend( {}, right);
              //   } else {
              //     console.log('hi');
              //   }

              //   addChildrenToBottom(obj, group).then((res) => {
              //     console.log('hi', res);
              //   });
              // }


              function collapse(d) {
                if(d.children) {
                  if (d.parent) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                  } else {
                    d.children.forEach((d) => d.children.forEach(collapse));
                  }
                }
              }

              function addChildrenToBottom(tree, group) {
                return new Promise(function(resolve, reject) {
                  if (tree.hasOwnProperty('children')) {
                    tree.children.forEach((child)=> {
                      addChildrenToBottom(child, group);
                    });
                  } else {
                    getChildren(tree.data._id, group).then(function(childArray) {
                      console.log(childArray);
                      tree.children = childArray;
                      resolve(tree);
                    });
                  }
                });
              }

              function getBottomChildren(tree, side) {
                if (tree.hasOwnProperty('children')) {
                  tree.children.forEach((child)=> {
                    getBottomChildren(child, side);
                  });
                } else {
                  if (tree.depth === treeHeight[side]) {
                    treeBottom[side].push(tree);
                  }
                }
              }

              var width = +svg.attr('width'),
                  height = +svg.attr('height');

              var node, link;

              // collapse(tree.suppliers);
              // collapse(tree.customers);

              // Render both trees
              drawTree(tree.suppliers);
              drawTree(tree.customers);

              function drawTree(head) {

                console.log(head);

                // var temp = $.extend( {}, tree[node.data.type]);
                var root = d3.hierarchy(head);

                console.log(head);

              var pos;
              var SWITCH_CONST = 1;
              if (root.hasOwnProperty('children')) {
                if(root.children) {
                  pos = root.children[0].data.type;
                }
              } else if (root.hasOwnProperty('children')) {
                if (root._children) {
                  pos = root._children[0].data.type;
                }
              } else {
                pos = 'root';
              }

              d3.selectAll('.link-' + pos).remove();
              d3.selectAll('.node-' + pos).remove();
              if (pos === 'suppliers') {
                SWITCH_CONST = -1;
              }

              var g = d3.select('.everything');

              // Create new default tree layout
              var treemap = d3.tree()
                    .nodeSize([radius / 1.5, radius * 10])
                    .separation(function(a, b) {
                      return a.parent === b.parent ? 5 : 6;
                    });
              // Set the size
              // Remember the tree is rotated
              // so the height is used as the width
              // and the width as the height

              console.log(treemap(root));
              treemap(root);

              var nodes = root.descendants();
              var links = root.links();
              // Set both root nodes to be dead center vertically

              nodes.forEach(function(node) {
                if (node.y !== 0) node.y = node.y * SWITCH_CONST * 1.5;
              });

              console.log(nodes);

              link = g.selectAll('.link-' + pos)
                .data(links)
                .enter();

              var linkEnter = link.append('path')
                    .attr('class', 'link-' + pos)
                    .attr('d', function(d) {
                      return 'M' + d.target.y + ',' + d.target.x +
                        'C' + (d.target.y + d.source.y) / 2.5 + ',' + d.target.x +
                        ' ' + (d.target.y + d.source.y) / 2 + ',' + d.source.x +
                        ' ' + d.source.y + ',' + d.source.x;
                    });

              // UPDATE
              var linkUpdate = linkEnter.merge(link);

              // Transition back to the parent element position
              linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d) {
                  return 'M' + d.target.y + ',' + d.target.x +
                    'C' + (d.target.y + d.source.y) / 2.5 + ',' + d.target.x +
                    ' ' + (d.target.y + d.source.y) / 2 + ',' + d.source.x +
                    ' ' + d.source.y + ',' + d.source.x;
                });

              // Remove any exiting links
              var linkExit = link.exit().transition()
                    .duration(duration)
                    .attr('d', function(d) {
                      return 'M' + d.target.y + ',' + d.target.x +
                        'C' + (d.target.y + d.source.y) / 2.5 + ',' + d.target.x +
                        ' ' + (d.target.y + d.source.y) / 2 + ',' + d.source.x +
                        ' ' + d.source.y + ',' + d.source.x;
                    })
                    .remove();

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
              node = g.selectAll('.node-' + pos)
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', function(d) {
                  return 'node-' + pos + (d.children ? ' node--internal' : ' node--leaf');
                })
                .attr('transform', function(d) {
                  return 'translate(' + d.y + ',' + d.x + ')';
                });

              var nodeEnter = node
                    .append('circle')
                    .style('fill', function(d, i) { return 'url(#image' + (i + tmp) + ')'; })
                    .attr('id', function(d, i) { return 'node' + (i + tmp); })
                    .attr('node-num', function(d, i) { return (i + tmp); })
                    .attr('r', radius)
                    .on('click', function(d, i) {

                      var thisNode = d;

                      // if (thisNode.hasOwnProperty(chil))

                      function click(d) {
                        console.log('click!', d);
                        if (d.data.hasOwnProperty('children')) {
                          if (d.data.children) {
                            d.data._children = d.data.children;
                            d.data.children = null;
                          } else {
                            d.data.children = d.data._children;
                            d.data._children = null;
                          }
                          drawTree(tree[d.data.type]);

                        } else {
                          d.data.type = d.parent.data.type;
                          getChildren(d.data._id, d.data.type).then((children) => {
                            console.log(children);
                            children.forEach((child) => {
                              child.type = d.data.type;
                            });
                            d.data.children = children;
                            console.log(d);
                            addToTree(d);
                          });
                        }
                      }

                      function revertHierarchy(haystack, needle, depth) {
                        return new Promise(function(resolve, reject) {
                          console.log('created');
                        if (depth <= 0) {
                          if (haystack._id === needle._id) {
                            console.log('found', haystack._id);
                            haystack = needle;
                          }
                          console.log('resolved');
                          resolve();
                        } else {
                          if (haystack._id === needle._id) {
                            haystack = needle;
                            console.log('resolved');
                            resolve();

                          } else if (haystack.hasOwnProperty('children')) {
                            if (haystack.children !== null) {
                            haystack.children.forEach((child) => {
                              resolve(revertHierarchy(child, needle, depth - 1));
                            });
                            } else {
                              console.log('resolved');
                              resolve();
                            }
                          }
                        }
                        });
                      }

                      function fixToggle(master, student) {
                        console.log(master, student);
                      }




                      function addToTree(node) {
                        // console.log(node);
                        var depth = node.depth;

                        var temp = $.extend( {}, tree[node.data.type]);

                        // setTimeout(function() {
                        console.log(tree[node.data.type]);
                        revertHierarchy(tree[node.data.type], node.data, depth).then(function(res, rej) {
                          if (rej) console.log(rej);

                          console.log(tree[node.data.type]);
                          console.log('res', res);
                          // res = node.data;

                          // tree[node.data.type] = d3.hierarchy(tree[node.data.type].data);
                          drawTree(tree[node.data.type]);
                        });
                        // }, 100);

                        // var hierarchy = d3.hierarchy(tree[node.data.type].data);
                      }

                      d3.selectAll('text').remove();
                      d3.selectAll('rect').remove();
                      // centerNode(d3.select(this)._groups[0][0].__data__);

                      d3.select('#selected-circle').style('stroke', 'black').style('stroke-width', 1).attr('id', function(d, i) { return 'node' + i; });
                      d3.select(this).transition().duration(300)
                        .style('stroke', 'red')
                        .style('stroke-width', 10)
                        .attr('id', 'selected-circle');

                      var items = [
                        // { 'func': removeGraph, 'text': 'See this Company\'s Graph', 'y': 1 },
                        { 'func': centerNode, 'text': 'Center Graph on this company', 'y': 1 },
                        { 'func': click, 'text': 'Toggle this Node\'s children', 'y': 2 },
                        { 'func': viewCatalog, 'text': 'See Product & Service Catalog', 'y': 3 },
                        { 'func': viewDemands, 'text': 'See Demands', 'y': 4 },
                        { 'func': viewSuppliers, 'text': 'See Suppliers', 'y': 5 },
                        { 'func': viewCustomers, 'text': 'See Customers', 'y': 6 },
                        { 'func': viewCompetitors, 'text': 'See Competitors', 'y': 7 }
                      ];

                      var menuWidth = 600;
                      var itemHeight = 100;
                      var menuHeight = itemHeight * items.length;
                      var coords = getScreenCoords(d3.select(this)._groups[0][0].__data__.x,
                                                   d3.select(this)._groups[0][0].__data__.y,
                                                   menuHeight,
                                                   menuWidth);

                      var x = coords.x - 20;
                      var y = coords.y - 300;

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
                                d.func(thisNode);
                              } else if (d.func === click) {
                                console.log('clicked');
                                d.func(thisNode);
                              } else {
                                d.func(thisNode.data);
                              }
                            })
                            .style('stroke', 'black')
                            .style('stroke-width', 0.5)
                            .attr('x', x)
                            .attr('y', function(d) {
                              return y + (-25) +(itemHeight * (d.y));
                            });

                      var menuText = g.selectAll('text').data(items).enter()
                            .append('text')
                            .style('cursor', 'pointer')
                            .style('pointer-events', 'none')
                            .style("font-size", function(d) { return Math.min(2 * 20, (2 * 20 - 8) / this.getComputedTextLength() * 24) + "px"; })
                            .attr('x', x + 10)
                            .attr('y', function(d) {
                              return y + 25 + (itemHeight * (d.y));
                            })
                            .text(function (d) { return d.text; });
                    });



              var nodeUpdate = nodeEnter.merge(node);

              // Transition to the proper position for the node
              nodeUpdate.transition()
                .duration(duration)
                .attr('class', function(d) {
                  return 'node-' + pos + (d.children ? ' node--internal' : ' node--leaf');
                });
              // .attr("transform", function(d) {
              //   return "translate(" + d.y + "," + d.x + ")";
              // });

              // Update the node attributes and style
              nodeUpdate.select('circle')
                .attr('r', radius)
                .style('fill', function(d, i) { return 'url(#image' + (i + tmp) + ')'; })
                .attr('cursor', 'pointer');


              // Remove any exiting nodes
              var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                      return "translate(" + d.parent.y + "," + d.parent.x + ")";
                    })
                    .remove();

              // On exit reduce the node circles size to 0
              nodeExit.select('circle')
                .attr('r', 1e-6);

              }
            });

            //
            // functions!
            //
            function getScreenCoords(x, y, menuHeight, menuWidth) {
              var xn = y + 100;
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
              var s = t.k === 1 ? 0.5 : t.k;
              x = x * s + width / 2;
              y = y * s + height / 2;
              d3.selectAll('svg')
                .transition()
                .duration(duration)
                .call(zoomListener.transform, d3.zoomIdentity.translate(x, y).scale(s));
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

          function getGraphCustomers(obj) {
            return new Promise(function(resolve, reject) {
              var data = obj;
              data.type = 'root';
              // recurseTree (nodeObj, number of levels to get, group)
              // group can either be suppliers or customers

              getChildren(data._id, 'customers').then(function(childArray) {
                data.children = childArray;
                data.children.forEach((child) => { child.type = 'customers'; });
                resolve(recurseTree(data, 3, 'customers'));
              });
            });
          }

          function getGraphSuppliers(obj) {
            return new Promise(function(resolve, reject) {
              var data = obj;
              data.type = 'root';
              // recurseTree (nodeObj, number of levels to get, group)
              // group can either be suppliers or customers

              getChildren(data._id, 'suppliers').then(function(childArray) {
                data.children = childArray;
                data.children.forEach((child) => { child.type = 'suppliers'; });
                resolve(recurseTree(data, 3, 'suppliers'));
              });
            });
          }

          // TODO add rejctions
          function recurseTree(data, level, group) {
            return new Promise(function(resolve, reject) {
              if (level <= 1) {
                resolve(data);
              } else {
                if (data.hasOwnProperty('children')) {
                  var childPromises = [];
                  data.children.forEach(function(child) {
                    child.type = group;
                    child.children = [];
                    childPromises.push(getChildren(child._id, group));
                  });

                  Promise.all(childPromises).then(function(children) {
                    var recursePromises = [];
                    for (var i = 0; i < data.children.length; i++) {
                      data.children[i].children = children[i];
                      recursePromises.push(recurseTree(data.children[i], level - 1, group));
                    }

                    Promise.all(recursePromises).then(function() {
                      resolve(data);
                    });
                  });
                }
              }
            });
          }


          function getChildren(id, word) {
            return new Promise(function(resolve, reject) {
              if (word === 'suppliers') {
                getSuppliers(id).then(function(res) {
                  resolve(res[word]);
                });
              } else if (word === 'customers') {
                getCustomers(id).then(function(res) {
                  resolve(res[word]);
                });
              } else {
                reject();
              }
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
