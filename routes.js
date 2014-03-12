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

AccountController = RouteController.extend({
    verifyEmail: function () {
        Accounts.verifyEmail(this.params.token, function () {
            Router.go('/verified');
        });
    }
});
// see: https://github.com/EventedMind/iron-router/issues/3