var del = require('del');
var gulp = require('gulp');
var runSequence = require('run-sequence');

require('./gulp/electron');
require('./gulp/travis');

//linux
gulp.task('package-linux', function(cb) {
    runSequence(
        'package-electron-base',
        function () {
            child_process.exec('docker exec -i builder snapcraft', function (err, stdout, stderr) {
                if (err) throw err;
                es.merge(
                    gulp
                        .src('*.snap')
                        .pipe(gulp.dest('dist/_downloads/linux'))
                )
            });
        }
    );
});
