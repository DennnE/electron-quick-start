var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var replace = require('gulp-replace');
var es = require('event-stream');
var runSequence = require('run-sequence');
var cloudfront_invalidate = require('gulp-cloudfront-invalidate');
var child_process = require('child_process');

var packageInfo = require('../package.json');

// Special travis package task that copies all outputs into travis/s3-upload folder for S3 upload
gulp.task('travis-package', function (cb) {
    del.sync(['travis']);

    var TRAVIS_OS = process.env['TRAVIS_OS_NAME'];

    if (TRAVIS_OS !== 'linux') {
        console.log('osx build');
    } else {
        runSequence(
            'package-linux',
            'unpack-linux',
            function () {
                console.log('FINISHED PACKING LINUX');
                const spawn = child_process.spawn('docker', ['exec', '-i', 'builder', 'snapcraft']);

                spawn.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                });

                spawn.stderr.on('data', (data) => {
                  console.log(`stderr: ${data}`);
                });

                spawn.on('close', (code) => {
                    es.merge(
                        gulp
                            .src('dist/*.snap')
                            .pipe(gulp.dest('dist/_downloads/linux'))
                    ).on('end', function () {
                        fs.readdirSync('./').forEach(file => {
                          console.log(file);
                        });
                        cb();
                    });
                });
            }
        );
    }
});
