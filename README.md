# Hapi Email

Send ***welcome, verification, notification and reminder emails***
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

*Reliably* ***Send*** `html` **email** with ***dependable delivery***.  
When email that *has* to get through as quickly as possible
so everyone can get on with their lives.

## *How*?

### Install `hapi-email` from NPM

```sh
npm install hapi-email --save
```

### Mandril API Key *Environment Variable*

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

+ [ ] Can we make this *generic*?
+ [ ] Use [***Vision***](https://github.com/hapijs/vision)
to render templates?

Proposed Method Signature:

```js
sendEmail(template, options, callback);
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

For *simplicity* we are using ***Handlebars***



## Useful Links:

+ Mandrill Node module code: https://bitbucket.org/mailchimp/mandrill-api-node
(*sadly*, ***not on GitHub***...)
+ Message send method: https://mandrillapp.com/api/docs/messages.nodejs.html
+ API Key: https://mandrillapp.com/settings/index/
+ Originally implementation:
https://github.com/dwyl/time/issues/135
