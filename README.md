# Hapi Email

Send ***welcome, verification, password reset, notification and reminder emails***
from *any* Hapi.js app.


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

## *How*?

### Checklist:
+ [ ] install the `hapi-email` module from NPM
+ [ ] get a Mandril API Key
+ [ ] set your `MANDRILL_APIKEY` as an [*environment variable*](https://github.com/dwyl/learn-environment-variables)
+ [ ] If you don't already have a /**templates** directory in your
project create one!
+ [ ] create a pair of email templates in your /**templates** directory
one called `hello.txt` the other `hello.html`
+ [ ] borrow the code for `hello.txt` and `hello.html` from the **/examples/templates** directory of this project!
+ [ ] create a test file called `email.js` and paste some sample
code in it.

### 1. Install `hapi-email` from NPM

```sh
npm install hapi-email --save
```

### 2. Mandril API Key *Environment Variable*

`hapi-email` requires you set an environment variable to
*securely* store your Mandril API Key.

> If you are ***new*** to ***environment variables***, we have a   
> ***quick introduction***: https://github.com/dwyl/learn-environment-variables

#### Get a Mandril Account and Create an API Key

If you have not already registered for Mandrill,
get started: https://www.mandrill.com/signup/  
if you get stuck, *we are here to help*: [![Join the chat at https://gitter.im/{ORG-or-USERNAME}/{REPO-NAME}](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Note: If you prefer to use a *different* email sending provider,  
please [***let us know***](https://github.com/nelsonic/hapi-email/issues)
which one so we can add support.

### 3. Create your *Template(s)*

Create *simple* `.html` (*pretty design*) *and* `.txt` (*plaintext*) templates to *get started*.


#### *Question*: Should we create *text-only* templates?

***Quick*** **Answer**: ***Yes***.  
In our *experience*, *while* most *modern* email clients
(Gmail, Apple/iOS Mail, Yahoo! Mail, Outlook)  
have `HTML` email ***enabled by default***,
*often* the people who *prefer* ***text-only***
(e.g: people with Blackberry phones,
***visual/physical impairment*** or *company* email
email systems - *with aggressive filtering*)
are "***higher value***" customers. Also,
possibly *more importantly* (*depending on who is using your product/service*) you can have *technical privacy-concious* people
that ***only*** read `.txt` email to avoid sending
and tracking data ... but, if you're building a tool for
non-technical people, focus on the fact that `.txt` email
is more ***accessible*** and prevents your messages getting
blocked by spam filters.



If you are stuck, have a look at **/examples/templates**.



### 4. *Send* the Email!

Proposed Method Signature:

```js
sendEmail(template, options, callback);
```

#### Simple Example:

> Set the template directory
```sh
email.setTemplateDir(__dirname + '/path/to/templates/')
```




## Want *Examples*?

There are *many* situations where you want to send people email.

### *Welcome* Email!

A simple "hello & welcome to our community" email
you send to people when they register to learn more about
your product/service.


### *Verify* Email Address

As part of registering new people for your Hapi app you
will need to *verify* their email addresses to ensure that people
are not signing up with *fake* emails (or *worse* using someone else's email!)

### *Set a New Password*

People forget passwords, we need to help them
set a new password as quickly & securely as possible.

### *Reminder* Email?

Remind people they signed up but have not *used* the product/service?


## *Notes*?

### Which Email Service Provider?

We are *currently* using ***Mandrill*** for ***dwyl***.

If you want to use an alternative mail sender,
e.g: [sendgrid](http://sendgrid.com/)
or [amazon ses](https://aws.amazon.com/ses/)  
please ***tell us***: https://github.com/nelsonic/hapi-email/issues
(*we are* ***always*** *happy to help*)

### Which View/Template Libaray?

For *simplicity* we are using ***Handlebars***,
handlebars is tried and tested and while it does not attempt
to do anything *fancy* ("*VirtualDOM*"), it does allow
you to do sophisticated templates with includes and iterators
and supports compilation so its ***fast***
(*fast enough ... how many millions of emails are you sending per day...?*)



## Useful Links:

### Background Reading

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

### Stats/Trends

+ Email Client Stats: https://emailclientmarketshare.com/
+ Email Adoption: https://en.wikipedia.org/wiki/HTML_email#Adoption

### Technical Detail

+ Mandrill Node module code: https://bitbucket.org/mailchimp/mandrill-api-node
(*sadly*, ***not on GitHub***...)
+ Message send method: https://mandrillapp.com/api/docs/messages.nodejs.html
+ API Key: https://mandrillapp.com/settings/index/
+ Original implementation (*tightly-coupled in our "Alpha"*):
https://github.com/dwyl/time/issues/135
