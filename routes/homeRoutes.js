const path = require('node:path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
    const homePage = path.join('pages', 'home', 'index');
    res.locals.currentRoute = "/";
    const data = {
        categories: []
    };
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                shortDescription: true,
                imageUrl: true,
                products: {
                    select: {
                        id: true,
                        name: true,
                        shortDescription: true,
                        unitPrice: true,
                        imageUrl: true
                    }
                }
            }
        });
        data.categories = [...categories];
    } catch (error) {
        console.log(error.message);
    }
    res.render(homePage, data);
});

module.exports = router;