const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
    res.locals.returnUrl = req.originalUrl;
    const authToken = req.cookies.auth_token;

    if (authToken) {
        const jwtSecret = process.env.JWT_SECRET;
        const id = jwt.decode(authToken, jwtSecret);
        res.locals.user = await prisma.account.findFirstOrThrow({
            where: {
                id: {
                    equals: parseInt(id)
                }
            }
        });
        return next();
    }

    if (res.locals.returnUrl) {
        const input = '/accounts/login';
        const base = process.env.SERVER_URL || "127.0.0.1";
        const returnUrl = new URL(input, base);
        returnUrl.port = process.env.PORT || 5000;
        returnUrl.search = `?returnUrl=${res.locals.returnUrl}`;
        return res.redirect(returnUrl);
    } else {
        const loginRoute = "/accounts/login";
        return res.redirect(loginRoute)
    }

}