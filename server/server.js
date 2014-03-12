process.env.MAIL_URL="smtp://meteor.email.2014%40gmail.com:P455w0rd2014@smtp.gmail.com:465/";

/*
Email.send({
  from: "meteor.email.2014@gmail.com",
  to: "nodecoder@gmail.com",
  subject: "Meteor Can Send Emails via Gmail",
  text: "Its pretty easy to send emails via gmail."
});
*/
Meteor.methods({
  serverVerifyEmail: function(email, userId, callback) {
    console.log("Email to verify:" +email + " | userId: "+userId);
    // this needs to be done on the server.
    Accounts.sendVerificationEmail(userId, email);
    if (typeof callback !== 'undefined') {
      callback();
    }
  }
})
