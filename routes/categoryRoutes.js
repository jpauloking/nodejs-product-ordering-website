const path = require('node:path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/search/:searchTerm', async (req, res, next) => {
    const categoriesPage = path.join('pages', 'categories', 'index');
    res.locals.currentRoute = "/categories"
    const data = {
        categories: []
    };
    let { searchTerm } = req.params;
    try {
        const categories = await prisma.category.findMany({
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
        data.categories = [...categories];
    } catch (error) {
        console.log(error.message);
    }
    res.render(categoriesPage, data);
});

router.get('/:id', async (req, res, next) => {
    const categoryPage = path.join('pages', 'categories', 'show');
    res.locals.currentRoute = "/categories"
    const data = {
        category: null
    };
    let { id } = req.params;
    id = parseInt(id);
    try {
        const category = await prisma.category.findFirstOrThrow({
            where: { id },
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
        data.category = category;
    } catch (error) {
        console.log(error.message);
    }
    res.render(categoryPage, data);
});

router.get('/', async (req, res, next) => {
    const categoriesPage = path.join('pages', 'categories', 'index');
    res.locals.currentRoute = "/categories"
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
    res.render(categoriesPage, data);
});

module.exports = router;