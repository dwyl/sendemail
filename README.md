Meteor Email (Verification)
============

Send verification, notification and reminder emails from any Meteor app.

## Background

As part of registering new users for your *fantastic* Meteor app you
will need to *verify* their email addresses to ensure that people
are not signing up with fake emails (or *worse* using someone else's email!)

This tutorial shows you how to do this kind of verification.

## Example

![meteor verify email](http://i.imgur.com/ffcxHQg.png)

***Try it***: http://meteor-email.meteor.com/


## Implementation

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

In your server/server.js file add the following MAIL_URL config line:
```javascript
process.env.MAIL_URL="smtp://xxxxx%40gmail.com:yyyyy@smtp.gmail.com:465/";
```
Where xxxxx is your gmail username and yyyyy is your gmail password.

##### Send Your First Email Through Gmail

In your server/server.js file add this email directive
```
Email.send({
  from: "meteor.email.2014@gmail.com",
  to: "your-personal-email-here@gmail.com",
  subject: "Meteor Can Send Emails via Gmail",
  text: "Its pretty easy to send emails via gmail."
});
```

You should receive an email within a few seconds:

![Meteor Gmail](http://i.imgur.com/dB6DQyf.png)

As soon as you've *confirmed* that's *working*,
***comment out*** the **Email.send**
code so you don't continuously send yourself test emails each time you
update your project.


### Enable Meteor Accounts

Enable the simplest type of user account (email and password)

```
meteor add accounts-base
meteor add accounts-password
```

Now you can use the **Accounts.createUser**
and **Accounts.sendVerificationEmail** methods.

That will send an email in the form:

![Meteor verification email](http://i.imgur.com/BpUckrK.png)

The standard Meteor virification link looks like:
http://yoursite.com/#/verify-email/gDSfHxYWuzwRiqmmN


### Add Iron Router

Add the [Iron Router](https://github.com/EventedMind/iron-router) package
(requires [meteorite](https://github.com/oortcloud/meteorite))

```
mrt add iron-router
```

Iron router **routes.js** with controller function for handling verification.

```javascript
Router.map(function () {
    this.route('/', {
        path: '/',
        template: 'verifyemail',
    });

    this.route('verifyEmail', {
        controller: 'AccountController',
        path: '/verify-email/:token',
        action: 'verifyEmail'
    });

    this.route('verified', {
        path: '/verified',
        template: 'verified'
    });

    this.route('checkemail', {
        path: '/checkemail',
        template: 'checkemail'
    });
});

// More info: https://github.com/EventedMind/iron-router/issues/3
AccountController = RouteController.extend({
    verifyEmail: function () {
        Accounts.verifyEmail(this.params.token, function () {
            Router.go('/verified');
        });
    }
});
```

Now the verification email will be in the form:

![Iron router verification email](http://i.imgur.com/0ZVIOWl.png)

## Try it!

This is what you can see:

![Form prompting for email](http://i.imgur.com/ffcxHQg.png)

![Verification Email Sent](http://i.imgur.com/NRNP7ch.png)

![Verification link in email](http://i.imgur.com/UZmQKUO.png)

![Verified](http://i.imgur.com/Xr9qcag.png)

## Useful Links:

- Meteor sendVerificationEmail Docs: http://docs.meteor.com/#accounts_sendverificationemail
- sendVerificationEmail needs to be done by the **server** (not in client.js!): http://stackoverflow.com/questions/22124708/sending-verification-email-with-meteor-causing-error
- Send email using gmail: http://zulfait.blogspot.co.uk/2013/01/meteor-js-send-email-through-gmail.html
- Send email with SendGrid: http://sendgrid.com/blog/send-email-meteor-sendgrid/
- Generate custom verification token: http://stackoverflow.com/questions/21753078/generating-a-verification-token-in-meteor-without-sending-an-email
- Verification fails with IronRouter: http://stackoverflow.com/questions/19112450/meteor-account-email-verify-fails-two-ways/
- Iron Router verification urls: https://github.com/EventedMind/iron-router/issues/3
- Dynamic email templates: http://stackoverflow.com/questions/17845932/using-dynamic-html-templates-in-meteor
- Push to Heroku: http://bytesofpi.com/post/20898722298/pushing-your-meteor-project-to-heroku
- Issues with SSL? http://stackoverflow.com/questions/15254520/meteorjs-email-configuration-ssl


Disposable Gmail Account (used for testing):
- email: meteor.email.2014@gmail.com
- password: P455w0rd2014

## Note

We have used this successfully in our Meteor Apps but have not
written automated tests because sending email is part of Meteor's Core
Functionality. If anyone else wants to write tests and make this into
an Atmosphere package, we are happy to point this tutorial to your package
so you get the click throughs!
