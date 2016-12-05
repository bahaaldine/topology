import {  getDataHeatMap } from './helpers';
import Promise from 'bluebird';
import Boom from 'boom';

export default function (server) {

	server.route({
	  path: '/topology/data_heat_map',
	  method: 'GET',
	  handler: function (req, reply) {
      Promise.try(getDataHeatMap(server, req))
      .then(function(topology) {
        reply(topology);
      })
      .catch(function( err ) {
        reply({});
      });
    }
	});

	return server;
}