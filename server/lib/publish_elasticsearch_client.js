import { once, bindKey } from 'lodash';
import url from 'url';
import Promise from 'bluebird';
import elasticsearch from 'elasticsearch';
import initTopologyClientConfig from './init_topology_client_config';

function createElasticsearchClient(options, uri, ssl) {
  return new elasticsearch.Client({
    host: url.format(uri),
    ssl: ssl,
    plugins: options.plugins,
    keepAlive: options.keepAlive,
    defer: function () {
      return Promise.defer();
    }
  });
}

function publishClient(server) {
  return function() {
    const config = server.config();
    let client = server.plugins.elasticsearch.client;

    /* We only need to publish a dedicated Topology client if 
     * X-Pack security is installed
     */
    if ( Boolean(server.plugins.xpack_main) ) {
      const { options, authUri, noAuthUri, ssl } = initTopologyClientConfig(config);
      client = createElasticsearchClient(options, authUri, ssl);
    } 

    server.on('close', bindKey(client, 'close'));
    server.expose('client', client);
  }
}

const publishElasticsearchClient = once(publishClient);

export default publishElasticsearchClient;