module.exports = function(grunt) {

  grunt.initConfig({
    nggettext_extract: {
      pot: {
        files: {
          'po/template.pot': ['public/app/**/*.html', 'public/app/**/*.js']
        }
      },
    },
    nggettext_compile: {
      all: {
        files: {
          'public/javascripts/translations.js': ['po/*.po']
        }
      },
    },
    jasmine: {
      components: {
        src: [
          'public/app/app.js',
          'public/app/app.routes.js',
          'public/app/app.auth.js',
          'public/app/**/*.js'
        ],
        options: {
          vendor: [
            'public/javascripts/angular.js',
            'public/javascripts/angular-animate.js',
            'public/javascripts/angular-bind-html-compile.js',
            'public/javascripts/angular-cookies.js',
            'public/javascripts/angular-sanitize.js',
            'public/javascripts/angular-ui-router.js',
            'public/javascripts/angular-ui-codemirror/ui-codemirror.js',
            'public/javascripts/angular-locker.js',
            'public/javascripts/angular-mocks.js',
            'public/javascripts/angular-gettext/dist/angular-gettext.js',
            'public/javascripts/global.js',
            'public/javascripts/satellizer.js',
            'public/javascripts/sinon-1.12.2.js',
            'public/javascripts/toaster.js'
          ],
          helpers: 'public/javascripts/jasmine/spec/SpecHelper.js'
        }
      }
    }
  });

  grunt.registerTask('build', 'Do build', function(arg) {
    grunt.log.write("I'm building...");
    grunt.log.ok();
  });

  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('gettext-extract', ['nggettext_extract']);
  grunt.registerTask('gettext-update', ['nggettext_compile']);

  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};