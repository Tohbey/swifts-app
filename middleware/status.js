module.exports = function (req,res,next) {
    const status = req.user.status
    if(role !== "Verified") return res.status(403).send('Accountisnt verified')

    next()
}

