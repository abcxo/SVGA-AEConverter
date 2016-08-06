var gulp = require('gulp');
var concat = require('gulp-concat');
var pkg = require('./package.json');

gulp.task('build', function () {
  return gulp.src(['./transformation-matrix.js', './json2.js', './svga.js'])
    .pipe(concat('svga.jsx'))
    .pipe(gulp.dest('./build/' + pkg.version + '/'));
});