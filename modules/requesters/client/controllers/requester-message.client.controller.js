(function () {
  'use strict';

  angular
    .module('requesters')
    .controller('RequestersMessagesController', RequestersMessagesController);

  RequestersMessagesController.$inject = ['RequestersService', 'Notification', '$http'];

  function RequestersMessagesController(RequestersService, Notification, $http) {
    var vm = this;
    vm.showSubmissions = true;
    vm.showMessages = true;
    vm.sendMessage = {};
    vm.messageRecipient = '';
    vm.sidebar = {};
    vm.activeTaskType = '';
    vm.loadedMessages = {};
    vm.messageView = {};
    vm.messageView.task = {};

    function getTaskError(err) {
      Notification.error({ message: err, title: '<i class="glyphicon glyphicon-remove"></i> Error getting tasks!' });
    }

    function loadSidebarTasks(tasks) {
      vm.sidebar.tasks = tasks;
    }

    vm.sidebar.getTasks = function(taskType) {
      vm.sortTabs = {};
      vm.sortTabs.all = true;
      vm.sidebar.tasks = [];
      switch(taskType) {
        case 'active':
          vm.activeTaskType = 'Active';
          getActiveTasks(function(tasks) { return loadSidebarTasks(tasks) });
          break;
        case 'all':
          vm.activeTaskType = 'All';
          getAllTasks(function(tasks) { loadSidebarTasks(response.tasks); });
          break;
        case 'completed':
          vm.activeTaskType = 'Completed';
          getCompletedTasks(function(tasks) { return loadSidebarTasks(tasks) });
          break;
        case 'uncompleted':
          vm.activeTaskType = 'Uncompleted';
          getRejectedTasks(function(tasks) { return loadSidebarTasks(tasks) });
          break;
        case 'recent':
          vm.activeTaskType = 'Recent';
          getRecentMessages();
          break;
      }
    };

    function loadIncrementalSidebarTasks(tasks) {
      if (tasks) {
        vm.sidebar.tasks = vm.sidebar.tasks.concat(tasks);
      }
    }

    function getAllTasks() {
      getActiveTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
      getCompletedTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
      getRejectedTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
    }

    function getRecentMessages() {
      vm.messageView = {};
      vm.sidebar.tasks = [];
      vm.messageView.messages = [];
      vm.messageView.task = {};
      vm.messageView.task.title = vm.activeTaskType;
      getActiveTasks(function(tasks) { return loadRecent(tasks) });
      getCompletedTasks(function(tasks) { return loadRecent(tasks) });
      getRejectedTasks(function(tasks) { return loadRecent(tasks) });
      function loadRecent(tasks) {
        tasks.forEach(function(task) {
          task.jobs.forEach(function(job) {
            asyncGetTaskFiles(task, job.worker.workerId, function(task, messages) {
              var recentTimeStamp = getRecentDefTime();
              var recentMsges = [];
              for (var msg = 0; msg < messages.length; msg++) {
                if (messages[msg].timeStamp > recentTimeStamp) {
                  messages[msg].task = task;
                  messages[msg].workerId = job.worker.workerId;
                  recentMsges.push(messages[msg]);
                } else {
                  break;
                }
              }
              if (recentMsges.length > 0) {
                vm.sidebar.tasks.push(task);
                loadAndSortMessages(recentMsges);
              }
            });
          });
        });
      }
    }

    function getRecentDefTime() {
      var d = new Date();
      d.setDate(d.getDate() - 2);
      return d.getTime()/1000*60;
    }

    function getActiveTasks(callBack) {
      RequestersService.getActiveTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getCompletedTasks(callBack) {
      RequestersService.getCompletedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getRejectedTasks(callBack) {
      RequestersService.getRejectedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    vm.loadMessages = function(task) {
      // sets the origanal sort tab
      if (!vm.sortTabs) {
        vm.sortTabs = {};
        vm.sortTabs.all = true;
      }
      vm.messageView = {};
      vm.messageView.task = task;
      vm.messageView.taskMessage = task;
      task.jobs.forEach(function(job) {
        asyncGetTaskFiles(task, job.worker.workerId, function(task, messages) {
          vm.messageView.messages = messages.map(function(msg) {
            msg.task = task;
            msg.workerId = job.worker.workerId;
            return msg;
          });
        });
      });
    };

    vm.selectTask = function(task) {
      if (vm.messageView.task !== task) {
        vm.messageView.task = task;
        vm.loadMessages(task);
        vm.closeSendMessage();
      }
    };

    vm.loadMessagesIncrementally = function(tasks) {
      vm.messageView = {};
      vm.messageView.messages = [];
      vm.messageView.task = {};
      vm.messageView.task.title = vm.activeTaskType;
      tasks.forEach(function(task) {
        task.jobs.forEach(function(job) {
          asyncGetTaskFiles(task, job.worker.workerId, function(task, messages) {
            loadAndSortMessages(messages.map(function(msg) {
                msg.task = task
                msg.workerId = job.worker.workerId;
                return msg;
              }));
          });
        });
      });
    };

    async function asyncGetTaskFiles(task, workerId, callBack) {
      await RequestersService.getDownloadableTaskFiles({
        taskId: task._id,
        workerId: workerId
      })
      .then(function(response) {
        if (response.down) {
          return callBack(task, response.down)
        } else
        return callBack(task)
      })
      .catch(function(response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error getting messages!' });
      });
    }

    function loadAndSortMessages(messages) {
      vm.messageView.messages = vm.messageView.messages.concat(messages);
      vm.messageView.messages.sort(function(taskA, taskB) {
        if (taskA.timeStamp > taskB.timeStamp) return -1;
        if (taskA.timeStamp < taskB.timeStamp) return 1;
        return 0;
      });
      return vm.messageView.messages;
    }

    vm.minutesToReadable = function(minutes) {
      var date = new Date(minutes*1000/60);
      return date.toDateString() + ' at ' + date.getHours() + ':' + (date.getMinutes() <= 9 ? '0' : '') + date.getMinutes();
    };

    vm.previousSubmissionDownload = function previousSubmissionDownload(file, workerId) {
      console.log(file);
      if (Array.isArray(file)) {
        file.forEach (function (fil) {
          vm.previousSubmissionDownload(fil);
        });
        return null;
      }
      $http({
          url: '/api/requesters/task/file/download',
          method: "POST",
          data: {
            fileName: file.name,
            timeStamp: file.timeStamp,
            taskId: vm.messageView.task._id,
            workerId: workerId
          },
          responseType: 'blob'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], { type: data.type });
        var fileName = headers('content-disposition');
        // this uses file-saver.js in public/lib
        saveAs(blob, fileName);
      }).error(function (data, status, headers, config) {
        Notification.error({ message: 'Unable to download the file', title: '<i class="glyphicon glyphicon-remove"></i> Download Error!' });
      });
    };

    vm.trimMessage = function(message) {
      return message.split('###').reduce(function(arry, msg) { if((msg = msg.trim())) arry.push(msg); return arry; }, []);
    };

    vm.sidebar.sortTasks = function(sortType) {
      vm.sortTabs = {};
      switch(sortType) {
        case 'messages':
          vm.sortTabs.messages = true;
          vm.showSubmissions = false;
          vm.showMessages = true;
          break;
        case 'submissions':
          vm.sortTabs.submissions = true;
          vm.showSubmissions = true;
          vm.showMessages = false;
          break;
        case 'all':
        default:
          vm.sortTabs.all = true;
          vm.showSubmissions = true;
          vm.showMessages = true;
      }
    };

    vm.joinFileNames = function(files) {
      files = files.reduce(function(done, ele) { if (ele.name) return done += ele.name + ', ' }, '');
      return files.slice(0, files.length - 2);
    };

    vm.getReadableDate = function(time) {
      return (new Date(time)).toDateString();
    };

    async function sendMessage(task, workerId) {
      RequestersService.sendMessage({
        taskId: task._id,
        message: vm.sendMessage.message,
        workerId: workerId
      })
      .then(function(res) {
        vm.closeSendMessage();
        if (vm.messageView.task === task) {
          vm.messageView.messages.unshift(res.data);
        }
        Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-remove"></i> Message Sent!' });
      })
      .catch(function(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Message Error!' });
      });
    }
    vm.sendMessage.toAll = function() {
      vm.messageView.taskMessage.jobs.forEach(function(job) {
        vm.sendMessage.send(job.worker.workerId);
      });
    };
    vm.sendMessage.send = function(workerId) {
      if (workerId === '') {
        vm.sendMessage.toAll();
      } else {
        sendMessage(vm.messageView.taskMessage, workerId);
      }
    };

    vm.collapseAllMessages= function() {
      var eles = angular.element(document.getElementsByClassName('message'));
      $(eles).collapse('hide');
    }

    vm.closeSendMessage = function() {
      vm.sendMessage.expanded = false;
      vm.sendMessage.message = '';
      vm.messageRecipient = '';
    };
  }
}());
