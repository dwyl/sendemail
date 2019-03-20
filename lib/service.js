'use strict';

var AWS = require('aws-sdk');
var mailgun = require('mailgun-js');

/**
 * Configuration for each integrated sending service.
 * Each object contains the following:
 * required_env — set of environment variables needed to configure the service,
 * used to check that a service is configured properly
 *
 * export — interface to using a service in index once a service
 * is determined to be validly configured. Has 2 methods:
 *
 *       - parameterize: maps options — user input — to properties of
 *       an object in the format the service's API expects
 *         @param {Object} clean_options — object containing data input
 *         to main script by user (passed here by index/sendMany)
 *         @returns {Object} options object in service-specific structure
 *
 *       - send: sends an email with the given configuration
 *         @param {Object} params — configuration object for sending an email
 *         @param {Function} callback - continuation function called after the
 *         email has been sent.
 *         @returns {Function} service library's sending method
 */
var SERVICE_CONFIGS = [
  {
    name: 'mailgun',
    required_env: ['MAILGUN_API_KEY', 'MAILGUN_SENDING_DOMAIN'],
    init: function () {
      var client = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_SENDING_DOMAIN
      });

      return {
        parameterize: function (clean_options) {
          /* eslint-disable quote-props */
          return {
            bcc: clean_options.bccAddresses,
            cc: clean_options.ccAddresses,
            to: clean_options.toAddresses,
            html: clean_options.html_body,
            text: clean_options.txt_body,
            subject: clean_options.subject,
            from: clean_options.senderEmailAddress,
            'h:Reply-To': clean_options.replyToAddress
          };
        },
        send: function (params, callback) {
          return client.messages().send(params, callback);
        }
      };
    }
  },
  {
    name: 'ses',
    required_env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    init: function () {
      var client = new AWS.SES({ region: process.env.AWS_REGION });

      return {
        parameterize: function (clean_options) {
          /* eslint-disable max-len */
          // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
          return {
            Destination: {
              /* required */
              BccAddresses: clean_options.bccAddresses,
              CcAddresses: clean_options.ccAddresses,
              ToAddresses: clean_options.toAddresses
            },
            Message: {
              /* required */
              Body: {
                /* required */
                Html: {
                  Data: clean_options.html_body,
                  /* required */
                  Charset: clean_options.htmlCharset || clean_options.defaultCharset
                },
                Text: {
                  Data: clean_options.txt_body,
                  /* required */
                  Charset: clean_options.textCharset || clean_options.defaultCharset
                }
              },
              Subject: {
                /* required */
                Data: clean_options.subject,
                /* required */
                Charset: clean_options.subjectCharset || clean_options.defaultCharset
              }
            },
            Source: clean_options.senderEmailAddress, /* required */
            ReplyToAddresses: [
              clean_options.replyToAddress
            ]
          };
        },
        send: function (params, callback) {
          return client.sendEmail(params, callback);
        }
      };
    }
  }
];

function envVarExists (envVar) {
  return process.env.hasOwnProperty(envVar) && process.env[envVar];
}

/**
 * Determines the sending service that the current request to send will use
 * @returns {Object} interface for parameterizing and sending email send requests
 * with the determined service
 */
function determine_service () {
  var determined = SERVICE_CONFIGS.filter(function (conf) {
    return conf.required_env.every(envVarExists);
  });
  var disambiguate;

  // Handle the case where the user's environment contains configuration
  // for multiple services, so that we can't determine which one to use
  if (determined.length > 1) {
    // SENDEMAIL_SERVICE is an accessory environment variable user can set
    // to explicitly determine sending service to use
    if (!process.env.SENDEMAIL_SERVICE) {
      throw new Error('Unable to decide which sending service to use from available configuration. Please specify which service to use via the SENDEMAIL_SERVICE environment variable');
    }

    disambiguate = determined.find(function (conf) {
      return conf.name === process.env.SENDEMAIL_SERVICE;
    });
    if (!disambiguate) {
      throw new Error('Invalid service specified');
    }

    return disambiguate;
  }

  if (determined.length === 0) {
    throw new Error('No sending service properly configured.');
  }

  return determined[0];
}

exports.initialize = function () {
  var service = determine_service().init();

  return function (options, callback) {
    return service.send(service.parameterize(options), callback);
  };
};

exports.determine = determine_service;
exports.service_configs = SERVICE_CONFIGS;
