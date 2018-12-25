require('env2')('.env');

var fs = require('fs');

var sendemail = require('../lib/index.js'); // auto-set TEMPLATE_DIR
var email = sendemail.email;
var sendMany = sendemail.sendMany;
var service = require('../lib/service.js');
var test = require('tape');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var decache = require('decache');

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


//// EMAIL SPECIFIC TESTS

/**
 * Sets state for each test on startup, using a specific service
 * when requested (and requested service is valid and configured).
 *
 * @param {String} [current_service_name] - name of a sending service
 * @returns {undefined}
 */
function email_test_startup (current_service_name) {

  var SERVICE_TESTING = {
    mailgun: {
      errorKey: "status",
      successIdKey: "id",
      // Mailgun doesn't offer a test mailbox, so you need to authorize a recipient in your dashboard
      successSimulator: process.env.MAILGUN_AUTHORIZED_RECIPIENT,
    },
    ses: {
      errorKey: "statusCode",
      successIdKey: "MessageId",
      successSimulator: "success@simulator.amazonses.com"
    }
  };


  // default_config — where no specific service is requested — represents the typical
  // use case of the library's user not specifying a service. In that case, we default to
  // the last key in service/SERVICE_CONFIGS, as accessed by the for...in loop in service.determine_service
  var default_config = SERVICE_TESTING[service.determine().name];
  var specific_service_config = SERVICE_TESTING[current_service_name];

  if (specific_service_config) {
    process.env.CURRENT_SERVICE = current_service_name;
  }
  process.env.SUCCESS_SIMULATOR = specific_service_config ? specific_service_config.successSimulator : default_config.successSimulator;
  process.env.SUCCESS_ID_KEY = specific_service_config ? specific_service_config.successIdKey : default_config.successIdKey;
  process.env.ERROR_KEY = specific_service_config ? specific_service_config.errorKey : default_config.errorKey;
}

/**
 * Removes all configuration set at test runtime, ensuring tests
 * are totally independent, configuration-wise.
 *
 * @returns {undefined}
 */
function email_test_teardown () {

  delete process.env.CURRENT_SERVICE;
  delete process.env.SUCCESS_SIMULATOR;
  delete process.env.SUCCESS_ID_KEY;
  delete process.env.ERROR_KEY;
}

// undefined means using the sending service set by default
var services_to_test = [undefined];
for (var service_name in service.service_configs) {
  services_to_test.push(service_name);
};

services_to_test.forEach(function (specific_service) {
  // Annotates tests with current sending service
  var service_test_description = file + " — " + (specific_service || "Default Sender") + ":";

  test(service_test_description + " Force Fail in Email", function (t) {
    email_test_startup(specific_service);

    var person = {
      "name": "Bounce",
      "email": "invalid.email.address",
      "subject": "Welcome to DWYL :)"
    };
    email('hello', person, function (err) {
      t.equal(err[process.env.ERROR_KEY], 400, "Invalid Mandrill Key");

      email_test_teardown();
      t.end();
    });
  });

  test(service_test_description + " send email (Success)", function (t) {
    email_test_startup(specific_service);
    var person = {
      name: "Success",
      email: process.env.SUCCESS_SIMULATOR,
      subject: "Welcome to DWYL :)"
    };

    email('hello', person, function (err, data) {
      t.ok(data[process.env.SUCCESS_ID_KEY].length > 0, 'Email Sent!');

      email_test_teardown();
      t.end();
    });

  });

  test(service_test_description + " sendMany email To CC BCC (Success)", function (t) {
    email_test_startup(specific_service);
    var options = {
      templateName: 'hello',
      context: {
        mydate: 'Feb 17 2017'
      },
      subject: 'Welcome to Email',
      toAddresses: [process.env.SUCCESS_SIMULATOR, process.env.SUCCESS_SIMULATOR],
      ccAddresses: [null],
      bccAddresses: [process.env.SUCCESS_SIMULATOR, process.env.SUCCESS_SIMULATOR]
    };

    sendMany(options, function (err, data) {
      t.ok(data[process.env.SUCCESS_ID_KEY].length > 0, 'Email Sent!');

      email_test_teardown();
      t.end();
    });

  });

  test(service_test_description + " sendMany email To CC(Success)", function (t) {
    email_test_startup(specific_service);
    var options = {
      templateName: 'hello',
      context: {
        mydate: 'Feb 17 2017'
      },
      subject: 'Welcome to Email',
      toAddresses: [process.env.SUCCESS_SIMULATOR, process.env.SUCCESS_SIMULATOR],
      ccAddresses: [process.env.SUCCESS_SIMULATOR],
      bccAddresses: null
    };

    sendMany(options, function (err, data) {
      t.ok(data[process.env.SUCCESS_ID_KEY].length > 0, 'Email Sent!');

      email_test_teardown();
      t.end();
    });
  });


  test(service_test_description + " sendMany email To (Success)", function (t) {
    email_test_startup(specific_service);
    var options = {
      templateName: 'hello',
      context: {
        mydate: 'Feb 17 2017'
      },
      subject: 'Welcome to Email',
      toAddresses: [process.env.SUCCESS_SIMULATOR, process.env.SUCCESS_SIMULATOR],
      ccAddresses: null,
      bccAddresses: null
    };

    sendMany(options, function (err, data) {
      t.ok(data[process.env.SUCCESS_ID_KEY].length > 0, 'Email Sent!');

      email_test_teardown();
      t.end();
    });

  });

  test(service_test_description + " send email To BCC(Success)", function (t) {
    email_test_startup(specific_service);
    var options = {
      templateName: 'hello',
      context: {
        mydate: 'Feb 17 2017'
      },
      subject: 'Welcome to Email',
      toAddresses: [process.env.SUCCESS_SIMULATOR, process.env.SUCCESS_SIMULATOR],
      ccAddresses: null,
      bccAddresses: [process.env.SUCCESS_SIMULATOR]
    };

    sendMany(options, function (err, data) {
      t.ok(data[process.env.SUCCESS_ID_KEY].length > 0, 'Email Sent!');

      email_test_teardown();
      t.end();
    });
  });

  test(service_test_description + " send email All null(Force Failure)", function (t) {
    email_test_startup(specific_service);
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
      t.equal(err[process.env.ERROR_KEY], 400, "No Email Address provided");

      email_test_teardown();
      t.end();
    });
  });
});
