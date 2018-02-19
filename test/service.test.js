// No env set here, uses env set on index.test.js

var service = require('../lib/service.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var test = require('tape');

// TODO Ok assumption?????
// Assumes .env used for testing has all available services configured simultaneously
test(file + " specify a sending service explicitly", function (t) {
  // value randomly selected, can be any valid service
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
  Object.keys(configs).forEach(function (specific_service) {
    unconfigure_service(specific_service);
  });
  try {
    service.determine();
  } catch (e) {
    t.equal(e.message, "No sending service properly configured. Doublecheck the environment variables required for your service of choice");
    t.end();
  }
});

// TODO Add docblock
function unconfigure_service (specific_service) {
  return service.service_configs[specific_service].required_env.forEach(function (envVar) {
    delete process.env[envVar];
  });
}
