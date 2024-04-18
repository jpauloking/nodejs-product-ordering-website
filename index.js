const path = require('node:path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const homeRoutes = require('./routes/homeRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const accountRoutes = require('./routes/accountRoutes');
const orderRoutes = require('./routes/orderRoutes');
const verifyCurrentUser = require('./middlewares/verifyCurrentUser');
const verifyAuthenticated = require('./middlewares/verifyAuthenticated');

dotenv.config();

const port = process.env.PORT || 5000;
const serverUrl = process.env.SERVER_URL || 'http://127.0.0.1';

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('layout', path.join('layouts', 'main-layout'));
app.use(verifyCurrentUser);
app.use('/', homeRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/accounts', accountRoutes);
app.use('/orders', verifyAuthenticated, orderRoutes);

app.locals.verifyIsCurrentRoute = (route, currentRoute) => {
    return route === currentRoute ? "text-success" : "text-dark";
}

app.get('*', (req, res, next) => {
    const notFound = new Error();
    notFound.status = 404;
    notFound.message = "The resource you have requested for was not found.";
    next(notFound);
});

app.use((err, req, res, next) => {
    const errorPage = path.join('error');
    const data = {
        err
    };
    res.render(errorPage, data);
});

app.listen(port, () => {
    console.log(`Application running ${serverUrl}:${port}`);
});