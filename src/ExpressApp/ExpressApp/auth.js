// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login')
}

function authorize(authString, req, res, next) {
    var fail = function () {
        res.redirect('/AccessDenied.html');
    };

    if (authString && authString.length > 0) {
        if (!req.user) {
            fail();
        }
        else if (req.user) {
            var roles = req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (roles && roles.length > 0) {
                var allowed = false;
                var allowedRoles = authString.split(',');
                for (var i = 0; i < allowedRoles.length; i++) {
                    for (var j = 0; j < roles.length; j++) {
                        if (allowedRoles[i] == roles[j]) {
                            return next();
                            break;
                        }
                    }
                }

                if (allowed == false) {
                    fail();
                }
            }
            else {
                fail();
            }
        }
    } // only do check if valid authString is passed.
}

module.exports = { authenticate: authenticate, authorize: authorize }