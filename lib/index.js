var path               = require('path');       // resolve template files
var fs                 = require('fs');         // open tempalte files
var Handlebars         = require('handlebars'); // compile templates
var COMPILED_TEMPLATES = {};                    // cache compiled templates
var mandrill           = require('mandrill-api');
var mandrill_client    = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

/**
 * set_template_directory does exactly what its name suggests
 * @param {String} dir - the template directory
 */
function set_template_directory(dir) {
  if(!dir) {
    throw "Please Set a Template Directory";
  }
  dir = path.resolve(dir);
  var files = fs.readdirSync(dir); // this should be sync (on startup)
  console.log(' - - - - - - - - - - - - - - - - - - - TEMPLATE FILES:');
  console.log(files);
  process.env.TEMPLATE_DIRECTORY = dir; // set the env var
}

/**
 * open template file sync (ONCE) and compile it!
 * @param {String} template_name - filename of template
 * @param {String} type - the file type
 */
function compile_template(template_name, type) {
  // console.log('template_name >> ' + template_name);
  // check if the template has already been opened
  if(!COMPILED_TEMPLATES[template_name+'.'+type]) {
    var filepath = process.env.TEMPLATE_DIRECTORY + '/' + template_name;
    filepath = path.resolve(filepath + '.' + type);
    var template = fs.readFileSync(filepath, 'utf8');
    var compiled = Handlebars.compile(template);
    COMPILED_TEMPLATES[template_name+'.'+type] = compiled;
  }
  return COMPILED_TEMPLATES[template_name+'.'+type];
}

/**
 * sendemail method takes a template name and person object and uses
 * mandril to send the desired email.
 * @param {String} template_name - the template to use for the email
 * @param {Object} person - the object containing the details of the
 * person to whom we want to send the email. Requires both name
 * and email. if you don't *know* the name of the person, leave it
 * an empty string.
 * @param {Function} callback - continuation function called after
 * the email has been sent.
 */

module.exports = function sendemail(template_name, person, callback) {

    var message = {
        "html": compile_template(template_name, 'html')(person),
        "text": compile_template(template_name, 'txt')(person),
        "subject": "Welcome to DWYL",
        "from_email": "hello@dwyl.io",
        "from_name": "Hello from DWYL",
        "to": [{
                "email": person.email,
                "name": person.name, // not using this for now.
                "type": "to"
            }],
        "headers": {
            "Reply-To": "hello@dwyl.io"
        },
        "important": false,
        "track_opens": true,
        "track_clicks": true,
        "tags": [
            "registration"
        ],
    };
    mandrill_client.messages.send({"message": message}, function(result) {
        // console.log(result);
        return callback(null, result);
    }, function(error) {
        // Mandrill returns the error as an object with name and message keys
        console.log('MANDRILL ERROR: ' + error.name + ' - ' + error.message);
        return callback(error);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });

}

module.exports.compile_template = compile_template;
module.exports.set_template_directory = set_template_directory;

// init function?
// if(process.env.TEMPLATE_DIRECTORY){
//   set_template_directory(process.env.TEMPLATE_DIRECTORY);
// }
