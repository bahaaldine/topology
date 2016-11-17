import { catShards } from './helpers';
import Promise from 'bluebird';

export default function (server) {

	server.route({
	  path: '/topology/shards',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(catShards(server, req))
      .then(function(shards) {
        reply({shards: shards});
      });
    }
	});

	return server;
}