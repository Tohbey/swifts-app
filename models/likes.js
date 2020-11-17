const moongoes = require('mongoose')
const objectId = moongoes.Types.ObjectId;

const likesSchema = moongoes.Schema({
    userId:{
        type:objectId,
        required:true,
        index:true
    },
    source:{
        type:String,
        enum:['post','comment','reply'],
        required:true
    },
    sourceId:{
        type:objectId,
        required:true,
        index:true,
    },
    reaction:{
        type:String,
        enum:['like','dislike'],
        required:true
    }
},{
    timestamps:true,
})

const Likes = moongoes.model('Likes',likesSchema)

exports.Likes = Likes;
exports.likesSchema = likesSchema;