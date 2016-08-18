angular.module('kibibitCodeEditor')

.controller('mainController', [
  '$scope',
  '$http',
  'ngDialog',
  'SettingsService',
  'SessionStorageService',
  '$auth',
  function(
    $scope,
    $http,
    ngDialog,
    SettingsService,
    SessionStorageService,
    $auth) {

    var vm = this;

    window.mainCtrl = vm; // for debugging

    vm.emptyEditor = emptyEditor;
    vm.isModalCancel = isModalCancel;
    vm.isSidebarOpen = false; // for mobile view
    vm.openFile = '';
    vm.openProject = openProject;
    vm.settings = SettingsService.settings;
    vm.showProjectSelectModal = showProjectSelectModal;
    vm.isAuthenticated = isAuthenticated;
    vm.authenticate = authenticate;

    init();
    getUser();

    ////////////
    
    function authenticate(provider) {
      $auth.authenticate('github').then(function(data) {
        getUser();
      });
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    };

    function getUser() {
      $http.get('/auth/getUser').then(function(res) {
        vm.user = res.data.user;
      });
    }

    function emptyEditor() {
      vm.projectFolderPath = '';
      vm.projectName = undefined;
      vm.openFile = '';
      SessionStorageService.removeItem('projectFolderPath');
      SessionStorageService.removeItem('projectName');
    }

    function getFolderNameFromPath(path) {
      if (!path) {
        return '';
      }

      return path.split(/\/|\\/).reverse()[0];
    }

    function init() {
      if (SessionStorageService.projectFolderPath) {
        vm.projectFolderPath = sessionStorage.projectFolderPath;
        console.debug('last project loaded from session storage');
      }

      if (SessionStorageService.openFile) {
        vm.openFile = sessionStorage.openFile;
        console.debug('last file loaded from session storage');
      }

      if (SessionStorageService.projectName) {
        vm.projectName = SessionStorageService.projectName;
        console.debug('last project name loaded from session storage');
      }

      $scope.$watch(function() {
        return vm.openFile;
      }, function(newVal) {
        SessionStorageService.openFile = newVal;
        console.debug('last file saved to session storage');
      });
    }

    function isModalCancel(closeValue) {
      return (_.isNumber(closeValue) && closeValue === 0)
              || (_.isString(closeValue)
                && (closeValue === '$document'
                  || closeValue === '$closeButton'));
    }

    function openProject() {
      $http.get('/api/userHomeDirectory/')
        .then(function(res) {
          vm.userHomeDirectoryPath = res.data;
          vm.showProjectSelectModal();
        });
    }

    function setOpenProject(selectedProjectFolderPath) {
      if (!vm.isModalCancel(selectedProjectFolderPath.value)) {
        vm.projectFolderPath = selectedProjectFolderPath.value;
        vm.projectName = getFolderNameFromPath(vm.projectFolderPath);

        SessionStorageService.projectName = vm.projectName;
        SessionStorageService.projectFolderPath = vm.projectFolderPath;
        console.debug('project path saved to session storage');
        vm.settings.recentlyOpen.push(vm.projectFolderPath);
        if (vm.openFile !== '') {
          vm.openFile = '';
        }
      }
    }

    function showProjectSelectModal() {
      ngDialog.open({
        template:
          'app/components/projectFolderModal/projectFolderModalTemplate.html',
        controller: 'projectFolderModalController',
        controllerAs: 'projectFolderModalCtrl',
        className: 'ngdialog-theme-default',
        scope: $scope,
        data: {
          userHomeDirectoryPath: vm.userHomeDirectoryPath
        }
      }).closePromise.then(setOpenProject);
    }

  }]);
