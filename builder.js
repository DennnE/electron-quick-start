var builder = require('electron-builder');
var packager = require('electron-packager');

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

packager(Object.assign({}, ELECTRON_PACKAGE_MAC_DEFAULTS, {
    platform: 'darwin'
}), function done_callback(err, appPaths) {
    if (err) throw err;
    console.log('Done creating Darwin.')
});

builder.build({
    targets: Platform.LINUX.createTarget(),
    projectDir: process.cwd(),
    config: {
        "electronVersion": ELECTRON_VERSION,
        "linux": {
            "target": "AppImage",
            "executableName": "electron-sample",
            "desktop": {
                "Type": "Application",
                "Name": "Electron Sample"
            }
        },
        "directories": {
            "output": process.cwd() + '/dist'
        }
    }
}).then(() => {
    console.log('Done creating AppImage.')
})
.catch((error) => {
    console.log(error);
});

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
                "Exec": "electron-sample %U"
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