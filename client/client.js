var snd = new Audio("http://www.nirvani.net/misc/video_game_sounds/mario/nsmb_coin.wav"); // buffers automatically when created

Template.verifyemail.events({
  'click #verify': function (e) {
    e.preventDefault(); // prevent refreshing the page

    var email = $('#email').val(),
    password = makeTempPassword(); // generate temporary password 

    email = trimInput(email);
    // Trim and validate the input
    console.log("email to be verified: " +email +" | Random password: " +password);

    if (email !== 'undefined'){ // do better checks than this for email 

      Accounts.createUser({email: email, password : password}, function(err){
        if (err) {
          // Inform the user that account creation failed
          console.log("Unable to register", err);
          if(err.reason === "Email already exists."){
          // handle user exists.
            console.log("Display password reset form?");
          }
        } else {
          console.log("Registration successfull");
          // Success. Account has been created and the user
          // has logged in successfully. 
          var userId = Meteor.userId();
          Meteor.call('serverVerifyEmail', email, userId, function(){
            console.log("Verification Email Sent")
            snd.play();
          });   
        }

      });   
    }
  }
});

// trim helper
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

// borrowed from: http://stackoverflow.com/questions/1349404
function makeTempPassword() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}