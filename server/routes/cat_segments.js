import { catSegments } from './helpers';
import Promise from 'bluebird';

export default function (server) {

	server.route({
	  path: '/topology/segments',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(catSegments(server, req))
      .then(function(segments) {
        reply({segments: segments});
      });
    }
	});

	return server;
}