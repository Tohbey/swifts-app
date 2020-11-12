const moongoes = require('mongoose')

const postSchema = new moongoes.Schema({
    userId:{
        type:moongoes.Types.ObjectId,
        required:true
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
    numberOfComments:{
        type:Number,
        min:0,
    },
    likes:[
        {
           likeBy:{
            type:moongoes.Types.ObjectId  
           } 
        }
    ],
    comments:[
        {
            comment:{
                type:String,
                minlenght:5,
                maxlenght:300
            },
            commentBy:{
                type:moongoes.Types.ObjectId
            }
        }
    ],
})

const Post = moongoes.model('Post',postSchema)

exports.Post = Post;
exports.postSchema = postSchema;