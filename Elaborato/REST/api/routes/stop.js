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
})

router.get('/', (req, res, next) => {
    var query = "SELECT * FROM Fermata";
    
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

router.get('/:stopId', (req, res, next) => {
    db.query("SELECT * FROM Fermata WHERE Id_Fermata = ?", [
        req.params.stopId,
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

router.get('/greaterStopId/:stopId', (req, res, next) => {
    db.query("SELECT * FROM Fermata WHERE Id_Fermata >= ?", [
        req.params.stopId,
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
        });
    });
}) 

router.post('/', checkAdmin, (req, res, next) => {
    db.query("INSERT INTO Fermata(Id_Fermata, Nome_Fermata) VALUES (?, ?)", [
        req.body.Id_Fermata,
        req.body.Nome_Fermata,
    ], (err, result, fields) => {
        if(err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

router.post('/:id', (req, res, next) => {
    db.query("SELECT * FROM Fermata RIGHT JOIN Passaggio ON Fermata.Id_Fermata = Passaggio.Id_Fermata WHERE Passaggio.Id_Passaggio = ?",
    [req.params.id], (err, result, fields) => {
        if(err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

router.get('/scope/count', (req, res, next) => {
    db.query('SELECT COUNT(Id_Fermata) as COUNT FROM Fermata', 
    (err, result, fields) => {
        if(err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal Server Error",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
})

module.exports = router;