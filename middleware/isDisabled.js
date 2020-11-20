module.exports = function (req,res,next) {
    const isDisable = req.user.isDisable
    if(isDisable) return res.status(403).send('User isDisabled')

    next()
}

