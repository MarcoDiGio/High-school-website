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

router.get('/', checkAdmin, (req, res, next) => {
    db.query("SELECT * FROM Prenotazione", (err, result) => {
        if(err) {
            return res.status(500).json({
                Message: "Error",
                Error: err,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

router.get('/:cf', checkAuth, (req, res, next) => {
    try {
        var token = req.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
        return res.status(401).json({
            Message: 'Auth failed'
        });
    }
    if(decoded.id != req.params.cf && decoded.id != 'admin') {
        return res.status(401).json({
            Message: "Action failed",
        });
    }
    
    db.query("SELECT * FROM Prenotazione WHERE Codice_Fiscale = ?", [ req.params.cf
    ], (err, result) => {
        if(err) {
            return res.status(500).json({
                Message: "Error",
                Error: err,
            })
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    })
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
    if(req.body.time === undefined || req.body.date === undefined) {
        return res.status(400).json({
            Message: "Bad request",
        });
    }
    let MyDate = new Date();
    let today = MyDate.getFullYear() + '/' 
                + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
                + ('0' + (MyDate.getDate())).slice(-2);
    let acceptedTime;
    let authorized;
    if(req.body.date == today) {
        acceptedTime = ('0' + (MyDate.getHours() + 1)).slice(-2) + ':' + ('0' + MyDate.getMinutes()).slice(-2);
        if(req.body.time < acceptedTime) {
            return res.status(400).json({
                Message: 'Bad Request, try refreshing the page',
            });
        }
    } else {
        acceptedTime = ('0' + MyDate.getHours()).slice(-2) + ':' + ('0' + MyDate.getMinutes()).slice(-2);
        if(req.body.time > acceptedTime) {
            return res.status(400).json({
                Message: 'Bad Request, try refreshing the page',
            });
        }
    }
    db.query('SELECT Id_Passaggio, Flag_Usufruito, Data FROM Prenotazione WHERE Codice_Fiscale = ?', 
    [ req.body.cf ], (error, result) => {
        if(error) {
            return res.status(500).json({
                Message: "Error",
                Error: error,
            });
        }
        
        for(let i=0; i<result.length; i++) {
            let formatted = formatDate(result[i].Data);
            if(result[i].Id_Passaggio == req.body.id_p && req.body.date == formatted) {
                authorized = false;
                return res.status(400).json({
                    Message: 'You already reserved this ride',
                });
            }
        }
        if(result.length == 0 || authorized === undefined) {
            db.query('INSERT INTO Prenotazione(QR_Code, Fermata_Salita, Fermata_Discesa, Data, Codice_Fiscale, Id_Passaggio) VALUES (?, ?, ?, ?, ?, ?)',
            [
                req.body.QR_Code,
                req.body.fs,
                req.body.fd,
                req.body.date,
                req.body.cf,
                req.body.id_p,
            ], (error, resultt) => {
                if(error) {
                    return res.status(500).json({
                        Message: "Error",
                        Error: error,
                    });
                }
                res.status(200).json({
                    Message: 'Success',
                })
            });
        }
    });
});

router.delete('/:cf', checkAuth, (req, res, next) => {
    if(req.body.time === undefined || req.body.date === undefined) {
        return res.status(400).json({
            Message: "Bad request",
        });
    }
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
    let MyDate = new Date();
    let acceptedTime = ('0' + (MyDate.getHours() + 2)).slice(-2) + ':' + ('0' + MyDate.getMinutes()).slice(-2) + ':' + '00';
    let today = MyDate.getFullYear() + '/' 
                + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
                + ('0' + MyDate.getDate()).slice(-2);
    MyDate.setDate(MyDate.getDate() + 1);
    let tomorrow = MyDate.getFullYear() + '/' 
                    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
                    + ('0' + (MyDate.getDate())).slice(-2);
    if(req.body.date == today) {
        db.query('SELECT Data FROM Prenotazione WHERE Data = ?', [req.body.date],
        (error, result, fields) => {
            if(error) {
                return res.status(500).json({
                    Message: "Error",
                    Error: error,
                });
            }
            let a = new Date(result[0].Data);
            let fdate = formatDate(a);
            let b = new Date(fdate);
            let c = new Date(today);
            let diff = b.getTime() - c.getTime();
            if(diff > 0 || (diff == 0 && acceptedTime < req.body.time)) {
                return res.status(401).json({
                    Message: 'You can\'t delete a reservation you already rode',
                });
            }
        });
        if(req.body.time < acceptedTime)
        {
            return res.status(401).json({
                Message: "Bad request. You can't delete a reservation 2 hours before the ride starts nor delete a reservation you already rode",
            });
        }
        db.query('DELETE Prenotazione FROM Prenotazione LEFT JOIN Passaggio ON Prenotazione.Id_Passaggio WHERE QR_Code = ?', 
        [req.body.QR_Code], (error, result, fields) => {
            if(error) {
                return res.status(500).json({
                    Message: "Error",
                    Error: error,
                });
            }
            return res.status(200).json({
                Message: "Success",
                Result: result,
            });
        })
    } else if (req.body.date == tomorrow){
        db.query('DELETE Prenotazione FROM Prenotazione LEFT JOIN Passaggio ON Prenotazione.Id_Passaggio WHERE QR_Code = ?', 
        [req.body.QR_Code], (error, result, fields) => {
            if(error) {
                return res.status(500).json({
                    Message: "Error",
                    Error: error,
                });
            }
            res.status(200).json({
                Message: "Success",
                Result: result,
            });
        })
    } else {
        return res.status(500).json({
            Message: "You can't delete a reservation you already rode",
        })
    }
});

router.get('/getTime/:id_p', checkAuth, (req, res, next) => {
    db.query('SELECT Passaggio.Orario_Passaggio_Previsto as Time FROM Passaggio WHERE Id_Passaggio = ?',
    [req.params.id_p],
    (error, result) => {
        if(error) {
            return res.status(500).json({
                Message: "Error",
                Error: error,
            });
        }
        res.status(200).json({
            Message: "Success",
            Result: result,
        });
    });
});

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