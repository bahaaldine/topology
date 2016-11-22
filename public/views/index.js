import uiModules from 'ui/modules';
import _ from 'lodash';
import echarts from 'plugins/topology/../node_modules/echarts/dist/echarts.min.js';

uiModules
.get('app/topology', [])
.controller('indexController', [ '$scope', 'Topology', function ($scope, Topology) {

}])
.directive('clusterTopology', [ 'Topology', '$window', '$timeout', function (Topology, $window, $timeout) {
	return {
    link: function($scope, $element, attrs) {
    	const myChart = echarts.init($element[0]);
    	const formatUtil = echarts.format;
			myChart.showLoading();

			$scope.topology = new Topology();
			$scope.topology.getClusterTopology().then( response => {
				$scope.topology.setClusterName(response.data.cluster.cluster);
				myChart.hideLoading();

				myChart.setOption({
	        tooltip: {
            formatter: function (info) {
              const value = info.value;
              const docsCount = info.data['docs.count'];
              const docsDeleted = info.data['docs.deleted'];
              const treePathInfo = info.treePathInfo;
              const treePath = [];

              for (var i = 1; i < treePathInfo.length; i++) {
                 treePath.push(treePathInfo[i].name);
              }

              var scaleValue = function(value) {
              	if ( value >= 1024 ) {
              		return formatUtil.addCommas( value / 1000 ) + ' GB'
              	} else if ( value >= 1024*1024 ) {
              		return formatUtil.addCommas( value / (1024*1024) ) + ' TB';
              	}

              	return formatUtil.addCommas(value) + ' MB';
              }

              let docsStats = ['<div>Docs count: ' + formatUtil.addCommas(docsCount) + '</div>',
                '<div>Docs deleted: ' + formatUtil.addCommas(docsDeleted) + '</div>'];
              if ( typeof info.data.segments != 'undefined' ) {
              	docsStats = ['<div>Docs count: ' + formatUtil.addCommas(info.data['docs']) + '</div>']
              }	

              return [
                  '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                  '<div>Disk Usage: ' + scaleValue(value)+ '</div>'
              ].concat(docsStats).join('');
          	}
	        },
	        series: [{
            name: 'Index topology',
            type: 'treemap',
            data: response.data.treemap,
            visibleMin: null,
            leafDepth: 1,
            zoomToNodeRatio: 0.02*0.02,
            breadcrumb: {
            	top: 1,
              itemStyle: {
                normal: {
                  color: '#607D8B',
                  borderWidth: 1,
                  borderColor: '#90A4AE',
                  textStyle: {
                    fontSize: 14
                  }
                }
              }
            },
            levels: [
              {
              	color: $scope.topology.getIndicesColors(response.data.treemap),
                itemStyle: {
                  normal: {
                    borderColor: '#2f99c1',
                    borderWidth: 15,
                    gapWidth: 15
                  }
                }
              },
              {
              	color: $scope.topology.getShardsColors(response.data.treemap),

                itemStyle: {
                  normal: {
                  	borderColor: '#424242',
                    borderWidth: 10,
                    gapWidth: 10
                  }
                }
              },
              {

                itemStyle: {
                  normal: {
                  	borderColor: '#212121',
                    borderWidth: 10,
                    gapWidth: 10
                  }
                }
              }
            ]
	        }]
		    });
		  });

			const resizeChart = function() {
				if(myChart != null && typeof myChart != 'undefined') {
          myChart.resize({ 
          	width: angular.element('.topology-container')[0].offsetWidth, 
          	height: angular.element('.topology-container')[0].offsetHeight - 100
          });
        }

				// manuall $digest required as resize event
				// is outside of angular
				$scope.$digest();
     	}

			angular.element($window).bind('resize', resizeChart);
	
			$timeout( function() { resizeChart(); } );
    }
  }
}]);