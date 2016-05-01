require('env2')('.env');
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;
var ses = new AWS.SES();
// Edit this with YOUR email address.
var email   = "contact.nelsonic@gmail.com";

// Load your AWS credentials and try to instantiate the object.
// aws.config.loadFromPath(__dirname + '/config.json');

var ses_mail = "From: 'AWS Tutorial Series' <" + email + ">\n";
ses_mail = ses_mail + "To: " + email + "\n";
ses_mail = ses_mail + "Subject: AWS SES Attachment Example\n";
ses_mail = ses_mail + "MIME-Version: 1.0\n";
ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
ses_mail = ses_mail + "--NextPart\n";
ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
ses_mail = ses_mail + "This is the body of the email.\n\n";
ses_mail = ses_mail + "--NextPart\n";
ses_mail = ses_mail + "Content-Type: text/plain;\n";
ses_mail = ses_mail + "Content-Disposition: attachment; filename=\"attachment.txt\"\n\n";
ses_mail = ses_mail + "AWS Tutorial Series - Really cool file attachment!" + "\n\n";
ses_mail = ses_mail + "--NextPart";

var params = {
    RawMessage: { Data: new Buffer(ses_mail) },
    Destinations: [ email ],
    Source: "'AWS Tutorial Series' <" + email + ">'"
};

ses.sendRawEmail(params, function(err, data) {
  console.log(err, data);
});
