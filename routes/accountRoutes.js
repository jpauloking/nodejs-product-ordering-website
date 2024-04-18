const path = require('node:path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const verifyAuthenticated = require('../middlewares/verifyAuthenticated');
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');
const verifyUnauthenticated = require('../middlewares/verifyUnauthenticated');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', verifyIsAdmin, async (req, res, next) => {
    const accountsPage = path.join('pages', 'accounts', 'index');
    res.locals.currentRoute = "/accounts/index";
    const data = {
        accounts: []
    };
    try {
        const accounts = await prisma.account.findMany({
            select: {
                id: true,
                email: true,
                name: true
            }
        });
        data.accounts = [...accounts];
    } catch (error) {
        console.log(error.message);
    }
    res.render(accountsPage, data);
});

router.get('/create', verifyUnauthenticated, async (req, res, next) => {
    const createAccountPage = path.join('pages', 'accounts', 'create');
    res.locals.currentRoute = "/accounts/create";
    const data = {
        account: {}
    };
    res.render(createAccountPage, data);
});

router.post('/create', verifyUnauthenticated, async (req, res, next) => {
    const { email, name, password } = req.body;
    const confirmPassword = (req.body)['confirm-password'];
    const createAccountPage = path.join('pages', 'accounts', 'create');
    res.locals.currentRoute = "/accounts/create";
    const data = {};
    data.account = {
        email,
        name,
        password,
        confirmPassword
    }

    if (confirmPassword !== password) {
        res.locals.error = "Passwords do not match. Field password must match field confirm password";
        return res.render(createAccountPage, data);
    }

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const account = await prisma.account.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });

        const jwtSecret = process.env.JWT_SECRET;
        const authToken = jwt.sign(account.id, jwtSecret);
        res.cookie("auth_token", authToken, { maxAge: 900000, httpOnly: true });

        const accountPageRoute = `/accounts/${account.id}`;
        return res.redirect(accountPageRoute);
    } catch (error) {
        console.log(error.message);
    }
    return res.render(createAccountPage, data);
});

router.get('/login', verifyUnauthenticated, async (req, res, next) => {
    const loginPage = path.join('pages', 'accounts', 'login');
    res.locals.currentRoute = "/accounts/login";
    const returnUrl = req.query.returnUrl;
    const data = {
        returnUrl,
        account: {}
    };
    res.render(loginPage, data);
});

router.post('/login', verifyUnauthenticated, async (req, res, next) => {
    const { email, password } = req.body;
    const returnUrl = (req.body)['return-url'];
    const loginPage = path.join('pages', 'accounts', 'login');
    res.locals.currentRoute = "/accounts/login";
    const data = {
        returnUrl
    };
    data.account = {
        email,
        password,
    };
    try {
        const account = await prisma.account.findFirstOrThrow({
            where: {
                email
            }
        });
        if (account) {
            const isValidPassword = await bcrypt.compare(password, account.password);
            if (isValidPassword) {
                const jwtSecret = process.env.JWT_SECRET;
                const authToken = jwt.sign(account.id, jwtSecret);
                res.cookie("auth_token", authToken, { maxAge: 900000, httpOnly: true });
                if (returnUrl) {
                    const input = returnUrl;
                    const base = process.env.SERVER_URL || "http://127.0.0.1";
                    const returnRoute = new URL(input, base);
                    returnRoute.port = process.env.PORT || 5000;
                    if (returnRoute.hostname === base) {
                        return res.redirect(returnRoute);
                    } else {
                        const accountPageRoute = `/accounts/${account.id}`;
                        return res.redirect(accountPageRoute);
                    }
                } else {
                    const accountPageRoute = `/accounts/${account.id}`;
                    return res.redirect(accountPageRoute);
                }
            }
        }
        res.locals.error = "Login failed. Invalid credentials provided.";
    } catch (error) {
        console.log(error.message);
    }
    return res.render(loginPage, data);
});

router.get('/logout', verifyAuthenticated, async (req, res, next) => {
    const logoutPage = path.join('pages', 'accounts', 'logout');
    res.locals.currentRoute = "/accounts/logout";
    const { email } = res.locals.user;
    const data = {
        account: {
            email
        }
    };
    res.render(logoutPage, data);
});

router.post('/logout', verifyAuthenticated, async (req, res, next) => {
    const logoutPage = path.join('pages', 'accounts', 'logout');
    res.locals.currentRoute = "/accounts/logout";
    const { email } = res.locals.user;
    const data = {
        account: {
            email
        }
    };
    const authToken = req.cookies.auth_token;
    if (authToken) {
        res.cookie("auth_token", authToken, { maxAge: 1, httpOnly: true });
        return res.redirect('/accounts/login');
    }
    return res.render(logoutPage, data);
});

router.get('/:id', verifyAuthenticated, async (req, res, next) => {
    const { id } = req.params;
    const accoutPage = path.join('pages', 'accounts', 'show');
    res.locals.currentRoute = `/accounts/${id}`;
    const data = {
        account: {}
    };
    try {
        const account = await prisma.account.findFirstOrThrow({
            where: { id: { equals: parseInt(id) } },
            select: {
                id: true,
                email: true,
                name: true,
                orders: {
                    select: {
                        product: {
                            select: {
                                name: true
                            }
                        },
                        quantity: true,
                        amount: true
                    }
                }
            }
        });
        data.account = account;
    } catch (error) {
        console.log(error.message);
    }
    res.render(accoutPage, data);
});

module.exports = router;