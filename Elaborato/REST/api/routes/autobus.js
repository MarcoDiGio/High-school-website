const express = require('express');
const router = express.Router();
const mysql = require('mysql');
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

router.get('/', (req, res, next) => {
    var query = "SELECT * FROM Autobus";
    
    db.query(query, (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        })
    });
});

router.get('/:autobusId', (req, res, next) => {
    db.query("SELECT * FROM Autobus WHERE Targa = ?", [
        req.params.autobusId,
    ], (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        })
    });
})

router.delete('/:autobusId', checkAdmin, (req, res, next) => {
    db.query("DELETE FROM Autobus WHERE Targa = ?", [
        req.params.autobusId,
    ] , (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Item Deleted",
            Id: req.params.autobusId,
        });
    })
});

router.post('/', checkAdmin, (req, res, next) => {
    db.query("INSERT INTO Autobus(Targa, N_Posti, Linea) VALUES (?, ?, ?)", [
        req.body.Targa,
        req.body.N_Posti,
        req.body.Linea,
    ], (err, result, fields) => {
        if(err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(201).json({
            Message: "Success",
            Result: result,
        });
    });
});

module.exports = router;