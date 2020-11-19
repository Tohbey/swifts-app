//testing
module.exports = function (req,res,next) {
    const isDisabled = req.user.isDisabled
    if(isDisabled) return res.status(403).send('User isDisabled')

    next()
}

