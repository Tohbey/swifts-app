const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId;


const tokenSchema = new mongoose.Schema({
    _userId: { 
        type: objectId, 
        required: true, 
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true 
    },
    expireAt: { 
        type: Date, 
        default: Date.now, 
        index: { expires: 864000 } 
    }
});

const Token = mongoose.model('Token',tokenSchema)

module.exports = Token 