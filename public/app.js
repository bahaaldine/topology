import moment from 'moment';
import chrome from 'ui/chrome';
import uiModules from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import 'plugins/topology/../node_modules/angular-material/angular-material.min.js';
import 'plugins/topology/../node_modules/angular-material/angular-material.min.css';
import 'angular-aria';
import 'angular-animate';


// core dependendies
import './common/Topology.js';

// templates & css
import template from './views/index.html';
import './views/index.less';
import './views/index.js';

// UI Routes
uiRoutes.enable();
uiRoutes
.when('/', {
  template,
  controller: 'indexController'
});
