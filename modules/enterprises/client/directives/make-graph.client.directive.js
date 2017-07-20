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
          getGraph().then(function(data) {
          var data = {
            type: 'action',
            name: '1',
            attributes: [],
            children: [{
              type: 'children',
              name: '2',
              attributes: [{
                'source-type-property-value': 'streetlight'
              }],
              children: [{
                type: 'parents',
                name: '3',
                attributes: [{
                  'source-type-property-value': 'cable'
                }],
                children: [{
                  type: 'resource-delete',
                  name: '4',
                  attributes: [],
                  children: []
                }]
              }, {
                type: 'children',
                name: '5',
                attributes: [{
                  'source-type-property-value': 'lantern'
                }],
                children: []
              }]
            }]
          };

          // ### DATA MODEL END

          // Set the dimensions and margins of the diagram
          var margin = {top: 20, right: 90, bottom: 30, left: 90},
          width = $window.innerWidth,
          height = $window.innerHeight;

          // append the svg object to the body of the page
          // appends a 'group' element to 'svg'
          // moves the 'group' element to the top left margin
          var svg = d3.select('#graph').
                append('svg').
                attr('width', width).
                attr('height', height);

          var g = d3.select('svg')
                .append('g');
            // attr('transform', 'translate(' + width / 2 + ', 0)');

          var i = 0, duration = 700, root;

          // declares a tree layout and assigns the size
          var treemap = d3.tree().size([height, width]);

          // Assigns parent, children, height, depth
          root = d3.hierarchy(data, function(d) {
            return d.children;
          });
          console.log(root);
          root.x0 = height / 2;
          root.y0 = 0;

          update(root);

          var selected = null;

          function update(source) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function(d){
              d.y = d.depth * 180;
            });

            // ### LINKS

            // Update the links...
            var link = g.selectAll('line.link').
                  data(links, function(d) {
                    return d.id;
                  });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().
                  append('line').
                  attr('class', 'link').
                  attr('stroke-width', 2).
                  attr('stroke', 'black').
                  attr('x1', function(d) {
                    return source.y0;
                  }).
                  attr('y1', function(d) {
                    return source.x0;
                  }).
                  attr('x2', function(d) {
                    return source.y0;
                  }).
                  attr('y2', function(d) {
                    return source.x0;
                  });

            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition().
              duration(duration).
              attr('x1', function(d) {
                return d.parent.y;
              }).
              attr('y1', function(d) {
                return d.parent.x;
              }).
              attr('x2', function(d) {
                return d.y;
              }).
              attr('y2', function(d) {
                return d.x;
              });

            // Remove any exiting links
            var linkExit = link.exit().
                  transition().
                  duration(duration).
                  attr('x1', function(d) {
                    return source.x;
                  }).
                  attr('y1', function(d) {
                    return source.y;
                  }).
                  attr('x2', function(d) {
                    return source.x;
                  }).
                  attr('y2', function(d) {
                    return source.y;
                  }).
                  remove();

            // ### CIRCLES

            // Update the nodes...
            var node = g.selectAll('g.node')
                  .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                  });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().
                  append('g').
                  attr('class', 'node').
                  attr('transform', function(d) {
                    return 'translate(' + source.y0 + ',' + source.x0 + ')';
                  }).
                  on('click', click);

            // Add Circle for the nodes
            nodeEnter.append('circle').
              attr('class', 'node').
              attr('r', 10).
              style('fill', function(d) {
                return '#0e4677';
              });

            // Update
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition().
              duration(duration).
              attr('transform', function(d) {
                return 'translate(' + d.y + ',' + d.x + ')';
              });

            // Update the node attributes and style
            nodeUpdate.select('circle.node').
              attr('r', 10).
              style('fill', function(d) {
                return '#0e4677';
              }).
              attr('cursor', 'pointer');

            // Remove any exiting nodes
            var nodeExit = node.exit().
                  transition().
                  duration(duration).
                  attr('transform', function(d) {
                    return 'translate(' + source.y + ',' + source.x + ')';
                  }).
                  remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle').attr('r', 0);

            // Store the old positions for transition.
            nodes.forEach(function(d){
              d.x0 = d.x;
              d.y0 = d.y;
            });

            var zoom = d3.zoom()
                  .scaleExtent([1 / 2, 1.2])
                  .on('zoom', zoom_actions);

            svg.call(zoom);
            d3.select('svg').on('dblclick.zoom', null);

            function zoom_actions() {
              g.attr('transform', d3.event.transform);
            }









            spiderWeb(root, 2);

            function spiderWeb(startNode, levels) {
              console.log(startNode);
              drawCustomers(startNode, levels, width / 2);
              // drawSuppliers(startNode, levels, width / 2);
            }

            function drawCustomers(parentNode, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.customers.length; i++) {
                    var newNode = res.customers[i];
                    // newNode.x = x;
                    // newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                    newNode.parentId = parentNode._id;

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    // links.push({ source: root, target: newNode });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawCustomers(tmpNode[j], levels - 1);
                  }
                });
              }
            }

            function drawSuppliers(root, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getSuppliers({ 'enterpriseId': root._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.suppliers.length; i++) {
                    var newNode = res.suppliers[i];
                    newNode.x = x - xStep;
                    newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    // links.push({ source: newNode, target: root });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawSuppliers(tmpNode[j], levels - 1, x - xStep);
                  }
                });
              }
            }

            // Toggle children on click.
            function click(d) {
              selected = d;
              document.getElementById('add-child').disabled = false;
              update(d);
            }
          }

          document.getElementById('add-child').onclick = function() {
            console.log(selected);
            //creates New OBJECT
            var newNodeObj = {
              type: 'resource-delete',
              name: new Date().getTime(),
              attributes: [],
              children: []
            };
            //Creates new Node
            var newNode = d3.hierarchy(newNodeObj);
            newNode.depth = selected.depth + 1;
            newNode.height = selected.height - 1;
            newNode.parent = selected;
            newNode.id = Date.now();

            if(!selected.children){
              selected.children = [];
              selected.data.children = [];
            }
            selected.children.push(newNode);
            selected.data.children.push(newNode.data);

            update(selected);
          };



          });


          //         getGraph().then(function(rootNode) {
          //           rootNode.parentId = null;

          //           var stratify = d3.stratify()
          //                 .id(function(d) { return d._id; })
          //                 .parentId(function(d) { return d.parentId; });

          //           var nodeArray = [rootNode];
          //           var nodes = stratify(nodeArray);

          //           var width = $window.innerWidth;
          //           var height = $window.innerHeight;

          //           var treemap = d3.tree()
          //                 .size([width, height]);

          //         // set the dimensions and margins of the diagram
          //         // var margin = {top: 40, right: 30, bottom: 50, left: 30},
          //         //     width = 660 - margin.left - margin.right,
          //         //     height = 500 - margin.top - margin.bottom;

          //           // append the svg obgect to the body of the page
          //           // appends a 'group' element to 'svg'
          //           // moves the 'group' element to the top left margin
          //           var svg = d3.select('body').append('svg')
          //                 .attr('width', width)
          //                 .attr('height', height),
          //           g = svg.append('g')
          //                 .attr('transform',
          //                       'translate(100, -100)');

          //           var link = g.selectAll('.link');
          //           var node = g.selectAll('.node');

          //         // assigns the data to a hierarchy using parent-child relationships
          //         nodes = d3.hierarchy(nodes);

          //         // maps the node data to the tree layout
          //         nodes = treemap(nodes);

          //             var zoom = d3.zoom()
          //                   .scaleExtent([1 / 2, 1.2])
          //                   .on('zoom', zoom_actions);

          //             svg.call(zoom);
          //             d3.select('svg').on('dblclick.zoom', null);

          //           restart();

          // // function drawElements(node) {
          // //   // Add circles above each node
          // //   node.append('circle')
          // //     .attr('r', 2)
          // //     .attr('transform', function(d) { return 'translate(0,-18)'; })
          // //     .attr('class', 'upper-circle')
          // //     .style('stroke', get_rank_colour)
          // //     .style('fill', get_rank_colour);

          // //   // Add the circles below each node
          // //   node.append('circle')
          // //     .attr('r', 4)
          // //     .attr('transform', function(d) { return 'translate(0,16)'; })
          // //     .attr('class', 'lower-circle')
          // //     .style('stroke', '#000000')
          // //     .style('fill', function(d) {
          // //       return d.data.data.child_count > 0 ? '#FFFFFF' : '#000000';
          // //     });

          // //   // Add text
          // //   node.append('text')
          // //     .attr('dy', 3)
          // //     .style('fill', '#FFFFFF')
          // //     .style('text-anchor', 'middle')
          // //     .text(function(d) {
          // //       return d.data.data.name;
          // //       if(d.data.rank == max_rank || d.data.name == 'Life') {
          // //         return d.data.name;
          // //       }
          // //       else if(d.children) {
          // //         return d.data.name + ' (' + d.children.length + ')';
          // //       }
          // //       else {
          // //         return d.data.name + ' (' + d.data.count + ')';
          // //       }
          // //     })
          // //     .each(function(d) {
          // //       d.textwidth = this.getBBox().width;
          // //       d.textheight = this.getBBox().height;
          // //     });

          // //   // Add clickable background rectangle so it looks nicer
          // //   node.insert('rect',':first-child')
          // //     .style('fill', '#000000')
          // //     .style('fill-opacity', function(d) {
          // //         if(d.children || d.data.data.rank == max_rank) { return 0.5; }
          // //         else { return 0.2; }
          // //       }
          // //     )
          // //     .attr('height', function(d) { return d.textheight + 10; })
          // //     .attr('width', function(d) { return d.textwidth + 10; })
          // //     .attr('transform', function(d) {
          // //       if(d.data.data.rank == 9) {
          // //         return 'translate(-' +  ((d.textwidth + 10) / 2) + ',-' +  ((d.textheight + 30) / 2) + ')';
          // //       }
          // //       return 'translate(-' +  ((d.textwidth + 10) / 2) + ',-' +  ((d.textheight + 15) / 2) + ')';
          // //     })
          // //     .attr('rx', 10)
          // //     .attr('ry', 10);
          // // }

          //             function zoom_actions() {
          //               g.attr('transform', d3.event.transform);
          //             }


          //           function restart() {
          //             // assigns the data to a hierarchy using parent-child relationships
          //             nodes = d3.hierarchy(nodes);

          //             // maps the node data to the tree layout
          //             nodes = treemap(nodes);



          //             nodes = stratify(nodeArray);
          //             nodes = treemap(nodes);

          //             nodes.each(function(d) { d.y = d.depth * 180; });

          //             console.log(nodes.descendants());

          //         // adds the links between the nodes
          //         link = link
          //               .data( nodes.descendants().slice(1))
          //               .enter().append('path')
          //               .attr('class', 'link')
          //               .attr('d', function(d) {
          //                 return 'M' + d.parent.y + ',' + d.parent.x
          //                   + 'C' + (d.y + d.parent.y) / 2 + ',' + d.x
          //                   + ' ' + (d.y + d.parent.y) / 2 + ',' + d.x
          //                   + ' ' + d.y + ',' + d.x;
          //               })
          //               .merge(link);

          //         // adds the circle to the node
          //             node = node
          //               .data(nodes.descendants())
          //               .enter()
          //               .append('circle')
          //               .attr('r', 10)
          //               // .attr('cx', function(d) { return d.x; })
          //               // .attr('cy', function(d) { return d.y; })
          //               .attr('class', function(d) {
          //                 return 'node' +
          //                   (d.children ? ' node--internal' : ' node--leaf'); })
          //               .attr('transform', function(d) {
          //                 return 'translate(' + d.y + ',' + d.x + ')'; })
          //               .merge(node);
          //         // adds the text to the node
          //         // .append('text')
          //         //   .attr('dy', '.35em')
          //         //   .attr('y', function(d) { return d.children ? -20 : 20; })
          //         //   .style('text-anchor', 'middle')
          //         //   .text(function(d) { return d.data.name; });

          //          }

          //           spiderWeb(rootNode, 2);

          //           function spiderWeb(startNode, levels) {
          //             console.log(startNode);
          //             // drawCustomers(startNode, levels);
          //             drawSuppliers(startNode, levels);
          //           }

          //           function drawCustomers(parentNode, levels) {
          //             if (levels >= 1) {
          //               EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
          //                 var tmpNode = [];
          //                 for (var i = 0; i < res.customers.length; i++) {
          //                   var newNode = res.customers[i];
          //                   newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
          //                   newNode.parentId = parentNode._id;

          //                   tmpNode.push(newNode);
          //                   nodeArray.push(newNode);
          //                 }
          //                 console.log('Customers');
          //                 restart();
          //                 for (var j = 0; j < tmpNode.length; j++) {
          //                   drawCustomers(tmpNode[j], levels - 1);
          //                 }
          //               }).catch(function(err) {
          //                 console.log(err);
          //               });
          //             }
          //           }

          //           function drawSuppliers(parentNode, levels) {
          //             if (levels >= 1) {
          //               EnterprisesService.getSuppliers({ 'enterpriseId': parentNode._id }).then(function (res) {
          //                 var tmpNode = [];
          //                 for (var i = 0; i < res.suppliers.length; i++) {
          //                   var newNode = res.suppliers[i];
          //                   // newNode.x = x;
          //                   // newNode.y = height / 2;
          //                   newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';
          //                   newNode.parentId = parentNode._id;

          //                   tmpNode.push(newNode);
          //                   nodeArray.push(newNode);
          //                   // restart();
          //                   // links.push({ source: newNode, target: root });
          //                 }
          //                 console.log('Suppliers');
          //                 restart();
          //                 for (var j = 0; j < tmpNode.length; j++) {
          //                   drawSuppliers(tmpNode[j], levels - 1);
          //                 }
          //               });
          //             }
          //           }




          //         });








          // var treeData =
          //       {
          //         'name': 'Top Level',
          //         'children': [
          //           {
          //             'name': 'Level 2: A',
          //             'children': [
          //               { 'name': 'Son of A' },
          //               { 'name': 'Daughter of A' }
          //             ]
          //           },
          //           { 'name': 'Level 2: B' }
          //         ]
          //       };


          // var root = d3.hierarchy(treeData, function(d) { return d.children; });

          // console.log('1', root);

          // var width = $window.innerWidth;
          // var height = $window.innerHeight;

          // var tree = d3.tree().size([width, height]);

          // root = tree(root);

          // console.log(root.descendants().slice(1));














          d3.select('.footer').remove();
          var header = getBounds(d3.select('header')._groups[0][0]);
          var sideHeight = getBounds(d3.select('.form-group')._groups[0][0]);

          var width = $window.innerWidth;
          var height = $window.innerHeight;

          d3.select('.display').style('height', function() { return (height - sideHeight.offsetTop - header.offsetHeight) + 'px';});
          d3.select('.side-list').style('max-height', function() { return (height - header.offsetHeight - sideHeight.offsetTop - sideHeight.offsetHeight - 80) + 'px'; });
          d3.select('.content').style('margin-top', function() { return header.offsetHeight + 'px';});

          // var svg = d3.select('#graph').append('svg')
          //       .style('padding', '30px')
          //       .attr('width', width)
          //       .attr('height', height - header.offsetHeight - 5);

          var color = d3.scaleOrdinal(d3.schemeCategory10);

          getGraph().then(function(rootNode) {
            rootNode.parentId = null;

            var stratify = d3.stratify()
                  .id(function(d) { return d._id; })
                  .parentId(function(d) { return d.parentId; });

            var root = stratify([rootNode]);

            var customerTree = d3.tree().size([width, height]);

            console.log(root);
            customerTree(root);

            // var nodes = customerTree.nodes(root).reverse();
            // var links = customerTree.links(nodes);

            console.log(root);

            var nodes = root.descendants(),
                links = root.descendants().slice(1);

            nodes.forEach(function(d){ d.y = d.depth * 180; });








            // spiderWeb(root, 2);

            function spiderWeb(startNode, levels) {
              console.log(startNode);
              drawCustomers(startNode, levels, width / 2);
              // drawSuppliers(startNode, levels, width / 2);
            }

            function drawCustomers(parentNode, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.customers.length; i++) {
                    var newNode = res.customers[i];
                    // newNode.x = x;
                    // newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                    newNode.parentId = parentNode._id;

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    // links.push({ source: root, target: newNode });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawCustomers(tmpNode[j], levels - 1);
                  }
                });
              }
            }

            function drawSuppliers(root, levels, x) {
              if (levels >= 1) {
                EnterprisesService.getSuppliers({ 'enterpriseId': root._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.suppliers.length; i++) {
                    var newNode = res.suppliers[i];
                    newNode.x = x - xStep;
                    newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';

                    tmpNode.push(newNode);
                    nodes.push(newNode);
                    // links.push({ source: newNode, target: root });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawSuppliers(tmpNode[j], levels - 1, x - xStep);
                  }
                });
              }
            }


          });
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
