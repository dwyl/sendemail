var config  = require('path').resolve(__dirname+'/../config.env');
console.log(' >>>>>>>>>>>>>> ' + config);
var env     = require('env2')(config);
console.log(process.env.TEMPLATE_DIRECTORY)
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
    t.end()
  } catch (e) {
    console.log(e.code);
    t.ok(e.indexOf("No Files in") > -1, 'Error: '+e);
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
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
