var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var docco = require("gulp-docco");

gulp.task('compress', function() {
  gulp.src('backbone-model-composite.js')
    .pipe(uglify())
    .pipe(rename('backbone-model-composite.min.js'))
    .pipe(gulp.dest("./"))
});

gulp.task('docs', function () {
  return gulp.src('./backbone-model-composite.js')
    .pipe(docco())
    .pipe(gulp.dest('./docs'))
});

gulp.task('default', ['compress', 'docs']);
