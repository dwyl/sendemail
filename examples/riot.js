var riot  = require('riot');
require('./my-tag.tag');
var hello = require('./hello.tag');
var html  = riot.render(hello, { name: "Ana" })
console.log(html); // <hello><p>Hello Ana!</p></hello>
