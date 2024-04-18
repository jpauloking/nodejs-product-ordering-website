const verifyCurrentUser = require('./verifyCurrentUser');

module.exports = async function (req, res, next) {
    verifyCurrentUser(req, res, () => {
        if (!(res.locals.user)) {
            return next();
        } else {
            res.locals.error = "You are already logged in.";
            return res.redirect("/");
        }
    });
}