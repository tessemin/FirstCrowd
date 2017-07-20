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

          getGraph().then(function(rootNode) {
            rootNode.parentId = null;

            var stratify = d3.stratify()
                  .id(function(d) { return d._id; })
                  .parentId(function(d) { return d.parentId; });

            var nodeArray = [rootNode];
            var nodes = stratify(nodeArray);

          // set the dimensions and margins of the diagram
          var margin = {top: 40, right: 30, bottom: 50, left: 30},
              width = 660 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

          // declares a tree layout and assigns the size
          var treemap = d3.tree()
                .size([width, height]);

          // assigns the data to a hierarchy using parent-child relationships
          nodes = d3.hierarchy(nodes);

          // maps the node data to the tree layout
          nodes = treemap(nodes);

          // append the svg obgect to the body of the page
          // appends a 'group' element to 'svg'
          // moves the 'group' element to the top left margin
          var svg = d3.select('body').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom),
              g = svg.append('g')
                .attr('transform',
                      'translate(' + margin.left + ',' + margin.top + ')');

          // adds the links between the nodes
          var link = g.selectAll('.link')
                .data( nodes.descendants().slice(1))
                .enter().append('path')
                .attr('class', 'link')
                .attr('d', function(d) {
                  return 'M' + d.y + ',' + d.x
                    + 'C' + (d.y + d.parent.y) / 2 + ',' + d.x
                    + ' ' + (d.y + d.parent.y) / 2 + ',' + d.x
                    + ' ' + d.parent.y + ',' + d.parent.x;
                });

          // adds the circle to the node
          var node = g.selectAll('.node')
                .data(nodes.descendants())
                .enter()
                .append('circle')
                .attr('r', 10)
                .attr('class', function(d) {
                  return 'node' +
                    (d.children ? ' node--internal' : ' node--leaf'); })
                .attr('transform', function(d) {
                  return 'translate(' + d.y + ',' + d.x + ')'; });
          // adds the text to the node
          // .append('text')
          //   .attr('dy', '.35em')
          //   .attr('y', function(d) { return d.children ? -20 : 20; })
          //   .style('text-anchor', 'middle')
          //   .text(function(d) { return d.data.name; });


            function restart() {
              nodes = stratify(nodeArray);
              nodes = treemap(nodes);

              console.log('restart', nodes);

              link = link
                .data( nodes.descendants().slice(1));

              node = node
                .data(nodes.descendants());
            }


            spiderWeb(rootNode, 2);

            function spiderWeb(startNode, levels) {
              console.log(startNode);
              // drawCustomers(startNode, levels);
              drawSuppliers(startNode, levels);
            }

            function drawCustomers(parentNode, levels) {
              if (levels >= 1) {
                // EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
                EnterprisesService.getCustomers({ 'enterpriseId': parentNode._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.customers.length; i++) {
                    var newNode = res.customers[i];
                    // newNode.x = x;
                    // newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/magnifier-data-128.png';
                    newNode.parentId = parentNode._id;

                    tmpNode.push(newNode);
                    nodeArray.push(newNode);
                    restart();
                    // links.push({ source: root, target: newNode });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawCustomers(tmpNode[j], levels - 1);
                  }
                }).catch(function(err) {
                  console.log(err);
                });
              }
            }

            function drawSuppliers(parentNode, levels) {
              if (levels >= 1) {
                EnterprisesService.getSuppliers({ 'enterpriseId': parentNode._id }).then(function (res) {
                  var tmpNode = [];
                  for (var i = 0; i < res.suppliers.length; i++) {
                    var newNode = res.suppliers[i];
                    // newNode.x = x;
                    // newNode.y = height / 2;
                    newNode.img = 'https://cdn4.iconfinder.com/data/icons/seo-and-data/500/gear-clock-128.png';
                    newNode.parentId = parentNode._id;

                    tmpNode.push(newNode);
                    nodeArray.push(newNode);
                    restart();
                    // links.push({ source: newNode, target: root });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawSuppliers(tmpNode[j], levels - 1);
                  }
                });
              }
            }




          });








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
                    links.push({ source: root, target: newNode });
                  }
                  // restart();
                  for (var j = 0; j < tmpNode.length; j++) {
                    drawCustomers(tmpNode[j], levels - 1, x + 100);
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
                    links.push({ source: newNode, target: root });
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
