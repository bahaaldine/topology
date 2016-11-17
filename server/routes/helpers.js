import _ from 'lodash';

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
	return _.map(topology.indices, (indexItem, indexName) => {
		return {
			value: toMB(indexItem['store.size']),
			name: indexName,
			path: indexName,
			children: _.map(indexItem.shards, (shardTypeItem, shardType) => {
				const shardTypeName = shardType == 'p' ? 'primary' : 'replica'; 
				return {
					value: Object.keys(shardTypeItem).length,
					name: shardTypeName ,
					path: indexName + "/" + shardTypeName,
					children: _.map(shardTypeItem, (shardItem, shardName) => {
						return {
							value: shardItem.store == null ? 0 : toMB(shardItem.store),
							name: shardName,
							path: indexName + "/" + shardTypeName + "/" + shardName,
							children: _.map(shardItem.segments, (segmentItem, segmentName) => {
								return {
									value: toMB(segmentItem['size']),
									name: segmentName,
									path: indexName + "/" + shardTypeName + "/" + shardName + "/" + segmentName
								}
							})
						}
					})
				} 
			})
		}
	});
}

function getClusterTopology(server) {
	const client = server.plugins.elasticsearch.client;
	var topology = { indices : {} };
	return function() {
		return client.cat.indices({format: 'json'}).then(function(catIndicesResponse) {
			// adding each index to the topology
			catIndicesResponse.map(index => {
				topology.indices[index.index] = { ...index };
				topology.indices[index.index].shards = { p:{} , r:{} };
			});			
			
			// preparing a comma separated string of index name for shards and segments api
			const indexNames = catIndicesResponse.map(index => {
				return index.index;
			}).join(',');

			return client.cat.shards({format: 'json', index: indexNames}).then(function(catShardsResponse) {
				// adding each shard to the relative index topology document
				catShardsResponse.map(shard => {
					topology.indices[shard.index].shards[shard.prirep][shard.shard] = { ...shard };
					topology.indices[shard.index].shards[shard.prirep][shard.shard].segments = {};
				});

				return client.cat.segments({format: 'json', index: indexNames}).then(function(catSegmentsResponse) {
					
					// adding each segment to the relative shards
					catSegmentsResponse.map(segment => {
						// segments exist only for assigned shards
						if ( typeof topology.indices[segment.index].shards[segment.prirep][segment.shard] != "undefined" ) {
							topology.indices[segment.index].shards[segment.prirep][segment.shard].segments[segment.segment] = { ...segment };
						}
					});

					return topology;
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