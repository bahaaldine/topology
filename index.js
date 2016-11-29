import Promise from 'bluebird';
import topologyRoutes from './server/routes/api';
import publishElasticsearchClient from './server/lib/publish_elasticsearch_client';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],

    uiExports: {
      
      app: {
        title: 'topology',
        description: 'a cluster Topology explorer',
        main: 'plugins/topology/app',
        icon: 'plugins/topology/topology.png',
      },
      
      hacks: [
        'plugins/topology/hack'
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        elasticsearch: {
          username: Joi.string(),
          password: Joi.string(),
          url: Joi.string(),
          ssl: {
            cert: Joi.string(),
            key: Joi.string(),
            ca: Joi.array().items(Joi.string()),
            verify: Joi.boolean()
          }
        }
      }).default();
    },
    
    init(server, options) {
      
      var plugin = this;
      topologyRoutes(server);

      plugin.status.yellow('Waiting for Topology');
      server.plugins.elasticsearch.status.on('green', function () {
        Promise.try(publishElasticsearchClient(server))
          .then(function (arg) {
            plugin.status.green('Ready.'); 
          })
          .catch(console.log.bind(console));
      });
      
    }    

  });
};
