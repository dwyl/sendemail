var fs         = require('fs');
var path       = require('path');
var templatedir = __dirname + '/../examples/templates/';
console.log(' >> ' + templatedir);
var htmlpath   = path.resolve(templatedir + 'welcome_html.html');
// var textpath   = path.resolve(templatedir + 'welcome_text.txt');
var template   = fs.readFileSync(htmlpath, 'utf8');
// var textonly   = fs.readFileSync(textpath, 'utf8');
// create reusable transporter object using SMTP transport
var mandrill    = require('mandrill-api');

var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

module.exports = function email(person, callback) {
    var message = {
        "html": template,
        // "text": textonly,
        "subject": "Welcome to DWYL",
        "from_email": "hello@dwyl.io",
        "from_name": "Hello from DWYL",
        "to": [{
                "email": person.email,
                // "name": "FirstName", // not using this for now.
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
        return callback(result);
    }, function(error) {
        // Mandrill returns the error as an object with name and message keys
        console.log('MANDRILL ERROR: ' + error.name + ' - ' + error.message);
        return callback(error);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });

}

var path = require('path');
var fs   = require('fs');

function set_template_directory(dir) {
  if(!dir) {
    throw "Please Set a Template Directory";
  }
  dir = path.resolve(dir);
  // console.log(dir);
  var files = fs.readdirSync(dir); // this should be sync (on startup)
  // console.log(files);
  if(typeof files === 'undefined' || files.length === 0){
    throw "No Files in Template Directory: "+ dir;
  }
  else {
    process.env.TEMPLATE_DIRECTORY = dir;
  }

}
module.exports.set_template_directory = set_template_directory;
