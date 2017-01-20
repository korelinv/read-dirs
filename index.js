'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const q = require('q');

function uniquePath(array, value) {
    let result = (Array.isArray(array)) ? array : [array];
    if (false === result.includes(value)) {
        result.push(value);
    };
    return result;
};

function pathExists(array, value) {
    let result = (Array.isArray(array)) ? array : [array];
    if (fs.existsSync(value)) {
        result.push(value);
    };
    return result;
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

function readdir(path) {
    let result = q.defer();
    fs.readdir(path, (error, files) => {
        if (error) {
            result.reject(error);
        } else {
            result.resolve(files);
        };
    });
    return result.promise;
};

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

function proceedDigest(stats,options) {
    let result;
    if (stats.isFile()) {
        if (hasAppropriateExtension({path: options.path, ext: options.ext})) {
            result = digestFile({path: options.path, on: options.on});
        } else {
            result = false;
        };
    } else {
        result = digestPath({path: options.path, ext: options.ext, on: options.on});
    };

    return result;
};

function digestFile(options) {

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
        scanResults.resolve(true);
    });

    return scanResults.promise;

};

function digestPath(options) {

    const ext = options.ext;
    const root =  options.path;
    const on = options.on;

    const result = q.defer();
    readdir(root)
    .then((files) => {
        let digested = [];

        files.forEach((leaf) => {

            let scope = {
                $path: path.join(root, leaf),
                $file: leaf,
                $dir: root
            };

            if (true === !!on.path) {
                on.path(scope);
            };

            digested.push(
                stat({path: scope.$path})
                .then((stats) => proceedDigest(stats,{
                    path: scope.$path,
                    ext: ext,
                    on: on
                }))
            );

        });

        q.all(digested)
        .spread(() => {
            result.resolve(true)
        });
    })
    .catch((error) => result.reject(error));
    return result.promise;
};

function readdirs(options) {

    if (false === !!options.ext) {
        throw 'ext is not defined!';
    };

    if (false === !!options.path) {
        throw 'path is not defined';
    };

    const ext = options.ext;
    const on = (false === !!options.on) ? {} : options.on;
    let roots = options.path;
    if (Array.isArray(roots)) {
        roots = (0 < roots.length) ? roots.reduce(uniquePath) : ['./'];
        roots = Array.isArray(roots) ? roots.reduce(pathExists) : [roots];
        roots = Array.isArray(roots) ? roots : [roots]
    } else {
        roots = [roots];
    };

    const result = q.defer();
    let query = [];
    roots.forEach((root) => {
        query.push(digestPath({
            path: root,
            ext: ext,
            on: on
        }));
    });
    q.all(query)
    .spread(() => {
        result.resolve(true);
    })
    .catch((err) => result.reject(err));
    return result.promise

};

module.exports = readdirs;
