var config  = require('path').resolve(__dirname+'/../config.env');
var env     = require('env2')(config);
var test    = require('tape');
var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '');
var decache = require('decache');
decache('../lib/index.js'); // clear cached so its fresh
var email   = require('../lib/index.js'); // no api key


test(file+" Template Dir has not yet been set!", function(t) {
  var person = {
    "email"    : 'bad@example.com',
    "password" : "thiswill400"
  };
  email(person, function(email_response) {
    console.log(email_response);
    t.equal(email_response.status, 'error', "Error...");
    // process.env.MANDRILL_API_KEY = APIKEY_COPY; // restore key for next tests
    t.end();
  })
});

test(file+" Template directory has been set", function(t) {
  var person = {
    "email"    : 'dwyl.test+email_welcome' +Math.random()+'@gmail.com',
    "password" : "NotRequiredToTestEmail!"
  };
  // console.log("MANDRILL_APIKEY >>> "+process.env.MANDRILL_APIKEY)
  decache('../lib/index.js'); // clear cached email module
  var email  = require('../lib/index.js'); // WITH api key
  email(person, function(eres){
    console.log(' - - - - - - - - - - - - - - - - - - - ')
    console.log(eres);
    console.log(' - - - - - - - - - - - - - - - - - - - ')
    t.equal(eres[0].status, 'sent', "Email Sent "+eres[0]._id);
    // decache('../lib/email_welcome'); // clear cached email module
    t.end();
  })
});
