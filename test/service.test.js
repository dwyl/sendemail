// No env set here, uses env set on index.test.js

var service = require('../lib/service.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var test = require('tape');

// TODO Delete this test / Or rather, switch to using CURRENT_SERVICE
// TODO Add a test for using CURRENT_SERVICE
// TODO Ok assumption?????
// Assumes .env used for testing has all available services configured simultaneously
test(file + " specify a sending service explicitly", function (t) {
  // value randomly selected, can be any valid service

  // Better test
  // Find default; Pick service name NOT the default; specify that; compare to default
  var specific_service = "mailgun";
  var determined = service.determine(specific_service);
  t.equal(determined.name, specific_service, "Service determined according to specified");
  t.end();
});

test(file + " attempt to specify an invalid sending service", function (t) {
  try {
    service.determine("invalid")
  } catch (e) {
    t.equal(e.message, "Invalid service specified");
    t.end();
  }
});

test(file + " attempt to use a valid, but unconfigured service", function (t) {
  var specific_service = "mailgun";
  var remaining_service = "ses";
  unconfigure_service(specific_service);
  try {
    service.determine(specific_service);
  } catch (e) {
    t.equal(e.message, "Environment not configured for the specified service");
    var determined = service.determine(remaining_service);
    t.equal(determined.name, remaining_service, "Remaining configured service still works");
    t.end();
  }
});

test(file + " attempt to determine a service with no services configured", function (t) {
  var configs = service.service_configs;
  for (var service_name in configs) {
    unconfigure_service(service_name);
  }
  try {
    service.determine();
  } catch (e) {
    t.equal(e.message, "No sending service properly configured.");
    t.end();
  }
});

/**
 * Removes all configuration for a specified service from the environment
 *
 * @param {String} specific_service — name of a sending service
 * @returns undefined
 */
function unconfigure_service (specific_service) {
  service.service_configs[specific_service].required_env.forEach(function (envVar) {
    delete process.env[envVar];
  });
}
