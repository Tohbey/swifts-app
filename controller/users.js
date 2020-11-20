const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const User = require('../models/user')
const _ = require('lodash');
const winston = require('winston');
const { Post } = require('../models/post');
const Token = require('../models/token')
const validateObjectId = require('../middleware/validateObjectId')
const validateObjectUserId = require('../middleware/validateObjectUserId')
const user = require('../middleware/user')
const authorization = require('../middleware/auth')
const admin = require('../middleware/admin')
const isDisable = require('../middleware/isDisabled')
const status = require('../middleware/status')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const dotenv = require('dotenv').config();

const email  = process.env.email
const password = process.env.password

//@desc     getting all users
//router    GET /
router.get('',async(req,res) => {
    const users = await User.find();
    res.status(200).json(users)
})

//@desc     getting user by id
//router    GET /:id
router.get('/:id',[validateObjectId,user,authorization,status],async(req,res) => {
    const id = req.params.id;

    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    let status = user.status;
    if(status === 'Pending') return res.status(400).send('Verify your email address')

    res.send(user);
})

//@desc     creating user
//router    POST /
router.post('',async(req,res) => {
    let user = await User.findOne({email:req.body.email})
    if(user) return res.status(400).send('Email already exist')

    user = await User.findOne({username:req.body.username})
    if(user) return res.status(400).send('username already exist')

    const salt = await bcrypt.genSalt(10)

    user = new User(_.pick(req.body,[
        'firstName','lastName','email','password',
        'address','phoneNumber','bio','username','role'
    ]))

    user.password = await bcrypt.hash(user.password,salt);

    //generating user token
    let tokenUser = new Token({_userId:user._id,token:crypto.randomBytes(16).toString('hex')})
    console.log(tokenUser)

    //configuring email send
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:email,
            pass:password
        }
    });

    //configuring the email message
    let mailOptions = {
        from:'The Swift App',
        to: user.email,
        subject:'User verification',
        text:'Your verification code '+tokenUser.token
    };

    //sending the message after saving the user
    
    try{
        user = await user.save()
        winston.info('User saved')
        
        await tokenUser.save()
        await transporter.sendMail(mailOptions)

        const token = user.generateAuthToken()
        res.header('x-auth-token',token).send({
            email:user.email,
            username:user.username,
            msg:'verification email has been sent to your email'
        })
    }catch(err){
        res.status(400).send(err.errors)
        console.log("Saving users in users.js "+err.errors)
    }  
})

//@desc     disabling user
//router    GET /disabling/:id
router.get('/Disabling/:id',[validateObjectId,admin,authorization,status],async(req,res) => {
    const id = req.params.id;

    let user = await User.findByIdAndDelete(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    await user.findByIdAndUpdate(id,{isDisable:true})

    res.status(200).send("User with has been disabled")
})

//@desc     updating user
//router    PUT /:id
router.put('/:id',[validateObjectId,isDisable,status,user],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')

    const salt = await bcrypt.genSalt(10)

    user.set(_.pick(req.body,[
        'surname','othernames','email','password',
        'address','phoneNumber','bio','username'
    ]))

    user.password = await bcrypt.hash(user.password,salt);

    try{
        user = await user.save()
        res.send(user)
    }catch(err){
        res.status(400).send(err.errors)
    }
})

//@desc     getting user's posts
//router    GET /posts/id
router.get('/posts/:id',[validateObjectId,isDisable,user,authorization,status,isDisable],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let posts = user.posts;

    res.send(posts)
})

//@desc     posting a post
//router    POST /post
router.post('/posts',[validateObjectId,isDisable,user,isDisable,status,authorization],async(req,res) => {
    // const id = req.params.id;   
    const id = req.user._id;   
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


//@desc     deleting a user's post
//router    DELET /posts/:id
router.delete('/posts/:id',[validateObjectId,validateObjectUserId,isDisable,user,authorization],async(req,res) => {
    const postId = req.params.id;

    const userId = req.user._id;
    let user = await User.findById(userId);
    if(!user) return res.status(400).send('User doesnt not exist')

    let posts = user.posts;
    console.log('Old posts ', posts)

    let index = posts.findIndex(x => String(x._id) === String(postId))
    if(index < 0) return res.status.send('not user post')
    
    let newPosts = posts.filter(x => String(x._id) != String(postId))
    console.log('new Posts: ',newPosts)
    
    user = await User.findByIdAndUpdate(user._id,{posts:newPosts})
    await Post.findByIdAndDelete(postId)

    res.status(200).send(user)
})

//@desc     getting a user's followers
//router    GET /:id/followers
router.get('/:id/followers',[validateObjectId,authorization,user,isDisable,status],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let followers = user.followers;
    console.log('followers - ',followers)

    res.status(200).send(followers)
})

//@desc     getting a user's followering
//router    GET /:id/followering
router.get('/:id/following',[validateObjectId,authorization,user,isDisable,status],async(req,res) => {
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user) return res.status(400).send('User doesnt not exist')
    
    let following = user.following;
    console.log('followering - ',following)

    res.status(200).send(following)
})

//@desc     following a user's
//router    GET /:id/follow/:userId
router.get('/:id/follow/:userId',[validateObjectId,validateObjectUserId,authorization,user,isDisable,status],async(req,res) => {
    const id = req.params.id;
    let userFollowing = await User.findById(id);
    if(!userFollowing) return res.status(400).send('User doesnt not exist')
    
    const userId = req.params.userId;
    let userFollower = await User.findById(userId);
    if(!userFollower) return res.status(400).send('User doesnt not exist')
    let followers = userFollower.followers

    let following = userFollowing.following
    let index = following.findIndex((x) => String(x.id) === String(userId))
    if(index >= 0) return res.status(400).send('you are already following this user')

    let follower = ({
        followerId: id
    })
    followers.push(follower)
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