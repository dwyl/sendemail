Meteor Email
============

Send verification, notification and reminder emails from any Meteor app.


Meteor has a method for verifying that an email addres is valid: <br />
**Accounts.sendVerificationEmail(userId, [email])** 
but you need to configure email before you can send.

### Setup Meteor to Send Email

#### Enable the Email Module

In your terminal/console run:

```
meteor add email
```

#### Send Email Through Gmail SMTP

In your server/server.js file add the following line:
```javascript
process.env.MAIL_URL="smtp://xxxxx%40gmail.com:yyyyy@smtp.gmail.com:465/"; 
```
Where xxxxx is your gmail username and yyyyy is your gmail password.



## Useful Links:

- Meteor sendVerificationEmail Docs: http://docs.meteor.com/#accounts_sendverificationemail
- Send email using gmail: http://zulfait.blogspot.co.uk/2013/01/meteor-js-send-email-through-gmail.html
- Send email with SendGrid: http://sendgrid.com/blog/send-email-meteor-sendgrid/

Disposable Gmail Account (used for testing):
- email: meteor.email.2014@gmail.com
- password: P455w0rd2014