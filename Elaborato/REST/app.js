const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql');

const corsOptions = {
    origin: true,
    credentials: true,
}

app.options('*', cors(corsOptions));

const autobusRoutes = require('./api/routes/autobus');
const customerRoutes = require('./api/routes/customer');
const passageRoutes = require('./api/routes/passage');
const reservationRoutes = require('./api/routes/reservation');
const routeRoutes = require('./api/routes/route');
const stopRoutes = require('./api/routes/stop');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require('dotenv').config()

var con = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
});

con.connect(err => {
    if (err) {
        console.log(err);
    }
    console.log("Connected!");
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/autobus', autobusRoutes);

app.use('/customer', customerRoutes);

app.use('/reservation', reservationRoutes);

app.use('/passage', passageRoutes);

app.use('/route', routeRoutes);

app.use('/stop', stopRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            Message: error.message,
        }
    });
});

module.exports = app;