module.exports = function(grunt) {

    // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat:{
      options: {
        separator: ';'
      },
      dist: {
        src: ['../../dist/loop.js', 'src/**/*.js'],
        dest: '<%= pkg.name %>.js'
      }
    },

    jshint : {
      all : ['src/**/*.js']         
    },

    watch: {
      assets : {
        files : ['src/**/*.js'],
        tasks : ['default']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat']);
  grunt.registerTask('auto', ['default', 'watch']);
};
