#Install

> npm install scan-dirs



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

##path

path to root folder
multiple root folders could be defined using array

##ext

tells scanner wich file extensions to look for

##on

event accuring during scanning

###path

###line

###eof
