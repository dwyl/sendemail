# Hapi Email

Send ***welcome, verification, notification and reminder emails***
from *any* Hapi.js app.

## Why?

While we would *prefer* for *email* to be *phased out*
and replaced by something *better*, the fact remains
that *most* people still use email as their *primary*
means of (*digital*) communication.

Given that email is not going away, we need to make
sending email to people as simple as possible.

## What?


## *How*?





## Want *Examples*?


### *Welcome* Email!


### *Verify* Email Address

As part of registering new people for your Hapi app you
will need to *verify* their email addresses to ensure that people
are not signing up with *fake* emails (or *worse* using someone else's email!)

### *Reminder* Email?




## *Notes*?


+ [ ] Can we make this *generic*?
+ [ ] Use [***Vision***](https://github.com/hapijs/vision)
to render templates?

Proposed Method Signature:

```js
sendEmail(template, options, callback);
```

### Which Email Service Provider?

Initially we are using ***Mandrill*** for ***dwyl***.

If you want to use an alternative mail sender,
e.g: [sendgrid](http://sendgrid.com/)
or [amazon ses](https://aws.amazon.com/ses/)  
please ***tell us***: https://github.com/nelsonic/hapi-email/issues
(*we are* ***always*** *happy to help*)


## Useful Links:

+ Mandrill Node module code: https://bitbucket.org/mailchimp/mandrill-api-node
(*sadly*, ***not on GitHub***...)
+ Message send method: https://mandrillapp.com/api/docs/messages.nodejs.html
+ API Key: https://mandrillapp.com/settings/index/
+ Originally implementation:
https://github.com/dwyl/time/issues/135
