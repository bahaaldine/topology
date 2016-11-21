import uiModules from 'ui/modules';
import _ from 'lodash';

uiModules
.get('app/topology', [])
.factory('Topology', ['$http', '$q', 'chrome', function ($http, $q, chrome) {
  class Topology {

    constructor() {
    }

    getClusterTopology() {
      return $http.get(chrome.addBasePath('/topology/cluster'));
    }

    getIndicesColors( indices ) {
    	return _.map( indices, ( index ) => index.color );
    }

    getShardsColors( indices ) {
    	return _.map( indices, ( index ) => _.map( index.children	, ( shard, key ) => shard.color ) );
    }

    setClusterName ( clusterName ) {
    	this.clusterName = clusterName;
    }  

  }
  return Topology;

}]);