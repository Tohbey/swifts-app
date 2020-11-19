const express = require('express')
const router = express.Router()
const User =  require('../models/user')
const bcrypt = require('bcrypt')
const _ = require('lodash');


router.post('/',async(req,res) => {
    const {email,password} = req.body
    if(!email || !password) return res.status(400).send({
        message:'Email or password missing'
    })

    let user = await User.findOne({email:email})
    if(!user) return res.status(400).send('Inavlid email or password')

    const validPassword = await bcrypt.compare(password,user.password)
    if(!validPassword) return res.status(400).send('Inavlid email or password')

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'email']));
})

module.exports = router