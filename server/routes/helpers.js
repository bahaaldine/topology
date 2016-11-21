import _ from 'lodash';

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

function catIndices(server) {
	const client = server.plugins.elasticsearch.client;
	return function() {
		return client.cat.indices({format: 'json'});
	} 
}

function catShards(server) {
	const client = server.plugins.elasticsearch.client;
	return function() {
		return client.cat.shards({format: 'json'});
	} 
}

function catSegments(server) {
	const client = server.plugins.elasticsearch.client;
	return function() {
		return client.cat.segments({format: 'json'});
	} 
}

function toMB(value) {
	const parsedValue = parseInt(value.substring(0, value.length - 2));
	switch ( value.slice(-2) ) {
		case 'kb': return (parsedValue / 1024).toFixed(2) ;
		case 'gb': return (parsedValue * 1024).toFixed(2) ;
		case 'tb': return (parsedValue * 1024 * 1024).toFixed(2) ;
		default: return parsedValue
	}
}

function buildChartData(topology = {}) {
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

function getClusterTopology(server) {
	const client = server.plugins.elasticsearch.client;
	let topology = { health: {}, indices : {} };
	return function() {
		function getShardTypeName(shardType) {
			return shardType == 'p' ? 'primary' : 'replica'; 
		}

		return client.cat.health({format: 'json'}).then( (catHealthResponse) => {
			topology.health = catHealthResponse[0];

			return client.cat.indices({format: 'json'}).then( (catIndicesResponse) => {
				// adding each index to the topology
				catIndicesResponse.map(index => {
					topology.indices[index.index] = { ...index };
					topology.indices[index.index].shards = { };
				});			
				
				// preparing a comma separated string of index name for shards and segments api
				const indexNames = catIndicesResponse.map(index => {
					return index.index;
				}).join(',');

				return client.cat.shards({format: 'json', index: indexNames}).then( (catShardsResponse) => {
					// adding each shard to the relative index topology document
					catShardsResponse.map(shard => {
						topology.indices[shard.index].shards[getShardTypeName(shard.prirep) + '-' + shard.shard] = { ...shard };
						topology.indices[shard.index].shards[getShardTypeName(shard.prirep) + '-' + shard.shard].segments = {};
					});

					return client.cat.segments({format: 'json', index: indexNames}).then( (catSegmentsResponse) => {
						
						// adding each segment to the relative shards
						catSegmentsResponse.map(segment => {
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
	};
}

export {
	catIndices,
	catShards,
	catSegments,
	getClusterTopology,
	buildChartData
};