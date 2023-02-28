const { json } = require('express');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        if(decoded.id === 'admin') {
            next();
        } else {
            return res.status(404).json({
                Message: 'Auth failed',
            })
        }
    } catch (error) {
        res.status(401).json({
            Message: 'Auth failed',
        })
    }
};