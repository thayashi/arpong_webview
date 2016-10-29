var del = require('del');
var path = require('path');
var gulp = require('gulp');

var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');


gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      notify: false,
      //baseDir: './dist'
      baseDir: './src'
    }
  });
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

//Clean
gulp.task('clean', del.bind(null, ['./dist/*']));

//Build
gulp.task('build', ['clean'], function() {
  //copy static files
  gulp.src('./src/images/**').pipe(gulp.dest('./dist/images'));
  gulp.src('./src/bower_components/font-awesome/fonts/**').pipe(gulp.dest('./dist/fonts'));
  //minify css and js
  gulp.src('./src/*.html')
    .pipe(usemin({
      css: [ minifyCSS() ],
      js : [ uglify() ],
      js2 : [ uglify() ],
    }))
    .pipe(gulp.dest('./dist/'));
});

//Sass
gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});


//Default
gulp.task('default', ['browser-sync'], function() {
  gulp.watch(['./src/*.html'], ['bs-reload']);
  gulp.watch(['./src/js/*.js'], ['bs-reload']);
  gulp.watch(['./src/sass/*.scss'], ['sass']);
});
