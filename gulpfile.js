var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon');



gulp.task('default', function () {
  livereload.listen();
  
  nodemon({
    script: 'server.js',
    stdout: false,
    ext: 'js jade'
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Server running/.test(chunk)) {
        livereload.reload();
      }
      process.stdout.write(chunk);
    })
  }
)})