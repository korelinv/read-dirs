#Install

> npm install read-dirs



#Usage

```javascript
const readdirs = require('read-dirs');

//prints every line of every .js file in root directory
readdirs({
   path: ['./'],
   ext: ['.js'],

   on: {
       line: function(scope) {
          console.log(scope.$line.text);
       }
   }
});
```



#Config object

Config object is used to configure root path for scanning, file extensions to look in
and event during scanning process

1. path: path to root folder, multiple root folders could be defined using array
2. ext: tells scanner wich file extensions to look for
3. on: event accuring during scanning
  * path
  * line
  * eof

```javascript
readdirs({
    path: ['./lib', './src'],   // scan files and directories in ./lib and ./src
    ext: ['.js'],               // scan only .js files

    on: {
        // gets executed when path of file or folder obtained
        path: function(scope) {
            console.log(scope.$path);         // print full path to file or folder
            console.log(scope.$file);         // print file or folder name
            console.log(scope.$dir);          // print directory name witch contains file or directory
        },

        // methods line and eof share same scope
        // gets executed on every line
        line: function(scope) {
            console.log(scope.$line.text);    // print content of current line
            console.log(scope.$line.index);   // print index of current line
            scope.foo = 'bar';                // set value of foo in file scope
        },
        //gets executed at the end of file
        eof: function(scope) {
            console.log(scope.$file.lines);   // print array of file lines
            console.log(scope.$file.path);    // print file path
            console.log(scope.foo);           // print value of foo
        }
    }
})
.then((res) => console.log(res))
.catch((err) => console.log(err));
```
