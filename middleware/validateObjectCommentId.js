const mongoose = require('mongoose')

module.exports = function validateId(req,res,next){
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId))
    return res.status(404).send('Invalid ID.');
  
    next();
}