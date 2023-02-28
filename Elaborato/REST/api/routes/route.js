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
    var query = "SELECT * FROM Corsa_Progressivo";
    
    db.query(query, (err, result, fields) => {
        if(err) {
            return res.status(500).json({
                Message: "Internal Server Error",
                Result: "Failed",
                Error: err,
            });
        }
        res.status(200).json({
            Message: 'Success',
            Result: result,
        });
    });
});

router.get('/:Id', (req, res, next) => {
    db.query("SELECT * FROM Corsa_Progressivo WHERE Corsa_Progressivo = ?", [
        req.params.Id,
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

router.delete('/:routeId', checkAdmin, (req, res, next) => {
    db.query("DELETE FROM Corsa_Progressivo WHERE Corsa_Progressivo = ?", [
        req.params.routeId,
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
            Id: req.params.routeId,
        });
    })
});

router.post('/', checkAdmin, (req, res, next) => {
    db.query("INSERT INTO Corsa_Progressivo(Corsa_Progressivo, Sigla_Corsa) VALUES (?, ?)", [
        req.body.Corsa_Progressiva,
        req.body.Sigla_Corsa,
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

router.post('/:cf', checkAuth, (req, res, next) => {
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
    if(req.body.date === undefined) {
        return res.status(400).json({
            Message: "Bad request",
        })
    }
    let MyDate = new Date();
    today = MyDate.getFullYear() + '/' 
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
            + ('0' + MyDate.getDate()).slice(-2);
    if(req.body.date == today) {
        db.query('SELECT Passaggio.Id_Fermata, Passaggio.Orario_Passaggio_Previsto, Passaggio.Id_Passaggio FROM Passaggio RIGHT JOIN Corsa_Progressivo ON Corsa_Progressivo.Corsa_Progressivo = Passaggio.Corsa_Progressivo WHERE Corsa_Progressivo.Annullata = 0 AND Passaggio.Orario_Passaggio_Previsto IS NOT NULL AND Passaggio.Orario_Passaggio_Previsto > ? ORDER BY `Orario_Passaggio_Previsto` ASC',
        [req.body.time], (err, result, fields) => {
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
    } else {
        db.query('SELECT Passaggio.Id_Fermata, Passaggio.Orario_Passaggio_Previsto, Passaggio.Id_Passaggio FROM Passaggio RIGHT JOIN Corsa_Progressivo ON Corsa_Progressivo.Corsa_Progressivo = Passaggio.Corsa_Progressivo WHERE Corsa_Progressivo.Annullata = 0 AND Passaggio.Orario_Passaggio_Previsto IS NOT NULL AND Passaggio.Orario_Passaggio_Previsto < ? ORDER BY `Orario_Passaggio_Previsto` ASC',
        [req.body.time], (err, result, fields) => {
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
    }
});

module.exports = router;