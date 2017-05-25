var gulp = require('gulp');
var es = require('event-stream');
var del = require('del');
var changed = require('gulp-changed');
var replace = require('gulp-replace');
var responsiveImages = require('gulp-responsive-images');
var exec = require('gulp-exec');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var runSequence = require('run-sequence');
var child_process = require('child_process');
var packager = require('electron-packager');
var winstaller = require('electron-winstaller');
var signcode = require('signcode');
var electron_osx_sign = require('electron-osx-sign');
var electron_connect = require('electron-connect');
var builder = require('electron-builder');

var utils = require('./utils.js');

var packageInfo = require('../package.json');

const Platform = builder.Platform;

var ELECTRON_VERSION = packageInfo.devDependencies['electron'].substr(1);
var ELECTRON_PACKAGER_DEFAULTS = {
    dir: process.cwd() + '/dist/electron/base',
    out: process.cwd() + '/dist/electron',
    version: ELECTRON_VERSION,
    asar: true,
    arch: 'x64'
};

gulp.task('package-electron-base', function () {
    return es.merge(
        gulp.src(['src/{index.html,main.js,renderer.js}'])
            .pipe(gulp.dest('dist/electron/base')),
        // Generate mac app icon (icns)
        gulp.src('src/logo.png')
            .pipe(responsiveImages({
                'logo.png': [
                    {width: 16, rename: 'icon_16x16.png'},
                    {width: 16 * 2, rename: 'icon_16x16@2x.png'},
                    {width: 32, rename: 'icon_32x32.png'},
                    {width: 32 * 2, rename: 'icon_32x32@2x.png'},
                    {width: 128, rename: 'icon_128x128.png'},
                    {width: 128 * 2, rename: 'icon_128x128@2x.png'},
                    {width: 256, rename: 'icon_256x256.png'},
                    {width: 256 * 2, rename: 'icon_256x256@2x.png'},
                    {width: 512, rename: 'icon_512x512.png'},
                    {width: 512 * 2, rename: 'icon_512x512@2x.png'}
                ]
            }))
            .pipe(utils.createICNSIcon('appicon.icns'))
            .pipe(gulp.dest('dist/electron/base')),
        // Generate windows app icon (ico)
        gulp.src('src/logo.png')
            .pipe(exec('mkdir -p ./dist/electron/base && convert  <%= file.path %> -define icon:auto-resize=256,128,64,48,32,16 ./dist/electron/base/appicon.ico'))
            .pipe(exec.reporter()),
        // Generate linux app icon (png)
        gulp.src('src/logo.png')
            .pipe(responsiveImages({
                'logo.png': [
                    {width: 64, rename: '64x64.png'}
                ]
            }))
            .pipe(gulp.dest('dist/electron/base'))
    );
});

gulp.task('unpack-linux', function (cb) {
    packager(Object.assign({}, ELECTRON_PACKAGER_DEFAULTS, {
        platform: 'linux'
    }), function done_callback(err, appPaths) {
        if (err) throw err;
        cb();
    });
});