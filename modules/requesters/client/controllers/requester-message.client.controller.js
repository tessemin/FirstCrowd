(function () {
  'use strict';

  angular
    .module('requesters')
    .controller('RequestersMessagesController', RequestersMessagesController);

  RequestersMessagesController.$inject = ['RequestersService', 'Notification', '$http'];

  function RequestersMessagesController(RequestersService, Notification, $http) {
    var vm = this;
    var messageRefreshSpeed = 10000;
    vm.showSubmissions = true;
    vm.showMessages = true;
    vm.sendMessage = {};
    vm.sidebar = {};
    vm.activeTaskType = '';
    vm.loadedMessages = {};
    vm.messageView = {};
    vm.messageView.messages = [];
    var currentMessageTimers = [];

    function getTaskError(err) {
      Notification.error({ message: err, title: '<i class="glyphicon glyphicon-remove"></i> Error getting tasks!' });
    }

    function loadSidebarTasks(tasks) {
      vm.sidebar.tasks = tasks;
    }

    vm.sidebar.getTasks = function(taskType) {
      setNewMessageTimer();
      vm.messageView.messages = [];
      vm.messageView.task = {};
      vm.messageView.title = '';
      vm.messageView.taskMessage = null;
      vm.closeSendMessage();
      vm.sidebar.sortTasks('all');
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
      vm.sidebar.tasks = [];
      vm.messageView.title = vm.activeTaskType;
      var allTasks = [];
      (async function() {
        await getActiveTasks(function(tasks) { return loadRecent(tasks) });
        await getCompletedTasks(function(tasks) { return loadRecent(tasks) });
        await getRejectedTasks(function(tasks) { return loadRecent(tasks) });
        vm.loadMessagesIncrementally(allTasks, true, getRecentDefTime());
      }());
      function loadRecent(tasks) {
        allTasks = allTasks.concat(tasks);
        vm.sidebar.tasks = vm.sidebar.tasks.concat(tasks)
      }
    }

    function getRecentDefTime() {
      var d = new Date();
      d.setDate(d.getDate() - 2);
      return d.getTime()/1000*60;
    }

    function getActiveTasks(callBack) {
      return RequestersService.getActiveTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getCompletedTasks(callBack) {
      return RequestersService.getCompletedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getRejectedTasks(callBack) {
      return RequestersService.getRejectedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    vm.loadMessages = async function(task, job, timeStamp) {
      // sets the origanal sort tab
      if (!vm.sortTabs) {
        vm.sortTabs = {};
        vm.sortTabs.all = true;
      }
      var loadTime = 0;
      if (timeStamp) {
        loadTime = timeStamp;
      } else if (vm.messageView.messages && vm.messageView.messages.length > 0 && vm.messageView.messages[0] && vm.messageView.messages[0].timeStamp) {
        loadTime = vm.messageView.messages[0].timeStamp;
      }
      asyncGetTaskFiles(task, job.worker.workerId, function(task, messages) {
        loadAndSortMessages(messages.map(function(msg) {
          msg.task = task;
          msg.workerId = job.worker.workerId;
          msg.displayId = job.worker.displayId;
          return msg;
        }));
      }, loadTime);
    };
    
    vm.loadMessagesIncrementally = function(tasks, refresh, timeStamp) {
      var time = null;
      if (refresh) {
        vm.messageView.messages = [];
        time = 0;
      }
      if (timeStamp)
        time = timeStamp;
      tasks ? vm.messageView.task = tasks : tasks = vm.messageView.task;
      if (Array.isArray(tasks)) {
        tasks.forEach(function(task) {
          task.jobs.forEach(function(job) {
            vm.loadMessages(task, job, time);
          });
        });
      } else {
        tasks.jobs.forEach(function(job) {
          vm.loadMessages(tasks, job, time);
        });
      }
      setNewMessageTimer(vm.loadMessagesIncrementally);
    };

    vm.selectTask = function(task) {
      if (Array.isArray(task)) {
        vm.messageView.title = vm.activeTaskType;
        vm.messageView.taskMessage = null;
      } else {
        vm.messageView.title = task.title;
        vm.messageView.taskMessage = task;
      }
      vm.closeSendMessage();
      vm.messageView.task = task;
      vm.loadMessagesIncrementally(task, true);
    };
    async function asyncGetTaskFiles(task, workerId, callBack, sinceTimeX) {
      await RequestersService.getDownloadableTaskFiles({
        taskId: task._id,
        workerId: workerId,
        sinceTimeX: sinceTimeX
      })
      .then(function(response) {
        if (response.down) {
          return callBack(task, response.down)
        } else
        return callBack(task)
      })
      .catch(function(response) {
        Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Error getting messages!' });
      });
    }

    async function loadAndSortMessages(messages) {
      vm.messageView.messages = vm.messageView.messages.concat(messages);
      vm.messageView.messages.sort(function(taskA, taskB) {
        if (taskA.timeStamp > taskB.timeStamp) return -1;
        if (taskA.timeStamp < taskB.timeStamp) return 1;
        return 0;
      });
      vm.messageView.messages = vm.messageView.messages.filter(function(ele, index, array) { if (index === array.indexOf(ele)) return true; return false; });
      return vm.messageView.messages;
    }

    vm.minutesToReadable = function(minutes) {
      var date = new Date(minutes*1000/60);
      return date.toDateString() + ' at ' + date.getHours() + ':' + (date.getMinutes() <= 9 ? '0' : '') + date.getMinutes();
    };

    vm.previousSubmissionDownload = function previousSubmissionDownload(file, workerId) {
      if (Array.isArray(file)) {
        file.forEach (function (fil) {
          vm.previousSubmissionDownload(fil, workerId);
        });
        return null;
      }
      $http({
          url: '/api/requesters/task/file/download',
          method: "POST",
          data: {
            fileName: file.name,
            timeStamp: file.timeStamp,
            taskId: vm.messageView.taskMessage._id,
            workerId: workerId
          },
          responseType: 'blob'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], { type: data.type });
        var fileName = headers('content-disposition');
        // this uses file-saver.js in public/lib
        saveAs(blob, fileName);
      }).error(function (data, status, headers, config) {
        Notification.error({ message: 'Unable to download the file(s)', title: '<i class="glyphicon glyphicon-remove"></i> Download Error!' });
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
    
    async function setNewMessageTimer(func) {
      if (currentMessageTimers)
        while(currentMessageTimers.length) {
          window.clearInterval(currentMessageTimers.shift());
        }
      if (func)
        currentMessageTimers.push(setTimeout(func, messageRefreshSpeed));
    }
  }
}());
