import get_cluster_health from './get_cluster_health'
import get_data_heat_map from './get_data_heat_map'

export default function (server) {
	server = get_cluster_health(server);
	server = get_data_heat_map(server);
};
