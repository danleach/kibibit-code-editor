angular.module('kibibitCodeEditor')

.controller('mainController', function($location, $http, ModalService) {

    var vm = this;

    vm.showAModal = function() {
        ModalService.showModal({
          templateUrl: "app/components/yesnoModal/yesnoModalTemplate.html",
          controller: "yesnoModalController",
          controllerAs: "yesnoModalCtrl"
        }).then(function(modal) {
          modal.close.then(function(result) {
            $scope.customResult = "All good!";
          });
        });
      };

    vm.code = "";

    vm.editorOptions = {
        mode: 'javascript',
        theme: 'monokai'
    };

    // initialize the editor session
    vm.aceLoaded = function(_editor) {
        vm.aceSession = _editor.getSession();
    };
    // save the content of the editor on-change
    vm.aceChanged = function() {
        vm.aceDocumentValue = vm.aceSession.getDocument().getValue();
    };

    vm.currentFolder = "";


    // binds the selected tree folder to a variable
    vm.setCurrentFolder = function(node) {
        vm.currentFolder = node.path;
    };


    // show the default projects directory to choose a folder from
    vm.openProject = function() {
        $http.get('/api/userHomeDirectory/')
            .then(function(res) {
                userHomeDirectory = res.data;
                vm.getFolder(userHomeDirectory, function(res) {
                    vm.userHomeDirectory = res.data;
                    console.log('got res: ' + res);
                });
                vm.projectFolder = true;
            });
    };

    // open the chosen project folder 
    vm.openFolder = function() {
        vm.aceSession.setValue(null);
        vm.projectFolder = false;
        console.log(vm.currentFolder);
        vm.getFolder(vm.currentFolder, function(res) {
            vm.workFolder = res.data;
            console.log('got res: ' + res);
        })
    };

    // get folder name once
    vm.getFolder = function(folderToGet, callback) {
        $http.get('/api/directory/' + encodeURIComponent(folderToGet))
            .then(function(res) {
                console.log(res.errno);
                if (res.errno !== null && typeof callback === 'function') {
                    callback(res);
                }
            });
    }


    // get file from the server and update the ace session content  
    vm.onSelection = function(node) {
        if (node.type == 'directory') {
            $http.get('/api/directory/' + encodeURIComponent(node.path))
                .then(function(res) {
                    console.log(res.errno);
                    if (res.errno !== null) {
                        node.children = res.data.children;
                    }
                });
            vm.expandedNodes.push(node);
        } else {
            $http.get('/api/file/' + encodeURIComponent(node.path))
                .then(function(res) {
                    console.log(res.errno);
                    if (res.errno !== null) {
                        vm.aceSession.setValue(res.data);
                    }
                })
        }
    };


    vm.treeOptions = {
        nodeChildren: "children",
        dirSelectable: false
    };
});
