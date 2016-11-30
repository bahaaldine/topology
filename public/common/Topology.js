import uiModules from 'ui/modules';
import { initChart, getDataHeatMap } from './chart_utils';


uiModules
.get('app/topology', [])
.factory('Topology', ['$http', 'chrome', function ($http, chrome) {
  class Topology {

    constructor(container) {
      $http.get(chrome.addBasePath('/topology/cluster_health'))
      .then( (health) => {
        this.description = health.data;
      }.bind(this));

      this.chart = initChart(container);
    }

    getChart() {
      return this.chart;
    }
  }
  return Topology;

}])
.factory('DataHeatMap', ['Topology', '$http', 'chrome',function (Topology, $http, chrome) {
  class DataHeatMap extends Topology {

    constructor(container) {
      super(container);
      getDataHeatMap($http, chrome).then( (option) => this.chart.setOption( option ) );
    }
  }
  return DataHeatMap;

}]);