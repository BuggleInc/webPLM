module.exports = function(grunt) {

  grunt.initConfig({
    nggettext_extract: {
      pot: {
        files: {
          'po/template.pot': ['public/app/**/*.html']
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
          'public/app/**/*js'
        ],
        options: {
          vendor: [
            'public/javascripts/sinon-1.12.2.js',
            'public/javascripts/angular.min.js',
            'public/javascripts/angular-animate.js',
            'public/javascripts/angular-cookies.js',
            'public/javascripts/angular-ui-router.min.js',
            'public/javascripts/angular-ui-codemirror/ui-codemirror.js',
            'public/javascripts/angular-locker.min.js',
            'public/javascripts/angular-mocks.js'
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
  grunt.registerTask('i18n-extract', ['nggettext_extract']);
  grunt.registerTask('i18n-update', ['nggettext_compile']);

  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};