(function () {
  'use strict';

  angular
    .module('workers')
    .controller('WorkersMessagesController', WorkersMessagesController);

  WorkersMessagesController.$inject = ['WorkersService', 'Notification', '$http'];

  function WorkersMessagesController(WorkersService, Notification, $http) {
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
      currentMessageTimers.forEach(function(timer) { clearInterval(timer); });
      vm.messageView.messages = [];
      vm.messageView.task = {};
      vm.messageView.title = '';
      vm.resetSendMessage();
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
          getAllTasks(function(tasks) { return loadSidebarTasks(response.tasks); });
          break;
        case 'recomended':
          vm.activeTaskType = 'Recomended';
          getRecomendedTasks(function(tasks) { return loadSidebarTasks(tasks) });
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
          vm.messageView.taskMessage = null;
          vm.sidebar.tasks = [];
          getRecentMessages();
          break;
      }
    };

    function loadIncrementalSidebarTasks(tasks) {
      if (tasks) {
        vm.sidebar.tasks = vm.sidebar.tasks.concat(tasks);
      }
    }

    function getAllTasks(callBack) {
      getActiveTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
      getRecomendedTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
      getCompletedTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
      getRejectedTasks(function(tasks) { return loadIncrementalSidebarTasks(tasks) });
    }

    function getRecentMessages() {
      vm.sidebar.tasks = [];
      vm.messageView.title = vm.activeTaskType;
      var allTasks = [];
      (async function() {
        await getActiveTasks(function(tasks) { return loadRecent(tasks) });
        await getRecomendedTasks(function(tasks) { return loadRecent(tasks) });
        await getCompletedTasks(function(tasks) { return loadRecent(tasks) });
        await getRejectedTasks(function(tasks) { return loadRecent(tasks) });
        console.log(allTasks)
        vm.loadMessagesIncrementally(allTasks);
      }())
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
      return WorkersService.getActiveTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getRecomendedTasks(callBack) {
      return WorkersService.getRecomendedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    function getCompletedTasks(callBack) {
      return WorkersService.getCompletedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }
    function getRejectedTasks(callBack) {
      return WorkersService.getRejectedTasks()
        .then(function(res) { callBack(res.tasks) })
        .catch(function(res) { getTaskError(res.message); callBack(); });
    }

    vm.loadMessages = function(task, timeStamp) {
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
      asyncGetTaskFiles(task, function(task, messages) {
        loadAndSortMessages(messages.map(function(msg) {
          msg.task = task;
          return msg;
        }));
      }, loadTime);
    };

    vm.loadMessagesIncrementally = function(tasks, refresh) {
      var time = null;
      if (refresh) {
        vm.resetSendMessage();
        vm.messageView.messages = [];
        time = 0;
      }
      tasks ? vm.messageView.task = tasks : tasks = vm.messageView.task;
      if (Array.isArray(tasks)) {
        vm.messageView.title = vm.activeTaskType;
        tasks.forEach(function(task) {
          vm.loadMessages(task, time);
        });
      } else {
        vm.messageView.title = tasks.title;
        vm.messageView.taskMessage = tasks;
        vm.loadMessages(tasks, time);
      }
      setNewMessageTimer(vm.loadMessagesIncrementally);
    };

    async function asyncGetTaskFiles(task, callBack, sinceTimeX) {
      await WorkersService.getDownloadableTaskFiles({
        taskId: task._id,
        sinceTimeX: sinceTimeX
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

    vm.previousSubmissionDownload = function previousSubmissionDownload(file) {
      if (Array.isArray(file)) {
        file.forEach (function (fil) {
          vm.previousSubmissionDownload(fil);
        });
        return null;
      }
      $http({
          url: '/api/workers/task/file/download',
          method: "POST",
          data: {
            fileName: file.name,
            timeStamp: file.timeStamp,
            taskId: vm.messageView.taskMessage._id
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
          // all is default
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

    vm.sendMessage.send = function() {
      async function sendMessage(task) {
        WorkersService.sendMessage({
          taskId: task._id,
          message: vm.sendMessage.message
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
      sendMessage(vm.messageView.taskMessage);
    }

    vm.collapseAllMessages= function() {
      var eles = angular.element(document.getElementsByClassName('message'));
      $(eles).collapse('hide');
    }

    vm.closeSendMessage = function() {
      vm.sendMessage.expanded = false;
      vm.sendMessage.message = '';
    };
    
    async function setNewMessageTimer(func) {
      if (currentMessageTimers)
        while(currentMessageTimers.length) {
          window.clearInterval(currentMessageTimers.shift());
        }
      
      currentMessageTimers.push(setTimeout(func, messageRefreshSpeed));
    }
    
    vm.resetSendMessage = function() {
      vm.sendMessage.message = '';
      vm.messageView.taskMessage = null;
      vm.closeSendMessage();
    };
  }
}());
