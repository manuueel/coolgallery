var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    minhtml = require('gulp-minify-html'),
    mincss = require('gulp-minify-css'),
    minimage = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush');

var env,
    htmlSource,
    sassSource,
    outputDir,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
} else if (env === 'development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
}

htmlSource = [outputDir + '*.html'];
sassSource = ['components/sass/style.scss'];

gulp.task('compass', function() {
  gulp.src(sassSource)
    .pipe(compass({
      css: outputDir + 'css',
      sass: 'components/sass',
      image: outputDir + 'images',
      style: sassStyle
    })
    .on('error', gutil.log))
    .pipe(gulpif(env === 'production', mincss()))
    .pipe(connect.reload())
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  })
});

gulp.task('html', function() {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minhtml()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
});

gulp.task('images', function() {
  gulp.src('builds/development/images/*.*')
    .pipe(gulpif(env === 'production', minimage({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]})))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch('components/sass/*.scss', ['compass']);
  gulp.watch('builds/development/*.html', ['html']);
  gulp.watch('builds/development/images/*.*', ['images']);
});

gulp.task('default', ['compass', 'connect', 'html', 'images', 'watch']);