# Hapi Email

Send ***welcome, verification, notification and reminder emails***
from *any* Hapi.js app.

## Why?

While we would *prefer* for *email* to be *retired*
and replaced by something *better*, the fact remains
that *most* people still use email as their *primary*
means of (*digital*) communication.

Given that email is not going away, we need to make
sending email to people as simple as possible.

## What?

### Verify Email Address

As part of registering new people for your Hapi app you
will need to *verify* their email addresses to ensure that people
are not signing up with *fake* emails (or *worse* using someone else's email!)

### Reminder Email?



This tutorial shows you how to do this kind of verification.

![meteor verify email](http://i.imgur.com/ffcxHQg.png)

***Try it***: http://meteor-email.meteor.com/


## *How*?

+ [ ] Can we make this generic?
+ [ ] Use [***Vision***](https://github.com/hapijs/vision)
to render templates?

Proposed Method Signature:

```js
sendEmail(template, options, callback);
```


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

+

## Notes

1. We have used this successfully in our Meteor Apps but have not
written automated tests because sending email is part of Meteor's Core
Functionality. If anyone else wants to write tests and make this into
an Atmosphere package, we are happy to point this tutorial to your package
so you get the click throughs!

2. We are not using the *latest* Meteor so have not tried this code with
meteor 1.0< if you have issues, please add them here on GitHub so others
can learn. Thanks!
