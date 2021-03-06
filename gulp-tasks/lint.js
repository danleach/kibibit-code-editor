var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
  rename: {
    'gulp-buddy.js': 'buddy'
  }
});

var argv = require('yargs').argv;
var buildConfig = require('../buildConfig');
var colors = require('colors');
var stripAnsi = require('strip-ansi');
var _ = require('lodash');

module.exports = function() {
  gulp.task('lint',
    'lint ' + colors.blue('all javascript and sass') + ' files',
    ['lint:js', 'lint:sass'],
    _.noop,
    {
      options: {
        'format': '  fix lint problems that can be fixed automatically'
      }
    }
  );

  gulp.task('lint:js',
    'lint ' + colors.blue('all JS') + ' files',
    function() {
      plugins.notify.logLevel(0);
      return gulp.src(['gulpfile.js', 'gulp-tasks/**/*.js'])
        .pipe(plugins.plumber(buildConfig.options.plumber))
        .pipe(plugins.if(buildConfig.flags.watch, plugins.cached('linting')))
        .pipe(plugins.eslint({
          fix: argv.format ? true : false
        }))
        .pipe(plugins.eslint.format())
        // if fixed, write the file to dest
        .pipe(plugins.if(isFixed, gulp.dest('.')))
        .pipe(plugins.eslint.failAfterError())
        .on('error', buildConfig.flags.watch ?
          plugins.notify.onError(function(error) {
            return 'JS lint ' + stripAnsi(error.message);
          }) : _.noop);
    }, {
      options: {
        'format': '  fix lint problems that can be fixed automatically'
      }
    }
  );

  gulp.task('lint:sass',
    'lint ' + colors.blue('all SASS') + ' files',
    function() {
      plugins.notify.logLevel(0);
      return gulp.src(buildConfig.FILES.FRONTEND_SASS)
        .pipe(plugins.plumber(buildConfig.options.plumber))
        .pipe(plugins.if(buildConfig.flags.watch, plugins.cached('linting')))
        .pipe(plugins.sassLint())
        .pipe(plugins.sassLint.format())
        .pipe(plugins.sassLint.failOnError())
        .on('error', buildConfig.flags.watch ?
          plugins.notify.onError(function(error) {
            return 'SASS lint: ' + stripAnsi(error.message);
          }) : _.noop);
    }
  );

  function isFixed(file) {
    // Has ESLint fixed the file contents?
    return file.eslint !== null && file.eslint.fixed;
  }

};

