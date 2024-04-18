const path = require('node:path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { log } = require('node:console');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/search/:searchTerm', async (req, res, next) => {
    const productsPage = path.join('pages', 'products', 'index');
    res.locals.currentRoute = "/products";
    const data = {
        products: []
    };
    let { searchTerm } = req.params;
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: {
                    name: {
                        contains: searchTerm
                    },
                    shortDescription: {
                        contains: searchTerm
                    },
                    longDescription: {
                        contains: searchTerm
                    },
                }
            },
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
        data.products = [...products];
    } catch (error) {
        console.log(error.message);
    }
    res.render(productsPage, data);
});

router.get('/:id', async (req, res, next) => {
    const productPage = path.join('pages', 'products', 'show');
    res.locals.currentRoute = "/products";
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
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        data.product = product;
    } catch (error) {
        console.log(error.message);
    }
    res.render(productPage, data);
});

router.get('/', async (req, res, next) => {
    const productsPage = path.join('pages', 'products', 'index');
    res.locals.currentRoute = "/products";
    const data = {
        products: []
    };
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                shortDescription: true,
                unitPrice: true,
                imageUrl: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        data.products = [...products];
    } catch (error) {
        console.log(error.message);
    }
    res.render(productsPage, data);
});

module.exports = router;