var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

gulp.task('build', function () {
  return gulp.src(['./transformation-matrix.js', './json2.js', './svga.js'])
    .pipe(concat('svga.js'))
    .pipe(gulp.dest('./build/' + pkg.version + '/'));
});

gulp.task('release', function () {
  return gulp.src(['./transformation-matrix.js', './json2.js', './svga.js'])
    .pipe(concat('svga.min.js'))
    .pipe(uglify('svga.min.js'))
    .pipe(gulp.dest('./build/' + pkg.version + '/'));
});