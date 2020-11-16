const express = require('express');
const mongoose  = require('mongoose');
const router = express.Router();
const {Post} = require('../models/post');
const validateObjectId = require('../middleware/validateObjectId');
const User = require('../models/user');
const user = require('../middleware/user')
const authorization = require('../middleware/auth');
const validateObjectUserId = require('../middleware/validateObjectUserId');


//apis
//1. get post 
//2. get post by id
//3  like post
//4  comment on post
router.get('',async(req,res) => {
    const posts = await Post.find();
    res.status(200).json(posts)
})

router.get('/:id',[validateObjectId],async(req,res) => {
    const id = req.params.id;
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    res.send(post);
})

router.get('/:id/likes/:userId',[validateObjectId,validateObjectUserId,authorization,user],async(req,res) => {
    const userId = req.params.userId

    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    let likeByUser = User.findById(userId)
    if(!likeByUser) return res.status(400).send('user doesnt exist')
    
    // check if user has liked the post before
    let likes = post.likes
    console.log('liked by users',likes)
    const Likeindex = likes.findIndex(x => String(x._id) === String(userId))
    console.log('user index in Likes array',Likeindex)
    likes.splice(Likeindex,1)
    if(Likeindex >= 0) return res.status(200).send('You have unliked this post before')
    
    post.likes.push(userId);
    post.numberOfLikes = post.likes.length;
    post.numberOfComments = post.comments.length;
    console.log('post-detail',post)


    let user = await User.findById(post.userId);
    let posts = user.posts

    const index = posts.findIndex(x => String(x._id) === String(post._id))
    console.log('Post index in the users post array',index)
    posts[index].set(post)
    console.log(posts)
    await User.findByIdAndUpdate(user._id,{posts:posts})
    
    await post.save()
    res.send(post)
})

router.get('/:id/comments/:userId',[validateObjectId,validateObjectUserId,authorization,user],async(req,res) => {
    
    const userId = req.params.userId

    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    let likeByUser = User.findById(userId)
    if(!likeByUser) return res.status(400).send('user doesnt exist')

    let comment = ({
        comment:req.body.comment,
        commentBy:userId
    })
    console.log('Updated post ',comment)

    post.comments.push(comment);
    post.numberOfComments = post.comments.length;
    post.numberOfLikes = post.likes.length;
    
    console.log('Updated post ',post)

    let user = await User.findById(post.userId);
    let posts = user.posts
    const index = posts.findIndex(x => String(x._id) === String(post._id))
    console.log('Post index in the users post array',index)
    posts[index].set(post)
    console.log(posts)
    await User.findByIdAndUpdate(user._id,{posts:posts})
    
    await post.save()
    res.send(post)
})

module.exports = router