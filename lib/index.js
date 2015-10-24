var path = require('path'); // used to resolve template directory
var fs   = require('fs');   // to check if template dir has files

function set_template_directory(dir) {
  if(!dir) {
    throw "Please Set a Template Directory";
  }
  dir = path.resolve(dir);
  var files = fs.readdirSync(dir); // this should be sync (on startup)
  if(typeof files === 'undefined' || files.length === 0){
    throw "No Files in Template Directory: "+ dir;
  }
  else {
    process.env.TEMPLATE_DIRECTORY = dir; // set the env var
  }
}

var Handlebars = require('handlebars');
var COMPILED_TEMPLATES = {};
/**
 * open template file sync (ONCE) and compile it!
 * @param {String} template_name - filename of template
 */
function compile_template(template_name) {
  // console.log('template_name >> ' + template_name);
  // check if the template has already been opened
  if(!COMPILED_TEMPLATES[template_name]) {
    var filepath = process.env.TEMPLATE_DIRECTORY + '/' + template_name;
    filepath = path.resolve(filepath);
    // console.log(' >>> '+filepath)
    var file = fs.readFileSync(filepath, 'utf8');
    COMPILED_TEMPLATES[template_name] = Handlebars.compile(file);
  }
  return COMPILED_TEMPLATES[template_name];
}

var mandrill        = require('mandrill-api');
var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

module.exports = function email(template_name, person, callback) {
  // console.log(' - - - - - - - - - - - - - - - - - - - Start')
  // console.log(compile_template(template_name)(person))
  // console.log(' - - - - - - - - - - - - - - - - - - - END')

    var message = {
        "html": compile_template(template_name)(person),
        // "text": textonly,
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

// if(process.env.TEMPLATE_DIRECTORY){
//   set_template_directory(process.env.TEMPLATE_DIRECTORY);
// }

module.exports.compile_template = compile_template;
module.exports.set_template_directory = set_template_directory;
