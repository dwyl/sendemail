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
  var template_cached = COMPILED_TEMPLATES[template_name + '.' + type];
  var compiled, template, filepath;

  // check if the template has already been opened
  if (!template_cached) {
    filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, filename);
    template = fs.readFileSync(filepath, 'utf8');
    compiled = Handlebars.compile(template);
    COMPILED_TEMPLATES[template_name + '.' + type] = compiled;
  }

  return COMPILED_TEMPLATES[template_name + '.' + type];
}

function isTruthy (x) {
  return Boolean(x);
}

function destinationParams (options) {
  // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html
  var toAddresses = options.toAddresses || [];
  var ccAddresses = options.ccAddresses || [];
  var bccAddresses = options.bccAddresses || [];

  toAddresses = toAddresses.filter(isTruthy);
  ccAddresses = ccAddresses.filter(isTruthy);
  bccAddresses = bccAddresses.filter(isTruthy);

  return { /* required */
    BccAddresses: bccAddresses,
    CcAddresses: ccAddresses,
    ToAddresses: toAddresses
  };
}

function messageParams (options) {
  var defaultCharset = 'utf8';

  return {
    /* required */
    Body: {
      /* required */
      Html: {
        Data: compile_template(options.templateName, 'html')(options.context),
        /* required */
        Charset: options.htmlCharset || defaultCharset
      },
      Text: {
        Data: compile_template(options.templateName, 'txt')(options.context),
        /* required */
        Charset: options.textCharset || defaultCharset
      }
    },
    Subject: {
      /* required */
      Data: options.subject,
      /* required */
      Charset: options.subjectCharset || defaultCharset
    }
  };
}

/**
 * sendMany function is similar to sendemail but allows more control
 * of params including multiple recipients and CC and BCC recipients
 *
 * @param {Object} options
   * @param {String[]} options.toAddresses - recipient emails addresses
   * @param {String[]} [options.ccAddresses] - cc recipient email addresses
   * @param {String[]} [options.bccAddresses] - bcc recipient email addresses
   * @param {Object} options.context - The key value pairs
   * that will be interpolated in the template
   * @param {String} [options.senderEmailAddress] - Specifies the sender
   * email address,defaults to SENDER_EMAIL_ADDRESS environment variable
   * @param {String} [options.replyToAddress] - Specifies the reply to
   * email address, defaults to SENDER_EMAIL_ADDRESS environment variable
   * @param {String} [options.htmlCharset] - charset for html email body
   * @param {String} [options.textCharset] - charset for text email body
   * @param {String} [options.subjectCharset] - charset for email subject
 * @param {Function} callback - continuation function called after
 * the email has been sent. */

function sendMany (options, callback) {
  var params;

  params = {
    Destination: destinationParams(options),
    Message: messageParams(options),
    Source: options.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS, /* required */
    ReplyToAddresses: [
      options.replyToAddress || process.env.SENDER_EMAIL_ADDRESS
    ]
  };

  ses.sendEmail(params, callback);
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
  var options = {
    templateName: template_name,
    context: person,
    subject: person.subject,
    toAddresses: Array.isArray(person.email) ? person.email : [person.email],
    senderEmailAddress: person.senderEmailAddress,
    replyToAddress: person.replyToAddress,
    ccAddresses: null,
    bccAddresses: null
  };

  sendMany(options, callback);
}


module.exports.email = sendemail;
module.exports.sendMany = sendMany;
module.exports.compile_template = compile_template;
module.exports.set_template_directory = set_template_directory;
