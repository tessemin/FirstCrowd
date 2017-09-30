  ## IMPORTANT FILES:
  #### modules/core/server/controllers/payment.server.controller
  This file allows us to create and execute payment, current support is paypal.
  #### modules/core/server/controllers/modules.depend.server.controller
  This module collects dependant functions and makes the avalible to other modules giving access through the function name.
	Files that end in '.depends' are conglomerated in this module by using chaning starting at the top level includes object under the depends key, like: { indlcuds: someFunctions, depends: someOtherFunctions }
  #### requesters/server/controllers/task
  This directory contains the task functions that are used by both workers and requesters task functionalities.
  
