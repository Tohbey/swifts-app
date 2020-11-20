module.exports = function (req,res,next) {
    const status = req.user.status
    if(status === "Pending") return res.status(403).send('Account isnt verified')

    next()
}

