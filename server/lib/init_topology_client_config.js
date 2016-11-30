import { pick, clone } from 'lodash';
import url from 'url';
import { readFileSync } from 'fs';

const readFile = file => readFileSync(file, 'utf8');
const configPrefix = 'topology';

function getElasticsearchConfig(config, isRemoteKibana) {
  /* if Topology requires a specific user to get cluster level information
   * then we grab the username and password from the topology configuration
   */
  const authConfig = pick(config.get(`${configPrefix}.elasticsearch`), 'username', 'password');
  
  let urlConfig = pick(config.get('elasticsearch'), 'url', 'ssl');
  if ( isRemoteKibana ) {
    urlConfig = pick(config.get(`${configPrefix}.elasticsearch`), 'url', 'ssl');
  }

  const esConfig = { ...urlConfig, ...authConfig };

  return {
    ...esConfig,
    configSource: isRemoteKibana ? 'remote' : 'local',
    keepAlive: true
  };
}

function getSSLconfiguration(config) {
  const sslConfig = config.ssl;

  sslConfig.rejectUnauthorized = sslConfig.verify;
  if (sslConfig.cert && sslConfig.key) {
    sslConfig.cert = readFile(sslConfig.cert);
    sslConfig.key = readFile(sslConfig.key);
  }
  if (sslConfig.ca) {
    sslConfig.ca = sslConfig.ca.map(readFile);
  }

  return sslConfig;
}

function getElasticsearchURL(config, withAuthentification) {
  const elasticsearchURL = url.parse(config.url);

  if ( withAuthentification ) {
    if (config.username && config.password) {
      elasticsearchURL.auth = `${config.username}:${config.password}`;
    }
  }
  return elasticsearchURL;
}

function getConfigObjects(config, isRemoteKibana) {
  const elastisearchConfig = getElasticsearchConfig(config, isRemoteKibana);

  return { 
    options: elastisearchConfig
    , noAuthUri: getElasticsearchURL(elastisearchConfig, false)
    , authUri: getElasticsearchURL(elastisearchConfig, true)
    , ssl: getSSLconfiguration(elastisearchConfig)
  };
}

export default function initTopologyClientConfiguration(config) {
  const isRemoteKibana = Boolean(config.get(`${configPrefix}.elasticsearch.url`));
  const configObjects = getConfigObjects(config, isRemoteKibana);

  if (!isRemoteKibana) {
    config.set(`${configPrefix}.elasticsearch`, pick(configObjects.options, 'url', 'username', 'password'));
    config.set(`${configPrefix}.elasticsearch.ssl`, pick(configObjects.ssl, 'verify', 'cert', 'key', 'ca'));
  }

  delete configObjects.options.ssl;
  delete configObjects.ssl.verify;

  return { ...configObjects };
}
