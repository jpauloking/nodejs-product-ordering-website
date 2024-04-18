const verifyAuthenticated = require("./verifyAuthenticated")

module.exports = async function (req, res, next) {
    verifyAuthenticated(req, res, () => {
        const ownerId = req.params.id;
        const user = res.locals.user;
        if (user.id === ownerId) {
            return next();
        } else {
            res.locals.error = `Unauthorized access. Please contact administration or login with an account which has higher clearence`;
            const error = new Error();
            error.message = res.locals.error;
            error.status = 403;
            return next(error);
        }
    });
}