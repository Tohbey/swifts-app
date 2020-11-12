const express = require('express');
const mongoose  = require('mongoose');
const router = express.Router();
const {Post} = require('../models/post');

router.get('',async(req,res) => {
    const posts = await Post.find();
    res.status(200).json(posts)
})

router.get('/:id',async(req,res) => {
    const id = req.params.id;
    let isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) return res.status(400).send('Invalid id')

    let post = await Post.findById(id);
    if(!post) return res.status(400).send('Post doesnt exist')

    res.send(post);
})
module.exports = router