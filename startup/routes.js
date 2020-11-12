const express = require('express')
const users = require('../controller/users')
const post = require('../controller/posts')


module.exports = function(app){
    app.use(express.json());
    app.use('/users',users);
    app.use('/posts',post)
}