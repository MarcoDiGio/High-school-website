const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const checkAdmin = require('../middleware/check-admin');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');

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
})

router.get('/', (req, res, next) => {
    db.query("SELECT * FROM Passaggio", 
    (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

router.get('/:id', (req, res, next) => {
    db.query("SELECT * FROM Passaggio WHERE Id_Passaggio = ?",
    [req.params.id], (err, result) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        })
    });
});

router.post('/getRoute/:cf', checkAuth, (req, res, next) => {
    try {
        var token = req.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
        return res.status(401).json({
            Message: 'Auth failed'
        });
    }
    if(decoded.id != req.params.cf) {
        return res.status(401).json({
            Message: "Action failed",
        });
    }

    db.query('SELECT Id_Passaggio, N_Posti_Disponibili, Corsa_Progressivo, Orario_Passaggio_Previsto, Orario_Passaggio_Reale FROM Passaggio WHERE Id_Passaggio = ?',
    [req.body.id_p],
    (err, result) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        })
    })
})

router.post('/:cf', checkAdmin, (req, res, next) => {
    try {
        var token = req.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
        return res.status(401).json({
            Message: 'Auth failed'
        });
    }
    if(decoded.id != req.params.cf) {
        return res.status(401).json({
            Message: "Action failed",
        });
    }
    db.query('INSERT INTO Passaggio(Id_Passaggio, Orario_Passaggio_Previsto, N_Posti_Disponibili, Id_Fermata, Corsa_Progressivo) VALUES (?, ?, ?, ?, ?)',
    [req.body.pass, req.body.time, req.body.places, req.body.stopId, req.body.progr], 
    (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    try {
        var token = req.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
        return res.status(401).json({
            Message: 'Auth failed'
        });
    }
    id = decoded.id;
    db.query('SELECT * FROM Passaggio WHERE QR_Code = ?',
    req.body.QR_Code, 
    (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

module.exports = router;