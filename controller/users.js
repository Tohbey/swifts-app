const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const User = require('../models/user')
const _ = require('lodash');
const winston = require('winston');
const { Post } = require('../models/post');
const validateObjectId = require('../middleware/validateObjectId')
const validateObjectUserId = require('../middleware/validateObjectUserId')
const user = require('../middleware/user')
const authorization = require('../middleware/auth')
const admin = require('../middleware/admin')

//api-end Points
//  1. /users               get,post,delete,put
//  2. /users/post/:id      post,get

//admin
router.get('',async(req,res) => {
    const users = await User.find();
    res.status(200).json(users)
})

//users
router.get('/:id',[validateObjectId,authorization,user],async(req,res) => {
    const id = req.params.id;

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
        'address','phoneNumber','bio','username','role'
    ]))

    user.password = await bcrypt.hash(user.password,salt);

    try{
        user = await user.save()
        winston.info('User saved')
        
        const token = user.generateAuthToken()
        res.header('x-auth-token',token).send(_.pick(user,['username','email']))
    }catch(err){
        res.status(400).send(err.errors)
        console.log("Saving users in users.js "+err.errors)
    }  
})

router.delete('/:id',[validateObjectId,authorization,user],async(req,res) => {
    const id = req.params.id;

    let user = await User.findByIdAndDelete(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    let posts = user.posts
    await posts.forEach( post => {
        Post.findByIdAndDelete(post._id)
    });

    res.status(200).send("User with has been deleted")
})

router.put('/:id',[validateObjectId,authorization,user],async(req,res) => {
    const id = req.params.id;
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
router.get('/post/:id',[validateObjectId,authorization,user],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let posts = user.posts;

    res.send(posts)
})

router.post('/post/:id',[validateObjectId,authorization,user],async(req,res) => {
    const id = req.params.id;    
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

router.delete('/post/:id/:userId',[validateObjectId,validateObjectUserId,authorization,user],async(req,res) => {
    const postId = req.params.id;

    const userId = req.params.userId;
    let user = await User.findById(userId);
    if(!user) return res.status(400).send('User doesnt not exist')

    let posts = user.posts;
    console.log('Old posts ', posts)
    let newPosts = posts.filter(x => String(x._id) != String(postId))
    console.log('new Posts: ',newPosts)
    
    user = await User.findByIdAndUpdate(user._id,{posts:newPosts})
    await Post.findByIdAndDelete(postId)

    res.status(200).send(user)
})


//user/followers
router.get('/:id/followers',[validateObjectId],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let followers = user.followers;
    console.log('followers - ',followers)

    res.status(200).send(followers)
})

//user/following
router.get('/:id/following',[validateObjectId],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let following = user.following;
    console.log('followering - ',following)

    res.status(200).send(following)
})


//user/follow
router.get('/:id/follow/:userId',[validateObjectId,validateObjectUserId],async(req,res) => {
    const id = req.params.id;
    let userFollowing = await User.findById(id);
    if(!userFollowing) return res.status(400).send('User doesnt not exist')
    
    const userId = req.params.userId;
    let userFollower = await User.findById(userId);
    if(!userFollower) return res.status(400).send('User doesnt not exist')

    let following = userFollowing.following
    let index = following.findIndex((x) => String(x.id) === String(userId))
    if(index >= 0) return res.status(400).send('you are already following him')

    followers = userFollower.followers
    followers.push(id)
    console.log('Followers - ',followers)
    console.log('user follower', userFollower)
    userfollower = await User.findByIdAndUpdate(userId,{followers:followers})


    following.push(userId)
    console.log('following - ',following)
    console.log('user follower', userFollowing)
    userFollowing = await User.findByIdAndUpdate(userId,{following:following})

    res.status(200).send('You have followed ',userFollowing.username)
})
module.exports = router