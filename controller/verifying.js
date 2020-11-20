const express = require('express')
const router = express.Router()
const User =  require('../models/user')
const Token = require('../models/token')
const _ = require('lodash');
const crypto = require('crypto')
const nodemailer =require('nodemailer');
const { url } = require('inspector');
const dotenv = require('dotenv').config();

const email  = process.env.email
const password = process.env.password
const authorization = require('../middleware/auth')


//@desc     getting token sent to user for verification
//router    POST /
router.post('',[authorization],async(req,res) => {
    let token = req.body.token

    let retrivedToken = await Token.findOne({token:token})

    if(!retrivedToken) return res.status(400).send({
        msg:'Your verification link may have expored. Please click on resend to verify your email '+url('/verify/resendCode')
    })

    let user = await User.findByIdAndUpdate(retrivedToken._userId,{status:'Verified'})

    if(!user) return res.status(400).send({
        msg:'We were unable to find a user for this verification. Please SignUp!'
    })
    res.send(_.pick(user,['username','email','status']))    
})

router.post('/resendCode',async(req,res) => {

    let user = await User.findOne({email:req.body.email})

    if(!user) return res.status(400).send({mgs:'We were unable to find a user with that email. Make sure your Email is correct!'})

    if(user.status === 'Verified') return res.status(200).send('this accout has been already verified')

    let token = new Token({_userId:user._id,token:crypto.randomBytes(16).toString('hex')})
    
    token = await token.save()
    
    //configuring email send
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:email,
            pass:password
        }
    });

    //configuring the email message
    let mailOptions = {
        from:'The Swift App',
        to: user.email,
        subject:'User verification',
        text:'Your verification code '+token.token
    };
    
    //sending the message after saving the user
    await transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        }else{
            console.log('Email Sent '+info.response)
        }
    })    
})

module.exports = router