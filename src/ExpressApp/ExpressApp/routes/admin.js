'use strict';
var express = require('express');
var router = express.Router();
var a = require('../auth.js');

/* GET users listing. */
router.get('/', a.authenticate, function (req, res, next) {
    a.authorize('Admin', req, res, next);

    res.render('admin', {
        user: req.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: req.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    });
});


module.exports = router;
