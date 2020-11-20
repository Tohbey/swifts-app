const express = require('express')
const users = require('../controller/users')
const post = require('../controller/posts')
const auth = require('../controller/auth')
const verifying = require('../controller/verifying')

module.exports = function(app){
    app.use(express.json());
    app.use('/users',users);
    app.use('/posts',post);
    app.use('/login',auth);
    app.use('/verify',verifying);
}