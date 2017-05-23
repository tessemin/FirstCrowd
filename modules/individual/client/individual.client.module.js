(function (app) {
  'use strict';

  app.registerModule('individual', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  // app.registerModule('individual.admin', ['core.admin']);
  // app.registerModule('individual.admin.routes', ['core.admin.routes']);
  app.registerModule('individual.services');
  app.registerModule('individual.routes', ['ui.router', 'core.routes', 'individual.services']);
}(ApplicationConfiguration));
