var gulp = require('gulp');
var concat = require('gulp-concat');
var pkg = require('./package.json');

gulp.task('build', ['concat', 'platforms']);

gulp.task('concat', function () {
    gulp.src(['./transformation-matrix.js', './json2.js', './source/converter/*.js', './source/writer/*.js', './source/app/svga.js'])
    .pipe(concat('svga.jsx'))
    .pipe(gulp.dest('./build/' + pkg.version + '/'));
});

gulp.task('platforms', ['platform-mac', 'platform-windows']);

gulp.task('platform-mac', function () {
  return gulp.src('./build/' + pkg.version + '/*.jsx').pipe(gulp.dest('./mac'));
});

gulp.task('platform-windows', function () {
  return gulp.src('./build/' + pkg.version + '/*.jsx').pipe(gulp.dest('./windows'));
});