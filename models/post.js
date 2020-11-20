const mongoose = require('mongoose')
const {commentSchema} = require('./comments')
const {likesSchema} = require('./likes')
const objectId = mongoose.Types.ObjectId;


const postSchema = new mongoose.Schema({
    userId:{
        type:objectId,
        required:true
    },
    title:{
        type:String,
        required:true,
        maxlength:1024,
        minlength:5
    },
    message:{
        type:String,
        required:true,
        maxlength:1024,
        minlength:5
    },
    numberOfLikes:{
        type:Number,
        min:0,
    },
    tags:[{
        type:String
    }],
    numberOfComments:{
        type:Number,
        min:0,
    },
    likes:[likesSchema],
    comments:[commentSchema],
},{
    timestamps:true,
})

const Post = mongoose.model('Post',postSchema)

exports.Post = Post;
exports.postSchema = postSchema;