import { getClusterTopology, buildChartData } from './helpers';
import Promise from 'bluebird';

export default function (server) {

	server.route({
	  path: '/topology/cluster',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(getClusterTopology(server, req))
      .then(function(topology) {
        reply(buildChartData(topology));
      });
    }
	});

	return server;
}