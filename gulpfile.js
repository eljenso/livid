var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon');



gulp.task('default', function () {
  livereload.listen();
  
  nodemon({
    script: 'server.js',
    stdout: true,
    ext: 'js jade',
    // execMap: {
    //   js: 'node-debug'
    // }
  }).on('readable', function() {
    livereload.reload();
  }
)})