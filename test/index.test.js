require('env2')('.env');
var sendemail = require('../lib/index.js'); // auto-set TEMPLATE_DIR
var email = sendemail.email;
var sendMany = sendemail.sendMany;
var path = require('path');
var test = require('tape');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var decache = require('decache');
var SUCCESS_SIMULATOR = 'success@simulator.amazonses.com';

var TEMPLATE_DIR = process.env.TEMPLATE_DIRECTORY; // copy
delete process.env.TEMPLATE_DIRECTORY; // delete

test(file + " process.env.TEMPLATE_DIRECTORY has been unset", function (t) {
  t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
  t.end();
});

test(file + " set_template_directory without args throws error!", function (t) {
  try {
    sendemail.set_template_directory();
  } catch (e) {
    t.equal(e.message, 'Please Set a Template Directory');
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
});

test(file + " set_template_directory with INVALID directory!", function (t) {
  try {
    sendemail.set_template_directory('/invalid');
  } catch (e) {
    console.log(e.code);
    t.ok(e.code === 'ENOENT', 'FS Error: ' + JSON.stringify(e))
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
  }
});

test(file + " attempt to compile non-existent template (fail!)", function (t) {
  try {
    process.env.TEMPLATE_DIRECTORY = TEMPLATE_DIR;
    console.log('TEMPLATE_DIR:', TEMPLATE_DIR);
    sendemail.compile_template('no-file.html');
  } catch (e) {
    t.ok(e.code === 'ENOENT', 'FS Error: ' + JSON.stringify(e))
    t.end();
  }
});

test(file + " compile a known template", function (t) {
  var c = sendemail.compile_template('hello', 'html');
  var result = c({name: 'Jimmy'});
  t.ok(result.indexOf("<p>Hello Jimmy!</p>") > -1, 'Rendered: ' + result);
  t.end()
});

test(file + " compile .html template from cache", function (t) {
  var c = sendemail.compile_template('hello', 'html');
  var result = c({name: 'Jenny'});
  t.ok(result.indexOf("<p>Hello Jenny!</p>") > -1, 'Rendered: ' + result);
  t.end()
});

test(file + " compile .txt template", function (t) {
  var c = sendemail.compile_template('hello', 'txt');
  var result = c({name: 'Jenny'});
  t.ok(result.indexOf("Hello Jenny!") > -1, 'Rendered: ' + result);
  t.end()
});

test(file + " Force Fail in Email for a single email", function (t) {
  var person = {
    "name": "Bounce",
    "email": "invalid.email.address",
    "subject": "Welcome to DWYL :)"
  };
  email('hello', person, function (err) {
    t.equal(err.statusCode, 400, "Invalid Mandrill Key");
    t.end();
  });
});

test(file + " Force Fail in Email for an array of invalid emails", function (t) {
  var person = {
    "name": "Bounce",
    "email": ["invalid.email.address", "otherinvalid.email.address"],
    "subject": "Welcome to DWYL :)"
  };
  email('hello', person, function (err) {
    t.equal(err.statusCode, 400, "Invalid Mandrill Key");
    t.end();
  });
});

test(file + " Force Fail in Email for an array of valid emails and one invalid email", function (t) {
  var person = {
    "name": "Bounce",
    "email": ["success@simulator.amazonses.com", "invalid.email.address", "success@simulator.amazonses.com"],
    "subject": "Welcome to DWYL :)"
  };
  email('hello', person, function (err) {
    t.equal(err.statusCode, 400, "Invalid Mandrill Key");
    t.end();
  });
});

test(file + " send email (Success) for a single email", function (t) {
  var person = {
    name: "Success",
    email: "success@simulator.amazonses.com",
    subject: "Welcome to DWYL :)"
  };

  email('hello', person, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end();
  });
});

test(file + " send email (Success) for an array of emails", function (t) {
  var person = {
    name: "Success",
    email: ["success@simulator.amazonses.com", "success@simulator.amazonses.com"],
    subject: "Welcome to DWYL :)"
  };

  email('hello', person, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end();
  });
});

test(file + " sendMany email To CC BCC (Success)", function (t) {

  var options = {
    templateName: 'hello',
    context: {
      mydate: 'Feb 17 2017'
    },
    subject: 'Welcome to Email',
    toAddresses: [SUCCESS_SIMULATOR, SUCCESS_SIMULATOR],
    ccAddresses: [null],
    bccAddresses: [SUCCESS_SIMULATOR, SUCCESS_SIMULATOR]
  };

  sendMany(options, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end();
  })
});

test(file + " sendMany email To CC(Success)", function (t) {

  var options = {
    templateName: 'hello',
    context: {
      mydate: 'Feb 17 2017'
    },
    subject: 'Welcome to Email',
    toAddresses: [SUCCESS_SIMULATOR, SUCCESS_SIMULATOR],
    ccAddresses: [SUCCESS_SIMULATOR],
    bccAddresses: null
  };

  sendMany(options, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end()
  })
});


test(file + " sendMany email To (Success)", function (t) {

  var options = {
    templateName: 'hello',
    context: {
      mydate: 'Feb 17 2017'
    },
    subject: 'Welcome to Email',
    toAddresses: [SUCCESS_SIMULATOR, SUCCESS_SIMULATOR],
    ccAddresses: null,
    bccAddresses: null
  };

  sendMany(options, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end()
  })
});

test(file + " send email To BCC(Success)", function (t) {

  var options = {
    templateName: 'hello',
    context: {
      mydate: 'Feb 17 2017'
    },
    subject: 'Welcome to Email',
    toAddresses: [SUCCESS_SIMULATOR, SUCCESS_SIMULATOR],
    ccAddresses: null,
    bccAddresses: [SUCCESS_SIMULATOR]
  };

  sendMany(options, function (err, data) {
    t.ok(data.MessageId.length > 0, 'Email Sent!');
    t.end()
  })
});

test(file + " send email All null(Force Failure)", function (t) {

  var options = {
    templateName: 'hello',
    context: {
      mydate: 'Feb 17 2017'
    },
    subject: 'Welcome to Email',
    toAddresses: null,
    ccAddresses: null,
    bccAddresses: null
  };

  sendMany(options, function (err) {
    t.equal(err.statusCode, 400, "No Email Address provided");
    t.end()
  })
});
