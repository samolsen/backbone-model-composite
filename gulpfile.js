var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('compress', function() {
  gulp.src('backbone-model-composite.js')
    .pipe(uglify())
    .pipe(rename('backbone-model-composite.min.js'))
    .pipe(gulp.dest("./"))
});

gulp.task('default', ['compress']);
