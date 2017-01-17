#install

> npm install scan-dirs

#usage

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
