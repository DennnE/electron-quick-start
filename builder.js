var builder = require('electron-builder');
var packager = require('electron-packager');
var child_process = require('child_process');

var packageInfo = require('./package.json');

const Platform = builder.Platform;

var ELECTRON_VERSION = packageInfo.devDependencies['electron'].substr(1);

var ELECTRON_PACKAGER_DEFAULTS = {
    dir: process.cwd(),
    out: process.cwd(),
    version: ELECTRON_VERSION,
    asar: true
};
var ELECTRON_PACKAGE_MAC_DEFAULTS = Object.assign({}, ELECTRON_PACKAGER_DEFAULTS, {
    arch: 'x64',
});

// packager(Object.assign({}, ELECTRON_PACKAGE_MAC_DEFAULTS, {
//     platform: 'linux'
// }), function done_callback(err, appPaths) {
//     if (err) throw err;
//     child_process.execSync('snapcraft', {
//         cwd: '/snap'
//     });
// });
    builder.build({
        targets: Platform.LINUX.createTarget(),
        projectDir: process.cwd(),
        config: {
            "electronVersion": ELECTRON_VERSION,
            "linux": {
                "target": "snap",
                "executableName": "electron-sample",
                "desktop": {
                    "Type": "Application",
                    "Name": "Electron Sample",
                    "Exec": "electron-sample"
                }
            },
            "directories": {
                "output": process.cwd()
            }
        }
    }).then(() => {
        console.log('Done creating Snap.')
    })
    .catch((error) => {
        console.log(error);
    });