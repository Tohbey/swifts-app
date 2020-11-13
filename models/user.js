const mongoose = require('mongoose')
const {postSchema, Post} = require('./post');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET

const userSchema = new mongoose.Schema({
    surname:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    othernames:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    email:{
        type: String,
        unique:true,
        required: true,
        minlength: 10,
        maxlength: 255
    },
    username:{
        type: String,
        unique:true,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    phoneNumber:{
        type:String,
        required:true,
        maxlength:11,
        minlength:8
    },
    address:{
        type:String,
        required:true,
        maxlength:1024,
        minlength:5
    },
    password:{
        type:String,
        required:true,
        maxlength:1024,
        minlength:5
    },
    bio:{
        type:String,
        maxlength:500,
        minlength:10,
    },
    role:{
        type:String,
        enum:['Admin','User'],
        required:true
    },
    posts:[postSchema]
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign(
            {_id:this._id,email:this.email,role:this.role},
            jwtSecret
        )
    return token;
}


const User = mongoose.model('User', userSchema)

module.exports = User;