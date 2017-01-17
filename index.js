'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const q = require('q');

function hasAppropriateExtension(options) {
    let result = true;

    if (false === !!options.path) throw 'path not defined!';
    if ((false === !!options.ext) && (null !== options.ext)) throw 'ext not defined!';

    const filePath = options.path;
    const allowedExtension = (Array.isArray(options.ext)) ? options.ext : [options.ext];

    if (-1 === allowedExtension.indexOf(path.extname(filePath))) {
        result = false;
    };

    return result;
};

function digestFile(options) {

    if (false === !!options.path) {
        throw 'path not defined!';
    };

    const filePath = options.path;
    const on = (false === !!options.on) ? {} : options.on;

    const scanResults = q.defer();


    const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    let line = 0;
    let scope = {
        $file: {
            lines: [],
            path: filePath
        }
    };
    lineReader.on('line',(content) => {
        line++;
        scope.$line = {
            text: content,
            index: line
        };
        if (true === !!on.line) {
            on.line(scope);
        };
        scope.$file.lines.push(content);
    })
    .on('close',() => {
        if (true === !!on.eof) {
            on.eof(scope);
        };
        scanResults.resolve();
    })
    //???
    .on('error', (error) => {
        scanResults.reject(error);
    });

    return scanResults.promise;

};

function stat(options) {

    const result = q.defer();
    const filePath = options.path;

    if (false === !!options.path) {
        results.reject('path not defined!');
    };

    fs.stat(filePath, (error, stats) => {
        if (error) {
            result.reject(error);
        } else {
            result.resolve(stats);
        };
    });

    return result.promise;

};

function readdir(options) {

    if (false === !!options.ext) {
        throw 'ext is not defined!';
    };

    const result = q.defer();
    const ext = options.ext;
    const root = (false === !!options.path) ? './' : options.path;
    const on = (false === !!options.on) ? {} : options.on;

    fs.readdir(root, (error, files) => {

        if (error) {
            result.reject(error);
        };

        files.forEach((leaf) => {

            let scope = {
                $path: path.join(root, leaf),
                $file: leaf,
                $dir: root
            };

            if (true === !!on.path) {
                on.path(scope);
            };

            stat({path: scope.$path})
            .then((stats) => {
                let digested = [];
                if (stats.isFile()) {
                    if (hasAppropriateExtension({path: scope.$path, ext: ext})) {
                        digested.push(digestFile({path: scope.$path, on: on}));
                    };
                } else {
                    digested.push(readdir({path: scope.$path, ext: ext, on: on}));
                };

                q.all(digested).then((res) => {
                    result.resolve(res);
                });

            });
        });
    });

    return result.promise;
};

function readdirs(options) {

    if (false === !!options.ext) {
        throw 'ext is not defined!';
    };

    if (false === !!options.path) {
        throw 'path is not defined';
    };

    const result = q.defer();
    const ext = options.ext;
    const roots = (Array.isArray(options.path)) ? options.path : [options.path];
    const on = (false === !!options.on) ? {} : options.on;

    let query = [];
    roots.forEach((root) => {
        query.push(readdir({
            path: root,
            ext: ext,
            on: on
        }));
    });

    q.all(query)
    .then((res) => result.resolve(res))
    .catch((err) => result.reject(err));

    return result.promise

};

module.exports = readdirs;



readdirs({
    path: ['./'],
    ext: ['.js'],

    on: {
        path: function(scope) {
            console.log(scope.$path);
            console.log(scope.$file);
            console.log(scope.$dir);
        },
        line: function(scope) {
            console.log(scope.$line.text);
            console.log(scope.$line.index);
        },
        eof: function(scope) {
            console.log(scope.$file.lines);
            console.log(scope.$file.path);
        }
    }
})
.then((res) => console.log(res))
.catch((err) => console.log(err));
