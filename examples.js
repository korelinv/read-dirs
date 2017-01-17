'use strict';

const readdirs = require('read-dir');

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
.then(() => console.log('done'))
.catch((err) => console.log(err));
