module.exports = function(grunt) {

  grunt.initConfig({
    jasmine: {
      components: {
        src: [
          'public/app/**/*js'
        ],
        options: {
          vendor: [
            'public/javascripts/sinon-1.12.2.js',
            'public/javascripts/angular.min.js',
            'public/javascripts/angular-ui-router.min.js',
            'public/javascripts/angular-ui-codemirror/ui-codemirror.js',
            'public/javascripts/angular-locker.min.js',
            'public/javascripts/angular-mocks.js'
          ],
          specs: 'public/app/**/*spec.js',
          helpers: 'public/javascripts/jasmine/spec/SpecHelper.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('travis', [
    'jasmine'
  ]);

};