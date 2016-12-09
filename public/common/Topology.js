import uiModules from 'ui/modules';
import { initChart, getDataHeatMap } from './chart_utils';


uiModules
.get('app/topology', [])
.factory('Topology', ['$http', 'chrome', function ($http, chrome) {
  class Topology {

    constructor(container, scope) {
      $http.get(chrome.addBasePath('/topology/cluster_health'))
      .then( (health) => {
        this.description = health.data;
      }.bind(this));
      this.scope = scope;
      this.chart = initChart(container);
    }

    getChart() {
      return this.chart;
    }
  }
  return Topology;

}])
.factory('DataHeatMap', ['Topology', '$http', 'chrome'
  ,function (Topology, $http, chrome) {
  class DataHeatMap extends Topology {

    constructor(container, scope) {
      super(container, scope);
      getDataHeatMap(scope, $http, chrome).then( (option) => this.chart.setOption( option ) );
      console.info(this.chart)
    }

    setIndexPattern(indexPattern) {
      getDataHeatMap(this.scope, $http, chrome, indexPattern).then( (option) => this.chart.setOption( option ) );
    }
  }
  return DataHeatMap;

}]);