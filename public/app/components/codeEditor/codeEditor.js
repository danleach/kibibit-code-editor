angular.module('kibibitCodeEditor')

.directive('kbCodeEditor', function() {
  return {
    scope: {},
    bindToController: {
      openFile: '=kbOpenFile'
    },
    controller: 'codeEditorController',
    controllerAs: 'codeEditorCtrl',
    templateUrl: 'app/components/codeEditor/codeEditorTemplate.html',
    link: function(scope, element, attrs, codeEditorCtrl) {
      scope.$watch('codeEditorCtrl.openFile', function(newOpenFile) {
        codeEditorCtrl.updateFileContent(newOpenFile);
      });
    }
  };
})

.controller('codeEditorController', [
  '$timeout',
  'FileService',
  'SettingsService',
  function(
    $timeout,
    FileService,
    SettingsService) {

    var vm = this;
    var editor;
    var editorSettings = SettingsService.settings.editorSettings;

    var init = function(settings) {
      editor.setOptions({
        'wrap': settings.lineWrap,
        'mode': 'ace/mode/' + settings.syntaxMode,
        'theme': 'ace/theme/' + settings.theme,
        'tabSize': settings.tabWidth,
        'fontSize': settings.fontSize,
        'showGutter': settings.isGutter,
        'useSoftTabs': settings.isSoftTabs,
        'showPrintMargin': settings.ruler
      });
    };

    // initialize the editor session
    vm.aceLoaded = function(_editor) {
      editor = _editor;
      vm.aceSession = editor.getSession();
      vm.undoManager = editor.getSession().getUndoManager();
      SettingsService.settings.currentUndoManager = vm.undoManager;
      SettingsService.settings.currentEditor = editor;
      init(editorSettings);
      // save cursor position
      editor.on('changeSelection', function() {
        $timeout(function() {
          var cursor = editor.selection.getCursor();
          cursor.row++;
          SettingsService.settings.cursor = cursor;
        });
      });
    };

    // save the content of the editor on-change
    vm.aceChanged = function(_editor) {
      vm.aceDocumentValue = vm.aceSession.getDocument().getValue();
      vm.editorOptions.mode = vm.fileInfo && vm.fileInfo.mimeType ? vm.fileInfo.mimeType.match(/\/(x-)?(.*)$/)[2] : '';
      vm.aceSession.setMode('ace/mode/' + vm.editorOptions.mode.toLowerCase());
      console.debug('changed mode to ' + vm.editorOptions.mode);
    };

    vm.attachedEditorFunctions = {
      onLoad: vm.aceLoaded,
      onChange: vm.aceChanged
    };

    vm.updateFileContent = function(filePath) {
      if (filePath !== '') {
        FileService.getFile(filePath, function(fileInfo) {
          vm.fileInfo = fileInfo.data;
          vm.code = vm.fileInfo.content;
        });
      }
    };
  }
])

.directive('kbChangeAceScroll', function() {
  return {
    scope: false,
    link: function(scope, element, attrs) {
      var scrollbarY = element.parent().find('.ace_scrollbar.ace_scrollbar-v');
      var scrollbarX = element.parent().find('.ace_scrollbar.ace_scrollbar-h');
      scope.$watch(function() {
        return scrollbarY.find('.ace_scrollbar-inner').height();
      }, updateY);
      scope.$watch(function() {
        return scrollbarX.find('.ace_scrollbar-inner').width();
      }, updateX);
      scope.config = {
        scrollButtons: {
          scrollAmount: 'auto', // scroll amount when button pressed
          enable: false // enable scrolling buttons by default
        },
        scrollInertia: 400, // adjust however you want
        axis: 'yx', // enable 2 axis scrollbars by default,
        theme: 'minimal',
        autoHideScrollbar: true
      };
      function updateY(newVal, oldVal) {
        console.log('update scroll Y');
      }

      function updateX(newVal, oldVal) {
        console.log('update scroll X');
      }
    }
  };
});
