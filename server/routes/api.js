import cat_indices from './cat_indices'
import cat_shards from './cat_shards'
import cat_segments from './cat_segments'
import get_cluster_topology from './get_cluster_topology'

export default function (server) {
	server = cat_indices(server);
	server = cat_shards(server);
	server = cat_segments(server);
	server = get_cluster_topology(server);
};
