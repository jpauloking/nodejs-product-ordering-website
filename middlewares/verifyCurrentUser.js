const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
    const authToken = req.cookies.auth_token;

    if (authToken) {
        const jwtSecret = process.env.JWT_SECRET;
        const id = jwt.decode(authToken, jwtSecret);
        try {
            res.locals.user = await prisma.account.findFirstOrThrow({
                where: {
                    id: {
                        equals: parseInt(id)
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
        return next();
    } else {
        res.locals.user = null;
        return next();
    }

}