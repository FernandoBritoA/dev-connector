const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post(
  '/',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password'); //auth middleware

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/posts
// @desc   Get all post
// @access Private
router.get('/', [auth], async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //date: -1; the most recent first
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private
router.get('/:id', [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access Private
router.delete('/:id', [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //Check user (only post author can delete it)
    console.log('post.user', post.user);
    console.log('req.user.id', req.user.id);
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private
router.put('/like/:id', [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by the user
    //loop through the array of post.likes to see if anyone matches
    //the req.user.id (current logged in user)
    //if length is greater than 0, its already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    //else, add to the array the current logged in user id
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private
router.put('/unlike/:id', [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by the user
    //loop through the array of post.likes to see if anyone matches
    //the req.user.id (current logged in user)
    //if length is EQUAL to 0, it hasnt been liked, therefor you cant unlike
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }
    //Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    //create a new array with the users id that liked the post
    //get the index that matches to the logged in user (req.user.id)
    //remove that item in the original post.likes array
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/posts/comment/:id
// @desc   Comment on a post
// @access Private
router.post(
  '/comment/:id',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password'); //auth middleware
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      //push newest first
      post.comments.unshift(newComment);
      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete a comment
// @access Private
router.delete('/comment/:id/:comment_id', [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Pull out a comment ; .
    //find() returns the first element of the array that matches
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //Check user
    //if user id that commented the post equals logged in user id
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    //Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
