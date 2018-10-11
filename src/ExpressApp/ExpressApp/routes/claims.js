'use strict';
var express = require('express');
var router = express.Router();
var a = require('../auth.js');

/* GET users listing. */
router.get('/', a.authenticate, function (req, res) {
    res.render('claims', {
        user: req.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: req.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        roles: req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ? req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : []
    });
});

module.exports = router;
