var del = require('del');
var gulp = require('gulp');
var runSequence = require('run-sequence');

require('./gulp/electron');
require('./gulp/travis');

//linux
gulp.task('package-linux', function(cb) {
    runSequence(
        'package-electron-base',
        cb);
});