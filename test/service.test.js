// No env set here, uses env set on index.test.js

var service = require('../lib/service.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var test = require('tape');


// For testing, we assume that all possible services have been configured
// in your .env file. We then write that configuration to this stub,
// so we can clear our environment configuration and still retrieve
// it as we need to manage state for each test
var ENV_STUB = {};

service.service_configs.forEach(function (conf) {
  conf.required_env.forEach(function (envVar) {
    ENV_STUB[envVar] = process.env[envVar];
  });
});

test(file + " attempt to determine a service with no services configured", function (t) {
  clear_environment();
  try {
    service.determine();
  } catch (e) {
    t.equal(e.message, "No sending service properly configured.");

    clear_environment();
    t.end();
  }
});

test(file + " attempt to use library with multiple services configured (ambiuous configuration)", function (t) {
  configure_environment_ambiguously();
  try {
    service.determine();
  } catch (e) {
    t.equal(e.message, "Unable to decide which sending service to use from available configuration. Please specify which service to use via the SENDEMAIL_SERVICE environment variable");
    clear_environment();
    t.end();
  }
});

test(file + " attempt to specify an invalid sending service", function (t) {
  configure_environment_ambiguously();
  try {
    process.env.SENDEMAIL_SERVICE = "invalid";
    service.determine();
  } catch (e) {
    t.equal(e.message, "Invalid service specified");
    clear_environment();
    t.end();
  }
});

test(file + " specify a valid sending service", function (t) {
  // all available services configured simultaneously (ambiguous)
  // so user needs to specify which service to use
  configure_environment_ambiguously();
  // value randomly selected, can be any valid service
  var specific_service = "mailgun";
  process.env.SENDEMAIL_SERVICE = specific_service;
  var determined = service.determine();
  t.equal(determined.name, specific_service, "Service determined according to specified");
  clear_environment();
  t.end();
});

test(file + " determine service implicitly, from environment", function (t) {
  // value randomly selected, can be any valid service
  var specific_service = "ses";
  configure_service(specific_service);
  var determined = service.determine();
  t.equal(determined.name, specific_service, "Service determined according to specified");
  clear_environment();
  t.end();
});

/**
 * Adds service specific configuration to environment
 *
 * @param {String} specific_service — name of a sending service
 * @returns undefined
 */
function configure_service (specific_service) {
  service.service_configs.find(function (conf) {
    return conf.name === specific_service;
  }).required_env.forEach(function (envVar) {
     process.env[envVar] = ENV_STUB[envVar];
  });
}

/**
 * Adds service specific configuration to environment for all valid services
 *
 * @returns undefined
 */
function configure_environment_ambiguously () {
  service.service_configs.map(function (conf) {
    return conf.name;
  }).forEach(function (service_name) {
    configure_service(service_name);
  });
}

/**
 * Clears all service specific configuration and testing state from environment
 * Used to clean up the testing environment after a test runs
 *
 * @returns undefined
 */
function clear_environment () {
  service.service_configs.forEach(function (conf) {
    conf.required_env.forEach(function (envVar) {
      delete process.env[envVar];
    })
  });
  delete process.env.SENDEMAIL_SERVICE;
}
