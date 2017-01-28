var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;
var ses = new AWS.SES();
var path = require('path'); // resolve template files
var fs = require('fs'); // open tempalte files
var Handlebars = require('handlebars'); // compile templates
var COMPILED_TEMPLATES = {}; // cache compiled templates

/**
 * set_template_directory does exactly what its name suggests
 * @param {String} dir - the template directory
 */
function set_template_directory(dir) {
    if (!dir) {
        throw "Please Set a Template Directory";
    }
    var files = fs.readdirSync(dir); // this should be sync (on startup)
    process.env.TEMPLATE_DIRECTORY = dir; // set the env var
}
set_template_directory(process.env.TEMPLATE_DIRECTORY);

/**
 * open template file sync (ONCE) and compile it!
 * @param {String} template_name - filename of template
 * @param {String} type - the file type
 */
function compile_template(template_name, type) {
    // check if the template has already been opened
    if (!COMPILED_TEMPLATES[template_name + '.' + type]) {
        var filepath = process.env.TEMPLATE_DIRECTORY + '/' + template_name;
        filepath = path.resolve(filepath + '.' + type);
        var template = fs.readFileSync(filepath, 'utf8');
        var compiled = Handlebars.compile(template);
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
 */
function sendemail(template_name, person, callback) {
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
                    Data: compile_template(template_name, 'html')(person),
                    /* required */
                    Charset: 'utf8'
                },
                Text: {
                    Data: compile_template(template_name, 'txt')(person),
                    /* required */
                    Charset: 'utf8'
                }
            },
            Subject: { /* required */
                Data: person.subject,
                /* required */
                Charset: 'utf8'
            }
        },
        Source: person.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS,
        /* required */
        ReplyToAddresses: [
            person.replyToAddress || process.env.SENDER_EMAIL_ADDRESS
        ]
    };
    ses.sendEmail(params, function(err, data) {
        if (err) { console.log('SES ERROR:', err, err.stack); } // an error occurred
        return callback(err, data);
    });

}


/**
 * sendemail method takes a template name and person array object for the To's, CC's & BCC and uses
 * AWS SES to send the desired email.
 * @param {String} template_name - the template to use for the email
 * @param {String} subject - the subject of the email
 * @param {Object} person - the object containing the details of the
 * person to whom we want to send the email. Requires both name
 * and email. if you don't *know* the name of the person, leave it
 * an empty string.
 * @param {Function} callback - continuation function called after
 * the email has been sent.
 */
function sendemails(template_name, subject, personTO, personCC, personBCC, callback) {
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property


    var toEmailAddress = ''

    for (var l = 0; l < personTO.length; l++) {
        toEmailAddress = toEmailAddress + personTO[l].email + ","
    }

    var ccEmailAddress = ''

    for (var k = 0; k < personCC.length; k++) {
        ccEmailAddress = ccEmailAddress + personCC[k].email + ","
    }

    var bccEmailAddress = ''

    for (var j = 0; j < personCC.length; j++) {
        bccEmailAddress = bccEmailAddress + personBCC[j].email + ","
    }

    var params = {
        Destination: { /* required */
            BccAddresses: [
                toEmailAddress
            ],
            CcAddresses: [
                ccEmailAddress
            ],
            ToAddresses: [
                bccEmailAddress
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: compile_template(template_name, 'html'),
                    /* required */
                    Charset: 'utf8'
                },
                Text: {
                    Data: compile_template(template_name, 'txt'),
                    /* required */
                    Charset: 'utf8'
                }
            },
            Subject: { /* required */
                Data: subject,
                /* required */
                Charset: 'utf8'
            }
        },
        Source: process.env.SENDER_EMAIL_ADDRESS,
        /* required */
        ReplyToAddresses: [
            process.env.SENDER_EMAIL_ADDRESS
        ]
    };
    ses.sendEmail(params, function(err, data) {
        if (err) { console.log('SES ERROR:', err, err.stack); } // an error occurred
        return callback(err, data);
    });

}

module.exports.email = sendemail;
module.exports.compile_template = compile_template;
module.exports.set_template_directory = set_template_directory;