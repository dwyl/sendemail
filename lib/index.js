'use strict';

var path = require('path');             // -> resolve template files
var fs = require('fs');                 // -> open template files
var Handlebars = require('handlebars'); // -> compile templates
var COMPILED_TEMPLATES = {};            // -> cache compiled templates
var send = require('./service').send;     // -> email service, for sending

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

/**
 * sendMany function is similar to sendemail but allows more control
 * of params including multiple recipients and CC and BCC recipients
 *
 * @param {Object} options -
 * @param {String[]} options.toAddresses - The recipient emails addresses
 * @param {String[]} [options.ccAddresses] - The cc recipient emails addresses
 * @param {String[]} [options.bccAddresses] - The bcc recipient emails addresses
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
 * the email has been sent.
 * @returns {undefined}
 */
function sendMany (options, callback) {
  /* eslint-disable max-len */

  // Deep clones options, ensures no mutation of input (deep necessary because source may contain arrays)
  var clean_options = JSON.parse(JSON.stringify(options));

  clean_options.senderEmailAddress = clean_options.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS;
  clean_options.toAddresses = clean_options.toAddresses || [];
  clean_options.ccAddresses = clean_options.ccAddresses || [];
  clean_options.bccAddresses = clean_options.bccAddresses || [];
  clean_options.replyToAddress = clean_options.replyToAddress || process.env.SENDER_EMAIL_ADDRESS;
  clean_options.defaultCharset = 'utf8';

  clean_options.toAddresses = clean_options.toAddresses.filter(isTruthy);
  clean_options.ccAddresses = clean_options.ccAddresses.filter(isTruthy);
  clean_options.bccAddresses = clean_options.bccAddresses.filter(isTruthy);

  clean_options.html_body = compile_template(clean_options.templateName, 'html')(clean_options.context);
  clean_options.txt_body = compile_template(clean_options.templateName, 'txt')(clean_options.context);

  send(clean_options, callback);
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
