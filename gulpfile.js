var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    fs = require('fs');



gulp.task('dev', function () {
  livereload.listen();

  nodemon({
    script: 'server.js',
    stdout: false,
    ext: 'js jade css',
    execMap: {
      js: 'node --debug-brk=5560'
    }
  }).on('readable', function() {
    this.stdout.pipe(fs.createWriteStream('output.txt'));
    this.stderr.pipe(fs.createWriteStream('err.txt'));

    livereload.reload();
  });

});

gulp.task('default', function () {
  nodemon({
    script: 'server.js',
    ext: 'js jade css'
  });
});
