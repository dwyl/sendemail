# SendEmail

[![Build Status](https://travis-ci.org/dwyl/sendemail.svg?branch=tidyup)](https://travis-ci.org/dwyl/sendemail)
[![codecov.io](https://codecov.io/github/dwyl/sendemail/coverage.svg?branch=master)](https://codecov.io/github/dwyl/sendemail?branch=master)
[![Code Climate](https://codeclimate.com/github/dwyl/sendemail/badges/gpa.svg)](https://codeclimate.com/github/dwyl/sendemail)
[![Dependency Status](https://david-dm.org/dwyl/sendemail.svg)](https://david-dm.org/dwyl/sendemail)
[![devDependency Status](https://david-dm.org/dwyl/sendemail/dev-status.svg)](https://david-dm.org/dwyl/sendemail#info=devDependencies)
[![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/dwyl/goodparts "JavaScript The Good Parts")

[![Node.js Version](https://img.shields.io/node/v/sendemail.svg?style=flat "Node.js 0.12 and 4.x latest both supported")](http://nodejs.org/download/)
[![npm](https://img.shields.io/npm/v/sendemail.svg)](https://www.npmjs.com/package/sendemail)
[![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*Send* ***welcome, verification, password reset, update and reminder emails***
from *any* node.js app.


## Why?

While we would *prefer* for *email* to be *phased out*
and replaced by something *better*, the fact remains
that *most* people still use email as their *primary*
means of (*digital*) communication.

![dilbert-email](http://jointeffortmarketing.com/wp-content/uploads/2013/10/dilbert-email.png)

Given that email is not going away, we need to make
sending email to people as ***simple and reliable*** as possible.

## What?

*Reliably* ***Send*** *beautiful* **email** with ***dependable delivery***.
When email that *has* to get through as quickly as possible
so everyone can get on with their lives.

### Decisions We Made (*to Get Started as Fast as Possible*)

In *crafting* this module (*for our own use*) we have made a few
of technical decisions (*for pragmatic reasons*):

1. use [***environment variables***](https://github.com/dwyl/learn-environment-variables)
for storing sensitive information (*API Keys*)
and projects-specific configuration (*Template Directory*)
2. use ***Handlebars*** for email template rendering. Handlebars is very
easy to use and allows us to send ***beautiful*** **HTML** emails without
the complexity or learning curve of many other view libraries.
3. We currently support the following Email Services

    - **[Amazon Web Services Simple Email Service](https://aws.amazon.com/ses/getting-started/) ("AWS SES")**
    - **[Mailgun](https://www.mailgun.com/)**

Both are reliable, well-documented, offer excellent "*deliverability*", and have fairly generous free tiers.
For more information, check out the [Service Details](#service-details) section below

> **Note**: if you prefer to use a different Email Service provider or template/view
library for your project,
[***please let us know***](https://github.com/dwyl/sendemail/issues)!
We are happy to support alternatives to make this project more
*useful* to other
people with *specific needs*.

## *How*?

### Checklist (*everything you need to get started in 5 minutes*)
+ [ ] install the `sendemail` module from NPM
+ [ ] Ensure that you have an an account on your email service of choice
+ [ ] set the required [*environment variables*](https://github.com/dwyl/learn-environment-variables) (*see below*)
+ [ ] If you don't already have a /**templates** directory in your
project create one!
+ [ ] create a pair of email templates in your /**templates** directory
one called `hello.txt` the other `hello.html`
+ [ ] borrow the code for `hello.txt` and `hello.html` from the **/examples/templates** directory of this project!
+ [ ] create a file called `welcome.js` and paste some sample
code in it (see: [/examples/templates/**send-welcome-email.js**](/examples/templates/send-welcome-email.js) )

### 1. Install `sendemail` from NPM

```sh
npm install sendemail --save
```

### 2. Set your *Environment Variables*

`sendemail` requires you set environment variables for your email service's API keys

> We recommend you use [`env2`](https://github.com/dwyl/env2) to load your
Environment Variables from a file so you can easily keep track of which
variables you are using in each environment.

Create a file in the root of your project called `.env` and paste the following, varying by email service:

#### AWS SES

```sh
export TEMPLATE_DIRECTORY=./examples/templates
export SENDER_EMAIL_ADDRESS=your.aws.verified.email.address@gmail.com
export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=YOURKEY
export AWS_SECRET_ACCESS_KEY=YOURSUPERSECRET
```

#### Mailgun

```sh
export TEMPLATE_DIRECTORY=./examples/templates
export SENDER_EMAIL_ADDRESS=your.sending.email.address@gmail.com
export MAILGUN_API_KEY=YOURKEY
export MAILGUN_SENDING_DOMAIN=YOURDOMAIN
```

> If you are ***new*** to ***environment variables***, we have a
> ***quick introduction***: https://github.com/dwyl/learn-environment-variables


### 3. Create your *Template(s)*

Create a ***pair*** of templates *simple* `.html` (*pretty design*) *and* `.txt` (*plaintext*) templates to *get started*.

Here's what our ***pair*** of templates look like side-by-side:

![welcome-email-templates-side-by-side](https://cloud.githubusercontent.com/assets/194400/10602078/23d7555c-770e-11e5-983e-4999923a61b2.png)

[ Click the image to expand/zoom ]

>***Question***: Should we create *plaintext* templates (*in addition to html*?)?
***Quick*** **Answer**: ***Yes***.
> For ***Expanded Answer***, see: ***Plain Text Templates?*** section in **Notes** (*below*).

If you are stuck, have a look at **/examples/templates/**


### 4. *Send* an Email!

Create a file called `email.js` and paste the following:

```js
var sendemail   = require('sendemail').email; // no api key
var email = sendemail.email;
sendemail.set_template_directory('./relative/path/to/template/directory');

var person = {
  name : "Jenny",
  email: "your.name+test" + Math.random() + "@gmail.com",
  subject:"Welcome to DWYL :)"
}

email('welcome', person, function(error, result){
  console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
  console.log(result);
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
})
```

#### Result:

![example dwyl welcome email](https://cloud.githubusercontent.com/assets/194400/10716076/1d89ff82-7b24-11e5-9e24-d5343735b76b.png)

For *full code of working example* see: [/examples/templates/**send-welcome-email.js**](https://github.com/dwyl/sendemail/blob/master/examples/send-welcome-email.js)
Note: you still need to set your *environment variables*
for the email to be sent. The example will work regardless of which service you use; our public API is platform agnostic


#### More Options?:

If you wish to send to multiple recipients or include CC or BCC recipients,
use the sendMany method. This allows you to provide an options object
with an array of `toAddresses`, `ccAddresses`, and `bccAddresses` and charset options.
 e.g.

```js
  var sendemail   = require('sendemail');

  var options = {
    templateName: 'hello',
    context: {
      tempalateVariableName: 'Variable Value',
      name: 'Joe Bloggs'
    },
    subject: 'Welcome to Email',
    toAddresses: ['recipient1@gmail.com', 'recipient2@gmail.com'],
    ccAddresses: ['ccRecipient1@gmail.com', 'ccRecipient2@gmail.com'],
    bccAddresses: ['bccRecipient1@gmail.com', 'bccRecipient2@gmail.com'],
    htmlCharset: 'utf16',
    textCharset: 'utf16',
    subjectCharset: 'utf8'
  };

  sendemail.sendMany(options, callback);

```

<br />
___

## *Notes*?

### Which Email Service Provider?

We are *currently* using ***AWS SES*** for ***dwyl***.
We also support **Mailgun**

If you want to use an alternative mail sender,
e.g: [sendgrid](http://sendgrid.com/), [sendinblue](https://www.sendinblue.com/), etc.

please ***tell us***: https://github.com/dwyl/sendemail/issues
(*we are* ***always*** *happy to help*)


### Moving out of a sandbox environment.

Whether you choose AWS or Mailgun, you start off in a _sandbox environment_

This means, generally:
- low limit on the number of emails you can send (usually daily allowance)
- you can send to and from only verified (manually whitelisted) email addresses, not any random email address from a random person stumbling across your site as in production use

You're going to want to move out of this environment for sending email on a public project (in most cases)

#### AWS SES

When you first sign up to AWS, you are provided with a _sandbox account_.
With this, you can send up to *200 emails a day,* to email addresses that you
have registered on your sandbox environment. For some use cases this is fine,
but for those who want a *higher daily sending quota*, want to send emails
without the *restriction of registering recipient emails* upfront, amongst [other
reasons](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html)
'moving out' of your sandbox might be beneficial.
For many services, this _upgrade_ comes with a cost, but with AWS SES, this is
not necessarily the case. A quick and easy way to do so is to apply for an
increase in your SES Sending Limit; (1) click on the following link,
https://aws.amazon.com/ses/faqs/ (2) search for "apply" in section 4 and
(3) click 'apply'.

#### Mailgun

When you first sign up, Mailgun will provide a sandbox domain, which you can send from to test your integration. While in this sandbox, without a verified domain, you are limited to *300 emails per day*

Moreover, while you can send from any email address, you can send TO only verified email
addresses (requires a manual email verification step with the inbox owner)

Once you're happy with your integration, you'll need to do the following:

1. *Upgrade your account* This requires entering your credit card information. **Mailgun charges you only if you exceed your free monthly allowance (10,000 emails sent)**
2. Add your website's domain to your account
3. Go into your DNS registrar's account and create SPF and DKIM records, standard TXT records for signing emails sent from your domain that email servers receiving your mail use to verify that the message sent is legitimately from your domain ( *Mailgun provides the values for these records in your dashboard* ) instead of rejecting your messages because the recipient server wasn't sent from the domain the message is claiming it was sent from.
    - Interested in learning more? Here's a [short, simple read explaining DKIM and SPF](https://blog.woodpecker.co/cold-email/spf-dkim/)
4. Wait for Mailgun to verify that the records are set. Like any other DNS changes, this may take 24-48 hours (though typically much less)


### Which View/Template Libaray?

For *simplicity* we are using
[***Handlebars***](http://handlebarsjs.com/),
handlebars is ***tried and tested*** and while it does not attempt
to do anything *fancy* ("*VirtualDOM*"), it does allow
you to do sophisticated templates with includes and iterators
and supports compilation so its ***fast***
(*fast enough ... how many millions of emails are you sending per day...?*)
Yes... [*mustache*](https://github.com/janl/mustache.js/) is "*faster*"
than handlebars ... but in our *experience* having *conditionals*
(*i.e. "logic"*) is ***very useful*** for reducing the *number* of required templates while not (*significantly*) increasing complexity.
we don't think `if` statements in views are a "*crime*" ... ***do you***...?

> If anyone feels *strongly* about switching to an *alternative*
template engine, please raise an issue:
https://github.com/dwyl/sendemail/issues
(*please give clear reasons, i.e.* ***not*** *"react-ify-licious-heah because its* ***so cool*** ... ")

### *Plain Text*  Templates?

In our *experience*, *while* most *modern* email clients
(Gmail, Apple/iOS Mail, Yahoo! Mail, Outlook)
have `HTML` email ***enabled by default***,
*often* the people who *prefer* ***text-only***
(e.g: people with Blackberry phones,
***visual/physical impairment*** or *company* email systems - *with aggressive filtering*)
are "***higher value***" customers. Also,
possibly *more importantly* (*depending on who is using your product/service*) you can have *technical privacy-concious* people
that ***only*** read `.txt` email to avoid sending
and tracking data ... but, if you're building a tool for
non-technical people, focus on the fact that `.txt` email
is more ***accessible*** and prevents your messages getting
blocked by spam filters.

### High volume of emails when running automated tests?
When testing functions which will subsequently call methods in third party libraries,
your tests no longer need to run through those methods,
you can instead assume that the third party method will give back what they say they will give back
(since these tests should already exist in the library you are using).

Once you are sure there are [sufficient tests in place](https://codecov.io/github/dwyl/sendemail?branch=master) for the method you will stub, you may proceed with a test double.
For this library there are significant benefits for using a test double for the `email` method (see [#49](https://github.com/dwyl/sendemail/issues/49)).

###### The following is a quick example of how to implement a test stub:
If you have a helper function `notifyUser` which will subsequently call `require('sendemail').email`, this can be stubbed with:

1. `npm install --save-dev sinon`

2. Changing your test:

```js
var notifyUser = require('./notifyUser.js');

test('"notifyUser" should return the object { message: "email sent" }', function (t) {
  notifyUser('Bob', function (err, res) {
    t.deepEqual(res, { message: 'email sent' });
    t.end();
  });
});
```

To be something like this:

```js
var notifyUser = require('./notifyUser.js'); // this has to be required before the stub is implemented
var sinon = require('sinon');
var sendemail = require('sendemail');

test('"notifyUser" should return the object { message: "email sent", error: null }', function (t) {
  var email = sinon.stub(sendemail, 'email', function (name, person, cb) {
    cb(null, { message: 'email sent', anyotherkeywecareabout: 'value' });
  });

  notifyUser('Bob', function (err, res) {
    email.restore();

    t.ok(email.calledWith('Bob'));
    t.deepEqual(res, { message: 'email sent' });

    t.end();
  });
});
```

Check out the [article in background reading](https://semaphoreci.com/community/tutorials/best-practices-for-spies-stubs-and-mocks-in-sinon-js) for best practices when implementing test doubles with sinon


## Useful Links:

### Background Reading

+ Designing for the inbox:
https://www.campaignmonitor.com/dev-resources/guides/design/
(*plenty of detail & highly informative*)
+ Who Cares About Plain Text [email]?
https://blog.aweber.com/email-deliverability/who-cares-about-plain-text.htm
+ Can Email Be Responsive? http://alistapart.com/article/can-email-be-responsive
+ Coding your emails (*What’s so hard about HTML emails?*):
https://www.campaignmonitor.com/dev-resources/guides/coding/
+ Best Practices for Plain Text Emails and Why They’re Important:
https://litmus.com/blog/best-practices-for-plain-text-emails-a-look-at-why-theyre-important
+ Best practices for using test doubles (spies, stubs and mocks)
https://semaphoreci.com/community/tutorials/best-practices-for-spies-stubs-and-mocks-in-sinon-js

### Service Details

#### AWS SES

+ Detail: https://aws.amazon.com/ses/details/
+ Getting Started: https://aws.amazon.com/ses/getting-started/
+ Video Tutorial: https://www.youtube.com/watch?v=0NT8KRXRFG8
+ Basic Tutorial: http://timstermatic.github.io/blog/2013/08/14/sending-emails-with-node-dot-js-and-amazon-ses/
+ Testing: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/mailbox-simulator.html
+ Pricing: https://aws.amazon.com/ses/pricing/

#### Mailgun

+ Mailgun's official JS library: (https://github.com/mailgun/mailgun-js)
+ Detail: https://www.mailgun.com/sending-email
+ Getting Started: https://documentation.mailgun.com/en/latest/quickstart.html
  + The code samples there are, of course, using Mailgun's official library, not the independent one
+ Basic Tutorial: http://blog.mailgun.com/how-to-send-transactional-emails-in-a-nodejs-app-using-the-mailgun-api/
+ Pricing: https://www.mailgun.com/pricing

### Stats/Trends

+ Email Client Stats: https://emailclientmarketshare.com/
+ Email Adoption: https://en.wikipedia.org/wiki/HTML_email#Adoption


## Want *Examples*? [![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Ask%20For%20More.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

There are *many* situations where you want to send people email.

### *Welcome* Email!

A simple "hello & welcome to our community" email
you send to people when they register to learn more about
your product/service.
see: [/examples/templates/**send-welcome-email.js**](https://github.com/dwyl/sendemail/blob/master/examples/send-welcome-email.js)



### *Verify* Email Address

As part of registering new people for your Hapi app you
will need to *verify* their email addresses to ensure that people
are not signing up with *fake* emails (or *worse* using someone else's email!)

### *Set a New Password*

People forget passwords, we need to help them
set a new password as quickly & securely as possible.

### *Reminder* Email?

Remind people they signed up but have not *used* the product/service?

### *Notification* Email?

Sam liked your post/photo/update ...
social validation that your life has meaning!
