import { catIndices } from './helpers';
import Promise from 'bluebird';

export default function (server) {

	server.route({
	  path: '/topology/indices',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(catIndices(server, req))
      .then(function(indices) {
        reply({indices: indices});
      });
    }
	});

	return server;
}