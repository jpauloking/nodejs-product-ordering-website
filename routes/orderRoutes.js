const path = require('node:path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
    const ordersPage = path.join('pages', 'orders', 'index');
    res.locals.currentRoute = "/orders";
    const data = {
        orders: []
    };
    try {
        const orders = await prisma.order.findMany({
            select: {
                account: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    }
                },
                product: {
                    select: {
                        name: true
                    }
                },
                quantity: true,
                amount: true
            }
        });
        data.orders = orders;
    } catch (error) {
        console.log(error.message);
    }
    res.render(ordersPage, data);
});

router.get('/:id', async (req, res, next) => {
    const orderPage = path.join('pages', 'products', 'order');
    res.locals.currentRoute = "/orders";
    const data = {
        product: null
    };
    let { id } = req.params;
    id = parseInt(id);
    try {
        const product = await prisma.product.findFirstOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                shortDescription: true,
                unitPrice: true,
                imageUrl: true,
            }
        });
        data.product = product;
        data.quantity = 1;
        data.amount = product.unitPrice;
    } catch (error) {
        console.log(error.message);
    }
    res.render(orderPage, data);
});

router.post('/', async (req, res, next) => {
    const { name, email } = req.body;
    let { id, quantity, amount } = req.body;
    const orderPage = path.join('pages', 'products', 'order');
    res.locals.currentRoute = "/orders";
    const data = {
        id,
        name,
        email,
        quantity,
        amount
    };
    id = parseInt(id);
    quantity = parseFloat(quantity);
    try {
        const product = await prisma.product.findFirstOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                shortDescription: true,
                unitPrice: true,
                imageUrl: true,
            }
        });
        data.product = product;
        amount = quantity * product.unitPrice;
        const order = await prisma.order.create({
            data: {
                accountId: res.locals.user.id,
                productId: product.id,
                quantity,
                amount
            }
        });
        return res.redirect(`/accounts/${res.locals.user.id}`);
    } catch (error) {
        console.log(error.message);
    }
    res.render(orderPage, data);
});

module.exports = router;