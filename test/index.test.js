var path    = require('path');
var config  = path.resolve(__dirname+'/../config.env');
var env     = require('env2')(config);
var test    = require('tape');
var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '');
var decache = require('decache');
var email   = require('../lib/index.js'); // no api key

// process.env.TEMPLATE_DIR get loaded by env2 above
var TEMPLATE_DIR = process.env.TEMPLATE_DIRECTORY; // copy
delete process.env.TEMPLATE_DIRECTORY;             // delete

var APIKEY_COPY = process.env.MANDRILL_API_KEY; // store for later
delete process.env.MANDRILL_API_KEY; // delete key to force fail

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

// test(file+" set_template_directory with VALID (but empty) directory!", function(t) {
//   try {
//     delete process.env.TEMPLATE_DIRECTORY;
//     email.set_template_directory(__dirname + '/empty');
//   } catch (e) {
//     console.log(' - - - - - - - - - - - - - - - - - - ')
//     console.log(e);
//     console.log(' - - - - - - - - - - - - - - - - - - ')
//     // t.ok(e, 'Error: '+e);
//     t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
//     t.end();
//   }
// });

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
    email.compile_template('no-file.html');
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
  var c = email.compile_template('hello', 'html');
  var result = c({name:'Jimmy'});
  t.ok(result.indexOf("<p>Hello Jimmy!</p>") > -1, 'Rendered: '+result);
  t.end()
});

test(file+" compile .html template from cache", function(t) {
  var c = email.compile_template('hello', 'html');
  var result = c({name:'Jenny'});
  t.ok(result.indexOf("<p>Hello Jenny!</p>") > -1, 'Rendered: '+result);
  t.end()
});

test(file+" compile .txt template", function(t) {
  var c = email.compile_template('hello', 'txt');
  var result = c({name:'Jenny'});
  t.ok(result.indexOf("Hello Jenny!") > -1, 'Rendered: '+result);
  t.end()
});

test(file+" send email", function(t) {
  var dir = __dirname + '/../examples/templates'; // unresolved
  dir = path.resolve(dir);
  email.set_template_directory(dir); // set template dir

  var person = {
    name : "Jenny",
    email: "dwyl.test+" + Math.random() + "@gmail.com"
  }
  email('hello', person, function(err, data){
    // console.log(err, data);
    // console.log(data[0].status)
    t.equal(data[0].status, 'sent', 'Email Sent!');
    t.end()
  })
});

// E2E

var person = {
  "name"     : "Jenny",
  "email"    : 'dwyl.test+email_welcome' +Math.random()+'@gmail.com',
  "password" : "NotRequiredToTestEmail!"
};

test(file+" Force Fail in Email", function(t) {
  decache('../lib/index.js'); // clear cached so its fresh
  delete process.env.MANDRILL_API_KEY; // delete key to force fail
  email = require('../lib/index.js');

  email('hello', person, function(err, email_response) {
    t.equal(err.status, 'error', "Invalid Mandrill Key");
    process.env.MANDRILL_API_KEY = APIKEY_COPY; // restore key for next tests
    t.end();
  })
});

// now make it pass
test(file+" Email Successfully Sent ", function(t) {
  // console.log("MANDRILL_APIKEY >>> "+process.env.MANDRILL_APIKEY)
  decache('../lib/index.js'); // clear cached email module
  var email  = require('../lib/index.js'); // WITH api key
  email('welcome', person, function(error, result){
    console.log(' - - - - - - - - - - - - - - - - - - - ')
    console.log(result);
    console.log(' - - - - - - - - - - - - - - - - - - - ')
    t.equal(result[0].status, 'sent', "Email Sent "+result[0]._id);
    t.end();
  })
});
