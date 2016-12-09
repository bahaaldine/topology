import uiModules from 'ui/modules';
import _ from 'lodash';

uiModules
.get('app/topology', ['ngMaterial'])
.controller('indexController', [ '$scope', function ($scope) {

}])
.directive('indexTopology', [ 'DataHeatMap', '$window', '$timeout', '$mdBottomSheet'
  , function (DataHeatMap, $window, $timeout, $mdBottomSheet) {
	return {
    link: function($scope, $element, attrs) {
    	
			$scope.topology = new DataHeatMap($element[0], $scope);
      $scope.indexPattern = '*';

			const resizeChart = function() {
				if($scope.topology.getChart() != null 
            && typeof $scope.topology.getChart() != 'undefined') {
          $scope.topology.getChart().resize({ 
          	width: angular.element('.topology-container')[0].offsetWidth, 
          	height: angular.element('.topology-container')[0].offsetHeight - 100
          });
        }
				$scope.$digest();
     	}

			angular.element($window).bind('resize', resizeChart);
			$timeout( function() { resizeChart(); } );

      $scope.$watch('indexPattern', (indexPattern) => {
        $scope.topology.setIndexPattern(indexPattern) 
      });

      /*$scope.$watch('path', (path) => {
        if ( path.indexOf('/') > 0 ) {
          $scope.selectedIndex = path.split('/')[0];
        }
      });*/

      $scope.$watch('topology.chart._model._componentsMap.series[0]._viewRoot.name', (root) => {
        if ( typeof root != "undefined" && root.indexOf(':') < 0 ) {
          $scope.selectedIndex = root;
        } else {
          $scope.selectedIndex = null;
        }
      });

      $scope.showIndexControls = function() {
        $scope.alert = '';
        $mdBottomSheet.show({
          template: require('plugins/topology/views/index-controls-tmpl.html'),
          controller: 'IndexControlsCtrl',
          locals : {
            index : $scope.selectedIndex
          }
        }).then(function(clickedItem) {
        });
      };
    }
  }
}])
.controller('IndexControlsCtrl', function($scope, $mdBottomSheet, index) {
  $scope.selectedIndex = index;
  $scope.items = [
    { name: 'Stats', icon: 'table' },
    { name: 'Open', icon: 'window-open' },
    { name: 'Close', icon: 'window-closed' },
    { name: 'Clear cache', icon: 'broom' },
    { name: 'Merge', icon: 'call-merge' },
    { name: 'Refresh', icon: 'refresh' },
    { name: 'Flush', icon: 'blur-radial' },
    { name: 'Delete', icon: 'delete' }
  ];

  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
});