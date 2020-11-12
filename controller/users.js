const express = require('express')
const router = express.Router()
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const monogoose = require('mongoose')
const User = require('../models/user')
const _ = require('lodash');
const winston = require('winston');
const { Post } = require('../models/post');

//api-end Points
//  1. /users               get,post,delete,put
//  2. /users/post/:id      post,get

//users
router.get('',async(req,res) => {
    const users = await User.find();
    res.status(200).json(users)
})

router.get('/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = monogoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid Id')

    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    res.send(user);
})

router.post('',async(req,res) => {
    let user = await User.findOne({email:req.body.email})
    if(user) return res.status(400).send('Email already exist')

    user = await User.findOne({username:req.body.username})
    if(user) return res.status(400).send('username already exist')

    const salt = await bcrypt.genSalt(10)

    user = new User(_.pick(req.body,[
        'surname','othernames','email','password',
        'address','phoneNumber','bio','username'
    ]))

    user.password = await bcrypt.hash(user.password,salt);

    try{
        user = await user.save()
        winston.info('User saved')
        
        res.status(200).send(_.pick(user,['username','email']))
    }catch(err){
        res.status(400).send(err.errors)
        console.log("Saving users in users.js "+err.errors)
    }  
})

router.delete('/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = monogoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid Id')

    let user = await User.findByIdAndDelete(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    let posts = user.posts
    await posts.forEach( post => {
        Post.findByIdAndDelete(post._id)
    });

    res.status(200).send("User with has been deleted")
})

router.put('/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = monogoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid Id')

    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    user.set(_.pick(req.body,[
        'surname','othernames','email','password',
        'address','phoneNumber','bio','username'
    ]))

    try{
        user = await user.save()
        res.send(user)
    }catch(err){
        res.status(400).send(err.errors)
    }
})

//users/post
router.get('/post/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = monogoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid Id')
    
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let posts = user.posts;

    res.send(posts)
})

router.post('/post/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = monogoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid Id')
    
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let post = new Post({
        message: req.body.message
    })

    post.userId = user._id;
    console.log(user)
    console.log(post)

    try{
        user.posts.push(post)
        await user.save()

        await post.save()
        res.send(post)
    }catch(err){
        res.status(400).send(err.errors)
        console.log("Sending post in users.js "+err.errors)
    }

})

module.exports = router