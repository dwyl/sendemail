
Meteor.startup(function () {
  // test with gmail
  process.env.MAIL_URL="smtp://meteor.email.2014%40gmail.com:P455w0rd2014@smtp.gmail.com:465/";
  // test with SendGrid
  // process.env.MAIL_URL = 'smtp://your_username:your_password@smtp.sendgrid.net:587';
});

Accounts.urls.verifyEmail = function (token) {
  return Meteor.absoluteUrl('verify-email/' + token);
};

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