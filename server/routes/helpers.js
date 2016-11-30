import _ from 'lodash';
import Promise from 'bluebird';

const healthColors = {
	index: {
		green: '#4CAF50',
		yellow: '#F9A825',
		red: '#F44336'
	},
	shard: {
		started: '#03A9F4',
		unassigned: '#9E9E9E'
	}
}

function catHealth(client) {
	return client.cat.health({format: 'json'});
}

function catIndices(client, indexPattern) {
	return client.cat.indices({format: 'json', index: indexPattern});
}

function catShards(client, index) {
	return client.cat.shards({format: 'json', index: index});
}

function catSegments(client, index) {
	return client.cat.segments({format: 'json', index: index});
}

function toMB(value) {
	if ( value ) {
		const parsedValue = parseInt(value.substring(0, value.length - 2));
		switch ( value.slice(-2) ) {
			case 'kb': return (parsedValue / 1024).toFixed(2) ;
			case 'gb': return (parsedValue * 1024).toFixed(2) ;
			case 'tb': return (parsedValue * 1024 * 1024).toFixed(2) ;
			default: return parsedValue
		}
	} else {
		return 0;
	}
}

function getDataHeatMap(server, req) {
	return function() {
		return getIndicesTopology(server, req).then( (indexTopology) => buildTreeMap(indexTopology) );
	}
}

function buildTreeMap(topology = {}) {
	return {
		cluster: topology.health,
		treemap: _.map(topology.indices, (indexItem, indexName) => {
			return {
				...indexItem,
				value: toMB(indexItem['store.size']),
				name: indexName,
				path: indexName,
				color: healthColors.index[indexItem.health],
				children: _.map(indexItem.shards, (shardItem, shardName) => {
					return {
						...shardItem,
						value: shardItem.store == null ? 0 : toMB(shardItem.store),
						name: shardName,
						path: indexName + '/' + shardName,
						color: healthColors.shard[shardItem.state.toLowerCase()],
						children: _.map(shardItem.segments, (segmentItem, segmentName) => {
							return {
								...segmentItem,
								value: toMB(segmentItem['size']),
								name: segmentName,
								path: indexName + '/' + shardName+ '/' + segmentName
							}
						})
					}
				})
			}
		})
	}
}

function getClusterHealth(server, req) {
	const client = server.plugins.topology.client;
	return function() {
		return catHealth(client);
	}
}

function getIndicesTopology(server, req) {
	const client = server.plugins.topology.client;
	const indexPattern = req.query.indexPattern;

	let topology = { health: {}, indices : {} };

	return catHealth(client).then( (catHealthResponse) => {
		topology.health = catHealthResponse[0];

		return catIndices(client, indexPattern).then( (catIndicesResponse) => {
			// adding each index to the topology
			catIndicesResponse.map(index => {
				topology.indices[index.index] = { ...index };
				topology.indices[index.index].shards = { };
			});			
			
			// preparing a comma separated string of index name for shards and segments apix@
			const shardPromises = _.chain(catIndicesResponse)
				.map( (item) => item.index )
				.chunk(20)
				.map( (indices) => catShards(client, indices.join(',')) )
				.value()

			const segmentPromises = _.chain(catIndicesResponse)
				.map( (item) => item.index )
				.chunk(20)
				.map( (indices) => catSegments(client, indices.join(',')) )
				.value()

			
			return Promise.all(shardPromises).then( (catShardsResponse) => {
				function getShardTypeName(shardType) {
					return shardType == 'p' ? 'primary' : 'replica'; 
				}

				// adding each shard to the relative index topology document
				[].concat(...catShardsResponse).map(shard => {
					topology.indices[shard.index].shards[getShardTypeName(shard.prirep) + '-' + shard.shard] = { ...shard };
					topology.indices[shard.index].shards[getShardTypeName(shard.prirep) + '-' + shard.shard].segments = {};
				});

				return Promise.all(shardPromises).then( (catSegmentsResponse) => {
					
					// adding each segment to the relative shards
					[].concat(...catSegmentsResponse).map(segment => {
						// segments exist only for assigned shards
						if ( typeof topology.indices[segment.index].shards[getShardTypeName(segment.prirep) + '-' + segment.shard] != "undefined" ) {
							topology.indices[segment.index].shards[getShardTypeName(segment.prirep) + '-' + segment.shard].segments['segment-' + segment.segment] = { ...segment };
						}
					});

					return topology;
				});
			});
		});
	});
}

export {
	getClusterHealth,
	getDataHeatMap
};