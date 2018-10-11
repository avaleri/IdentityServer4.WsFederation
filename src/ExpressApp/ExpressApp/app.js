'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var wsfedsaml2 = require('passport-wsfed-saml2').Strategy;
var fs = require('fs');
var session = require('cookie-session');

const dotenvConfig = require('dotenv').config();

if (dotenvConfig.error) {
    throw dotenvConfig.error
}

var config = {
    APP_PORT: process.env.APP_PORT,
    APP_REALM: process.env.APP_REALM,
    CERT_THUMBRPINT: process.env.CERT_THUMBRPINT,
    COOKIE_PARSER_SECRET: process.env.COOKIE_PARSER_SECRET,
    IDP_URL: process.env.IDP_URL,
    SESSION_SECRET: process.env.SESSION_SECRET
}

var routes = require('./routes/index');
var claims = require('./routes/claims');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Cookie parsing needed for sessions
app.use(cookieParser(config.COOKIE_PARSER_SECRET));

// Session framework
app.use(session({ secret: config.SESSION_SECRET }));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


passport.use('passport-wsfed-saml2', new wsfedsaml2({
    // ADFS RP identifier
    realm: config.APP_REALM,
    identityProviderUrl: config.IDP_URL,
    // ADFS token signing certificate
    thumbprint: config.CERT_THUMBRPINT
}, function (profile, done) {

    done(null, profile);
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(passport.initialize());   // passport initialize middleware
app.use(passport.session());      // passport session middleware 

app.use('/', routes);
app.use('/claims', claims);
app.use('/admin', admin);
app.get('/login',
    passport.authenticate('passport-wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
    function (req, res) {
        res.redirect('/');
    }
);

app.post('/login/callback',
    passport.authenticate('passport-wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
    function (req, res) {
        res.redirect('/');
    }
);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3030);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
