import uiModules from 'ui/modules';
import echarts from 'plugins/topology/../node_modules/echarts/dist/echarts.min.js';

uiModules
.get('app/topology', [])
.controller('indexController', [ '$scope', 'Topology', function ($scope, Topology) {
    
}])
.directive('clusterTopology', [ 'Topology', '$window', function (Topology, $window) {
	return {
    link: function($scope, $element, attrs) {
    	const myChart = echarts.init($element[0]);
    	const formatUtil = echarts.format;
			myChart.showLoading();

			$scope.topology = new Topology();
			$scope.topology.getClusterTopology().then( response => {
				myChart.hideLoading();

				myChart.setOption({
	        title: {
            text: 'Cluster Topology',
            subtext: 'Cluster name',
            left: 'center'
	        },
	        tooltip: {
            formatter: function (info) {
              const value = info.value;
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

              return [
                  '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                  'Disk Usage: ' + scaleValue(value),
              ].join('');
          	}
	        },
	        series: [{
            name: 'Topology',
            type: 'treemap',
            data: response.data,
            leafDepth: 1,
            levels: [
              {
              	color: ['#2196F3','#3F51B5','#E91E63','#9C27B0','#009688','#673AB7','#F44336','#03A9F4','#00BCD4','#4CAF50','#FF9800'],
                itemStyle: {
                  normal: {
                    borderColor: '#E1F5FE',
                    borderWidth: 2,
                    gapWidth: 2
                  }
                }
              },
              {
                colorSaturation: [0.1, 0.9],
                itemStyle: {
                  normal: {
                    borderColorSaturation: 0.7,
                    gapWidth: 1,
                    borderWidth: 1
                  }
                }
              },
              {
                colorSaturation: [0.3, 0.5],
                itemStyle: {
                  normal: {
                    borderColorSaturation: 0.6,
                    gapWidth: 1
                  }
                }
              },
              {
                colorSaturation: [0.3, 0.5]
              }
            ]
	        }]
		    });
		  });

			angular.element($window).bind('resize', function(){
				if(myChart != null && typeof myChart != 'undefined') {
          myChart.resize({ 
          	width: angular.element('.topology-container')[0].offsetWidth, 
          	height: angular.element('.topology-container')[0].offsetHeight
          });
        }

				// manuall $digest required as resize event
				// is outside of angular
				$scope.$digest();
     	});
	
    }
  }
}]);