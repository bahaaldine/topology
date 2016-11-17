import uiModules from 'ui/modules';

uiModules
.get('app/topology', [])
.factory('Topology', ['$http', '$q', 'chrome', function ($http, $q, chrome) {
  class Topology {

    constructor() {
    }

    getClusterTopology() {
      return $http.get(chrome.addBasePath('/topology/cluster'));
    }

  }
  return Topology;

}]);