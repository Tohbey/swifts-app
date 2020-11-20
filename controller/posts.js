const express = require('express');
const router = express.Router();
const {Post} = require('../models/post');
const User = require('../models/user');
const {Comment} = require('../models/comments')
const {Likes} = require('../models/likes')
const validateObjectId = require('../middleware/validateObjectId')
const validateObjectUserId = require('../middleware/validateObjectUserId')
const validateObjectCommentId = require('../middleware/validateObjectCommentId')
const user = require('../middleware/user')
const authorization = require('../middleware/auth')
const admin = require('../middleware/admin')
const isDisable = require('../middleware/isDisabled')
const status = require('../middleware/status')

//@desc     getting all posts
//router    GET /
router.get('',async(req,res) => {
    const posts = await Post.find();
    res.status(200).json(posts)
})

//@desc     getting post by id
//router    GET /
router.get('/:id',[validateObjectId],async(req,res) => {
    const id = req.params.id;
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    res.send(post);
})

//@desc     posting likes post
//router    POST /:id/likes
router.post('/:id/likes',[validateObjectId,authorization,user,isDisable,status],async(req,res) => {
    const userId = req.user._id

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
    // likes.splice(Likeindex,1)
    if(Likeindex >= 0) return res.status(200).send('You have unliked this post before')

    let like = new Likes({
        userId:userId,
        source:'post',
        sourceId:id,
        reaction:req.body.reaction
    })
    console.log(like)
    await like.save()
    post.likes.push(like);
    post.numberOfLikes = post.likes.length;
    post.numberOfComments = post.comments.length;

    console.log('post-detail',post)

    let user = await User.findById(post.userId);
    let posts = user.posts
    const index = posts.findIndex(x => String(x._id) === String(post._id))
    console.log('Post index in the users post array ',index)
    posts[index].set(post)
    console.log(posts)
    await User.findByIdAndUpdate(user._id,{posts:posts})
    
    await post.save()
    res.send(post)
})

//@desc     posting comment on post
//router    POST /:id/comments
router.post('/:id/comments',[validateObjectId,authorization,user,isDisable,status],async(req,res) => {
    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    const userId = req.user._id
    let likeByUser = User.findById(userId)
    if(!likeByUser) return res.status(400).send('user doesnt exist')

    let comment = new Comment({
        body:req.body.body,
        postId:id,
        userId:userId,
    })
    
    console.log('Updated post ',comment)
    await comment.save()

    post.comments.push(comment);
    post.numberOfComments = post.comments.length;
    post.numberOfLikes = post.likes.length;
    console.log('Updated post ',post)

    let user = await User.findById(post.userId);
    let posts = user.posts
    const index = posts.findIndex(x => String(x._id) === String(post._id))
    console.log('Post index in the users post array',index)
    posts[index].comments.push(comment)
    console.log(posts)
    await User.findByIdAndUpdate(user._id,{posts:posts})
    
    await post.save()
    res.send(post)
})

//@desc     getting comments on post
//router    GET /:id/comments
router.get('/:id/comments',[validateObjectId], async(req,res) => {
    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    let comments = post.comments;
    
    res.send({comments,numberOfComments:comments.length})
})

//@desc     deleting comments on post
//router    DELETE /:id/comments/:commentId
router.delete('/:id/comments/:commentId',[validateObjectId,authorization,user,isDisable,status], async(req,res) => {

    //getting the user's id that is sending the request
    const userId = req.user._id

    //returing comments in post
    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')
    let comments = post.comments;
    console.log('returned comments from post ',comments)

    //find the comment by commentId
    let commentId = req.params.commentId
    let comment = await Comment.findById(commentId)
    if(!comment) return res.status(400).send('Comment doesnt exist')
    
    //checking if it's the user that posted the comment
    if(String(userId) !== String(comment.userId)) return res.status(400).send('you are unable to delete this comment')
    
    //finding user and returing their comments
    let user = await User.findById(comment.userId)
    let userComments = user.comments
    console.log('Users comments ',userComments)
    
    //removing comment
    await Comment.findByIdAndDelete(commentId)
    
    //removing comment from post
    comments = comments.filter(x => String(x._id) === String(commentId))
    console.log('Updated comments ',comments)
    post = await Post.findByIdAndUpdate(id,{comments:comments,numberOfComments:comments.length})
    
    //removing comment from user
    userComments = userComments.filter(x => String(x._id) === String(commentId))
    console.log('users updated comments ',comments)
    await User.findByIdAndUpdate(commentId,{comments:userComments})
    
    res.send(post)
})

//@desc     getting likes on post
//router    GET /:id/likes
router.get('/:id/likes',[validateObjectId], async(req,res) => {
    const id = req.params.id
    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    let likes = post.likes;
    
    res.send({likes,numberOfLikes:likes.length})
})


module.exports = router