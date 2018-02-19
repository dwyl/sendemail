'use strict';

var AWS = require('aws-sdk');
var mailgun = require('mailgun.js');

// TODO Document
// TODO Clean this up
// required env is list of env vars for given service
// export is object returned to and used in main script
  // export.name is the service's name :)
  // export.parameterize takes the options sanitized in sendMany and maps them to the
  // input format the given service's sending function expects
  // export.send is expected to be a function of signature (config object, callback)
  // that handles using the service to send an email with the given parameters input by user and finessed by the main script
var SERVICE_CONFIGS = {

  mailgun: {
    required_env: ['MAILGUN_API_KEY', 'MAILGUN_SENDING_DOMAIN'],
    export: {
      name: 'mailgun',
      parameterize: function (clean_options) {

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
        var mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY });
        mg.messages.create(process.env.MAILGUN_SENDING_DOMAIN, params)
          .then(function(message) {
            return callback(undefined, message);
          }) // logs response data
          .catch(function(err) {
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
  return process.env.hasOwnProperty(envVar) && process.env[envVar] !== undefined;
}

// TODO docbloc
// If, for whatever reason, env vars are set for both SES and Mailgun,
// we default to the last service in the list (currently SES)
function determine_service (specific_service) {

  if (specific_service) {

    if (!SERVICE_CONFIGS[specific_service]) {
      throw new Error('Invalid service specified');
    }
    if (!SERVICE_CONFIGS[specific_service].required_env.every(envVarExists)) {
      throw new Error('Environment not configured for the specified service');
    }
    return SERVICE_CONFIGS[specific_service].export;
  }

  var determined = null;
  for (var service in SERVICE_CONFIGS) {
    if (SERVICE_CONFIGS[service].required_env.every(envVarExists)) {
      // given multiple validly configured services, ends as latest in sequence of SERVICE_CONFIGS keys
      determined = SERVICE_CONFIGS[service].export;
    }
  }

  if (!determined) {
      throw new Error('No sending service properly configured. Doublecheck the environment variables required for your service of choice');
  }

  return determined;
}

// TODO Need to test unset, setting process var, and overriding;
module.exports.send = function (options, callback, specific_service) {
  specific_service = process.env.CURRENT_SERVICE  ? process.env.CURRENT_SERVICE : specific_service;
  var service = determine_service(specific_service);
  return service.send(service.parameterize(options), callback);
};

// utility for checking currently configured service, or default in case
// of multiple configurations
module.exports.determine = determine_service;
module.exports.service_configs = SERVICE_CONFIGS;
