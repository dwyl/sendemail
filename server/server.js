process.env.MAIL_URL="smtp://meteor.email.2014%40gmail.com:P455w0rd2014@smtp.gmail.com:465/";
Email.send({
  from: "meteor.email.2014@gmail.com",
  to: "nodecoder@gmail.com",
  subject: "Meteor Can Send Emails",
  text: "Here is some text"
});