const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAdmin = require('../middleware/check-admin');

require('dotenv').config()

var db = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
});

db.connect(err => {
    if(err) {
        return console.log(err);
    }
    console.log("Connected");
});

router.get('/', checkAdmin, (req, res, next) => {
    db.query("SELECT * FROM Cliente", (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: 'Error',
                Error: err
            });
        } else {
            res.status(200).json({
                Result: result
            })
        }
    });
})

router.get('/notUsed', checkAdmin, (req, res, next) => {
    let MyDate = new Date();
    MyDate.setDate(MyDate.getDate() - 7);
    let oneweekago = MyDate.getFullYear() + '/' 
                    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
                    + ('0' + (MyDate.getDate())).slice(-2);
    formatDate(oneweekago);
    db.query('SELECT * FROM `Cliente` RIGHT JOIN Prenotazione ON Prenotazione.Codice_Fiscale = Cliente.Codice_Fiscale WHERE Flag_Usufruito = 0 AND Data > ?',
    [oneweekago],  
    (err, result) => {
        if(err) {
            return res.status(500).json({
                Message: 'Error',
                Error: err,
            });
        }
        res.status(200).json({
            Message: 'Success',
            Result: result,
        })
    })
}) 

router.post('/signup', (req, res, next) => {
    if(!validateEmail(req.body.mail)) {
        return res.status(500).json({
            Message: "Invalid mail",
        });
    }
    db.query("SELECT * FROM Cliente where Mail = ?", [req.body.mail], (err, result, fields) => {
        if(result.length >= 1) {
            return res.status(409).json({
                Message: "Mail exists",
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        Message: "Error",
                        Error: err,
                    });
                } else {
                    db.query("INSERT INTO Cliente(Codice_Fiscale, Nome, Cognome, Mail, Password) VALUES (?, ?, ?, ?, ?)", 
                    [req.body.cf, req.body.firstname, req.body.secondname, req.body.mail, hash],
                    (error, result) => {
                        if(err) {
                            return res.status(500).json({
                                Message: "Error",
                                Error: error,
                            });
                        } else {
                            res.status(201).json({
                                Message: "User created",
                            });
                        }
                    });
                }
            });
        }
    });
});

router.post('/login', (req, res, next) => {
    db.query("SELECT * FROM Cliente WHERE Mail = ?", [req.body.mail], (err, result) => {
        if(result.length < 1) {
            return res.status(401).json({
                Message: "Auth failed",
            });
        }
        if(err){
            return res.status(500).json({
                Message: "Error in the DB",
            })
        }
        bcrypt.compare(req.body.password, result[0].Password, (error, resultt) => {
            if(error) {
                return res.status(500).json({
                    Message: "Auth failed",
                });
            }
            if (resultt) {
                const token = jwt.sign({
                    email: result[0].Mail,
                    id: result[0].Codice_Fiscale,
                }, 
                process.env.JWT_KEY, 
                {
                    expiresIn: "1h",
                });
                return res.status(200).json({
                    Message: "Auth succesful",
                    token: token,
                });
            }
            res.status(401).json({
                Message: "Auth failed",
            })
        });
    });
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('/');
}

module.exports = router;