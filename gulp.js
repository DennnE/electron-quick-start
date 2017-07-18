var gulp = require('gulp');
var es = require('event-stream');
var runSequence = require('run-sequence');
var child_process = require('child_process');
var packager = require('electron-packager');

var packageInfo = require('./package.json');

var ELECTRON_VERSION = packageInfo.devDependencies['electron'].substr(1);
var ELECTRON_PACKAGER_DEFAULTS = {
    dir: process.cwd() + '/src',
    out: process.cwd() + '/dist/electron',
    version: ELECTRON_VERSION,
    asar: true,
    'app-version': packageInfo.version,
    'build-version': packageInfo.version
};

gulp.task('package-electron-linux', function (cb) {
    packager(Object.assign({}, ELECTRON_PACKAGER_DEFAULTS, {
        platform: 'linux',
        arch: 'x64'
    }), function done_callback(err, appPaths) {
        if (err) throw err;
        console.log('Finished packing linux app.');
        cb();
    });
});

gulp.task('package-linux', function(cb) {
    //we only build electron linux binaries here
    runSequence(
        'package-electron-linux',
        cb);
}); 

gulp.task('package-snap-assets', function (cb) {
    return es.merge(
        gulp.src('package/gui/{gravit-designer.desktop,icon.png}')
            .pipe(gulp.dest('snap/gui')),
        gulp.src('package/snapcraft.yaml')
            .pipe(gulp.dest('snap'))
    );
});

// Special travis package task that copies all outputs into travis/s3-upload folder for S3 upload
gulp.task('travis-package', function (cb) {

    var TRAVIS_OS = process.env['TRAVIS_OS_NAME'];

    if (process.env['TRAVIS_BRANCH'] === 'master') {
        console.log('Setting trunk mode...');
        process.env.NODE_ENV = 'trunk';
    } else {
        console.log('Setting production mode...');
        process.env.NODE_ENV = 'production';
    }

    if (process.argv[3] === '--build' && process.argv[4] === 'browser') {
        process.env.BUILD_TARGET = 'browser';
    } else if (process.argv[3] === '--build' && process.argv[4] === 'snap') {
        process.env.BUILD_TARGET = 'snap';
    } else {
        process.env.BUILD_TARGET = 'snap';
    }
    
    //just actually build if target and os match
    //OS = linux and TARGET = snap -> build
    //OS = osx and TARGET != snap -> build
    if ((TRAVIS_OS === 'linux' && process.env.BUILD_TARGET === 'snap') || (TRAVIS_OS === 'osx' && process.env.BUILD_TARGET !== 'snap')) {
        runSequence(
            'package-linux',
            'package-snap-assets',
            function () {
                gulp.src('package/snap/snapcraft.yaml')
                .pipe(gulp.dest('dist'))

                console.log(process.cwd());
                const spawn = child_process.spawn('docker', ['exec', '-i', 'builder', 'snapcraft']);

                spawn.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                spawn.stderr.on('data', (data) => {
                   console.log(`stderr: ${data}`);
                });

                spawn.on('close', (code) => {
                    cb();
                });
            }
        );
    }
});
