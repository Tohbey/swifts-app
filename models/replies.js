const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId;
const {likesSchema} = require('./likes')

const repliesSchema = new mongoose.Schema({
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
        minlenght:1,
        maxlenght:200
    },
    replies:[
        {
            userId:{
                type:objectId,
                required:true,
                index:true
            },
            replyId:{
                type:objectId,
                required:true,
                index:true
            },
            body:{
                type:String,
                required:true,
                minlenght:1,
                maxlenght:200
            },
            likes:[likesSchema]
        }
    ],
    likes:[likesSchema]
},{
    timestamps: true,
})

const Reply = mongoose.model('Reply',repliesSchema)

exports.Reply = Reply;
exports.repliesSchema = repliesSchema;