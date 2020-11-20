const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId;
const {likesSchema} = require('./likes')
const {repliesSchema} = require('./replies')

const commentSchema = mongoose.Schema({
    userId:{
        type:objectId,
        required:true,
        index:true  
    },
    postId:{
        type:objectId,
        required:true,
        index:true
    },
    body:{
        type:String,
        required:true,
        minlenght:5,
        maxlenght:200
    },
    replied:{
        type:Boolean
    },
    replyCount:{
        type:Number,
        min:0
    },
    replies:[repliesSchema],
    likes:[likesSchema]
},{
    timestamps: true,
})

const Comment = mongoose.model('Comment',commentSchema)

exports.Comment = Comment;
exports.commentSchema = commentSchema;