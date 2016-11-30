import uiModules from 'ui/modules';
import _ from 'lodash';

uiModules
.get('app/topology', [])
.controller('indexController', [ '$scope', function ($scope) {

}])
.directive('clusterTopology', [ 'DataHeatMap', '$window', '$timeout', function (DataHeatMap, $window, $timeout) {
	return {
    link: function($scope, $element, attrs) {
    	
			$scope.topology = new DataHeatMap($element[0]);

			const resizeChart = function() {
				if($scope.topology.getChart() != null 
            && typeof $scope.topology.getChart() != 'undefined') {
          $scope.topology.getChart().resize({ 
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