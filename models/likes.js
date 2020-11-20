const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId;

const likesSchema = mongoose.Schema({
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

const Likes = mongoose.model('Likes',likesSchema)

exports.Likes = Likes;
exports.likesSchema = likesSchema;