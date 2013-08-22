module.exports = function(grunt) {

    // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat:{
      options: {
        separator: ';'
      },
      dist: {
        src: ['vendor/**/*.js', 'src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: {toplevel: true}
      },
      build: {
        src: ['dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }

//  watch: {
//    assets : {
//      files : ['src/**/*.*'],
//      tasks : ['default']
//    },
//    html : {
//      files   : ['index.min.html', 'src/js/audio.js'],
//      options : {
//        livereload : true
//      }
//    }
//  }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('auto', ['default', 'watch']);

  grunt.registerMultiTask("shadercompile", function(){
    this.files.forEach(function(f){
      grunt.log.writeln(f.src)
    });
  } );

};
