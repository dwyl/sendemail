var config  = require('path').resolve(__dirname+'/../config.env');
console.log(' >>>>>>>>>>>>>> ' + config);
var env     = require('env2')(config);
console.log(process.env.TEMPLATE_DIRECTORY)
var path    = require('path');
var test    = require('tape');
var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '');
var decache = require('decache');
decache('../lib/index.js'); // clear cached so its fresh
var email   = require('../lib/index.js'); // no api key

// process.env.TEMPLATE_DIR get loaded by env2 above
var TEMPLATE_DIR = process.env.TEMPLATE_DIRECTORY; // copy
delete process.env.TEMPLATE_DIRECTORY;             // delete

test(file+" Template Dir has not yet been set!", function(t) {
  console.log(TEMPLATE_DIR);
  t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
  t.end();
});

test(file+" set_template_directory without args throws error!", function(t) {
  try {
    email.set_template_directory();
  } catch (e) {
    t.ok(e.indexOf('Please Set a Template Directory') > -1, 'Error Thrown: '+e)
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
});


test(file+" set_template_directory with INVALID directory!", function(t) {
  try {
    email.set_template_directory('/invalid');
  } catch (e) {
    console.log(e.code);
    t.ok(e.code === 'ENOENT', 'FS Error: '+JSON.stringify(e))
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
});

test(file+" set_template_directory with VALID (but empty) directory!", function(t) {
  try {
    email.set_template_directory(__dirname + '/empty');
  } catch (e) {
    t.ok(e.indexOf("No Files in") > -1, 'Error: '+e);
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
});

test(file+" set_template_directory with VALID directory with teplates!", function(t) {
  var dir = __dirname + '/../examples/templates'; // unresolved
  email.set_template_directory(__dirname + '/../examples/templates');
  var path = require('path');
  dir = path.resolve(dir);
  t.equal(process.env.TEMPLATE_DIRECTORY, dir, "Template Dir Set: "+ dir);
  t.end();
});


test(file+" attempt to compile non-existent template (fail!)", function(t) {
  try {
    var dir = __dirname + '/../examples/templates'; // unresolved
    dir = path.resolve(dir);
    email.set_template_directory(dir); // set template dir
    email.compile_template('/no-file.html');
  } catch (e) {
    // console.log(e);
    t.ok(e.code === 'ENOENT', 'FS Error: '+JSON.stringify(e))
    t.end();
  }
});

var Handlebars = require('handlebars');

test(file+" compile a known template", function(t) {
  var dir = __dirname + '/../examples/templates'; // unresolved
  dir = path.resolve(dir);
  email.set_template_directory(dir); // set template dir
  var c = email.compile_template('/hello.html');
  var result = c({name:'Jimmy'});
  t.ok(result.indexOf("<p>Hello Jimmy!</p>") > -1, 'Rendered: '+result);
  t.end()
});

test(file+" compile .html template from cache", function(t) {
  var c = email.compile_template('/hello.html');
  var result = c({name:'Jenny'});
  t.ok(result.indexOf("<p>Hello Jenny!</p>") > -1, 'Rendered: '+result);
  t.end()
});

test(file+" compile .txt template", function(t) {
  var c = email.compile_template('/hello.txt');
  var result = c({name:'Jenny'});
  t.ok(result.indexOf("Hello Jenny!") > -1, 'Rendered: '+result);
  t.end()
});

// test(file+" Template directory has been set", function(t) {
//   var email  = require('../lib/index.js'); // WITH api key
//   email(person, function(eres){
//     console.log(' - - - - - - - - - - - - - - - - - - - ')
//     console.log(eres);
//     console.log(' - - - - - - - - - - - - - - - - - - - ')
//     t.equal(eres[0].status, 'sent', "Email Sent "+eres[0]._id);
//     // decache('../lib/email_welcome'); // clear cached email module
//     t.end();
//   })
// });
