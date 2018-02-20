'use strict';

var AWS = require('aws-sdk');
var mailgun = require('mailgun.js');

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
var SERVICE_CONFIGS = {

  mailgun: {
    required_env: ['MAILGUN_API_KEY', 'MAILGUN_SENDING_DOMAIN'],
    export: {
      name: 'mailgun',
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
          // TODO Doublecheck this actually works
          'h:Reply-To': clean_options.replyToAddress
        };
      },
      send: function (params, callback) {
        var mg = mailgun.client({
          username: 'api',
          key: process.env.MAILGUN_API_KEY
        });

        return mg.messages.create(process.env.MAILGUN_SENDING_DOMAIN, params)
          .then(function (message) {
            return callback(null, message);
          })
          .catch(function (err) {
            return callback(err);
          });
      }
    }
  },

  ses: {
    required_env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    export: {
      name: 'ses',
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
        var ses = new AWS.SES({ region: process.env.AWS_REGION });

        return ses.sendEmail(params, callback);
      }
    }
  }

};

function envVarExists (envVar) {
  return process.env.hasOwnProperty(envVar) && process.env[envVar];
}

/**
 * Determines the sending service that the current request to send will use
 * @param {String} specific_service - name of sending service to use;
 * properly assuming set configuration, overrides default
 * @returns {Object} interface for parameterizing and sending email send requests
 * with the determined service
 */
function determine_service (specific_service) {
  // Configures send to use service specified in environment.
  // Accessible by end user, but useful only for testing, most likely.
  // Basically, a cheat code :)
  var specified = process.env.CURRENT_SERVICE ? process.env.CURRENT_SERVICE : specific_service;
  var determined = null;

  if (specified) {
    if (!SERVICE_CONFIGS[specified]) {
      throw new Error('Invalid service specified');
    }
    if (!SERVICE_CONFIGS[specified].required_env.every(envVarExists)) {
      throw new Error('Environment not configured for the specified service');
    }

    return SERVICE_CONFIGS[specified].export;
  }

  // given multiple validly configured services, ends as latest in
  // sequence of SERVICE_CONFIGS keys
  Object.keys(SERVICE_CONFIGS).forEach(function (service) {
    if (SERVICE_CONFIGS[service].required_env.every(envVarExists)) {
      determined = SERVICE_CONFIGS[service].export;
    }
  });

  if (!determined) {
    throw new Error('No sending service properly configured.');
  }

  return determined;
}

module.exports.send = function (options, callback) {
  var service = determine_service();

  return service.send(service.parameterize(options), callback);
};

module.exports.determine = determine_service;
module.exports.service_configs = SERVICE_CONFIGS;
