import { getClusterHealth } from './helpers';
import Promise from 'bluebird';
import Boom from 'boom';

export default function (server) {

	server.route({
	  path: '/topology/cluster_health',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(getClusterHealth(server, req))
      .then(function(health) {
        reply( health[0] );
      })
      .catch(function(err){
        reply(Boom.badRequest(err.name + ': ' + err.message));
      });
    }
	});

	return server;
}