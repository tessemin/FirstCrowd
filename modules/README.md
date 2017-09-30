  ## IMPORTANT FILES:
  #### modules/core/server/controllers/payment.server.controller
  this file allows us to create and execute payment, current support is paypal
  #### modules/core/server/controllers/modules.depend.server.controller
  this module collects dependant functions and makes the avalible to other modules throught the function name
  files that end in .depends are congrolerated in this module but using chaning and the top level includes object under depends
  like { indlcuds: someFunctions, depends: someOtherFunctions }
  #### requesters/server/controllers/task
  tasks contains the task functions that are used by both workers and requester functionalities
  