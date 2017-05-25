var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var gulp = require('gulp');
var through = require('through2');
var temporary = require('temporary');
var del = require('del');
var File = require('vinyl');
var path = require("path");

var exports = module.exports;

exports.exec = function (cmdLine, options, done) {
    if (typeof options === 'function') {
        done = options;
        options = {};
    }

    console.log('$ ' + cmdLine);

    var childProcess = child_process.exec(cmdLine, options, function (err, stdout, stderr) {
        if (err) {
            throw err;
        }

        if (done) {
            return done(stdout, stderr);
        }
    });

    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
};

exports.createICNSIcon = function (icnsName) {
    const icons = [];

    const bufferContents = function (file, encoding, callback) {
        if (file.isNull()) {
            return callback()
        }

        icons.push(file);
        callback()
    };

    const endStream = function (callback) {
        if (!icons.length) {
            return callback()
        }

        const self = this;

        const tmpDir = new temporary.Dir();
        const iconsetPath = path.join(tmpDir.path, 'tmp.iconset');
        const outputPath = path.join(tmpDir.path, 'tmp.icns');

        fs.mkdirSync(iconsetPath);

        icons.forEach(function (icon) {
            fs.writeFileSync(path.join(iconsetPath, path.basename(icon.path)), icon.contents)
        });

        const program = child_process.spawn('/usr/bin/iconutil', ['-c', 'icns', iconsetPath]);
        program.stdout.on('end', function () {
            const icns = new File({
                cwd: icons[0].cwd,
                base: icons[0].base,
                path: path.join(icons[0].base, icnsName),
                contents: fs.readFileSync(outputPath)
            });
            self.push(icns);
            del.sync(tmpDir.path, {force: true})
            callback();
        })
    };

    return through.obj(bufferContents, endStream);
};