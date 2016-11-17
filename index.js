import topologyRoutes from './server/routes/api';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],

    uiExports: {
      
      app: {
        title: 'topology',
        description: 'a cluster Topology explorer',
        main: 'plugins/topology/app'
      },
      
      hacks: [
        'plugins/topology/hack'
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initalize the plugin here
      topologyRoutes(server);
    }    

  });
};
