'use strict';

var AWS = require('aws-sdk');
var ses = new AWS.SES();
var path = require('path');             // -> resolve template files
var fs = require('fs');                 // -> open template files
var Handlebars = require('handlebars'); // -> compile templates
var COMPILED_TEMPLATES = {};            // -> cache compiled templates

AWS.config.region = process.env.AWS_REGION;

/**
 * set_template_directory does exactly what its name suggests
 * @param {String} dir - the template directory
 * @returns {undefined}
 */
function set_template_directory (dir) {
  if (!dir) {
    throw new Error('Please Set a Template Directory');
  }
  fs.readdirSync(dir);                  // this should be sync (on startup)

  process.env.TEMPLATE_DIRECTORY = dir; // set the env var
}
set_template_directory(process.env.TEMPLATE_DIRECTORY);

/**
 * open template file sync (ONCE) and compile it!
 * @param {String} template_name - filename of template
 * @param {String} type          - the file type
 * @returns {Object}             - compiled templates
 */
function compile_template (template_name, type) {
  var filename = template_name + '.' + type;
  var filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, filename);
  var template_cached = COMPILED_TEMPLATES[template_name + '.' + type];

  var template = !template_cached ? fs.readFileSync(filepath, 'utf8') : '';
  var compiled = Handlebars.compile(template);

  // check if the template has already been opened
  if (!template_cached) {
    COMPILED_TEMPLATES[template_name + '.' + type] = compiled;
  }

  return COMPILED_TEMPLATES[template_name + '.' + type];
}

/**
 * sendemail method takes a template name and person object and uses
 * AWS SES to send the desired email.
 * @param {String} template_name - the template to use for the email
 * @param {Object} person - the object containing the details of the
 * person to whom we want to send the email. Requires both name
 * and email. if you don't *know* the name of the person, leave it
 * an empty string.
 * @param {Function} callback - continuation function called after
 * the email has been sent.
 * @returns {undefined}
 */
function sendemail (template_name, person, callback) {
  /* eslint-disable max-len */
  // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
  var params = {
    Destination: { /* required */
      ToAddresses: [
        person.email
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: compile_template(template_name, 'html')(person), /* required */
          Charset: 'utf8'
        },
        Text: {
          Data: compile_template(template_name, 'txt')(person), /* required */
          Charset: 'utf8'
        }
      },
      Subject: { /* required */
        Data: person.subject, /* required */
        Charset: 'utf8'
      }
    },
    Source: person.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS, /* required */
    ReplyToAddresses: [
      person.replyToAddress || process.env.SENDER_EMAIL_ADDRESS
    ]
  };

  ses.sendEmail(params, function (err, data) {
    // error check
    if (err) {
      /* eslint-disable no-console */
      console.log('SES ERROR:', err, err.stack);
    }

    return callback(err, data);
  });
}

module.exports.email = sendemail;
module.exports.compile_template = compile_template;
module.exports.set_template_directory = set_template_directory;
