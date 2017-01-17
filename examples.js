'use strict';

const readdirs = require('read-dirs');

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
