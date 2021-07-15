const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
//bring models
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// @route  POST api/posts
// @desc   post a new post
// @access Private
router.post(
  "/",
  [auth, [body("text", "Text is required!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //400 bad request
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route  GET api/posts
// @desc   get all posts
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({
      //most recent first
      date: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route  GET api/posts/:id
// @desc   get post by ID
// @access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found!" });
    }
    res.status(500).send("Server error!");
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }

    //check user
    //trzeba dac toString bo sie nie porownajo!
    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "User not authorized!" });
    }
    await post.remove();
    res.json({ msg: "Post deleted!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route  GET api/posts/:id
// @desc   get post by ID
// @access Private
// router.get("/:id", auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({ msg: "Post not found!" });
//     }

//     res.json(post);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === "ObjectId") {
//       return res.status(404).json({ msg: "Post not found!" });
//     }
//     res.status(500).send("Server error!");
//   }
// });

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked!" });
    }
    // unshift Adds new elements to the beginning of an array, and returns the new length
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked!" });
    }

    //get remove like index
    const removeIndex = post.likes.map((like) =>
      like.user.toString().indexOf(req.user.id)
    );
    //SPLICE Adds/Removes elements from an array
    post.likes.splice(removeIndex, 1);

    await post.save();
    // powinien zwrocic tablice like'ow
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route  POST api/posts/comment/:id
// @desc   comment a post
// @access Private
router.post(
  "/comment/:id",
  [auth, [body("text", "Text is required!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //400 bad request
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      };
      //add at beginning
      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment
// @access Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // pull comment id from post
    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure that comment exists
    if (!comment) {
      return res.status(400).json({
        msg: "Comment does not exist!",
      });
    }

    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({
        msg: "User not authorised!",
      });
    }

    //get remove comment index
    const removeIndex = post.comments.map((comment) =>
      comment.user.toString().indexOf(req.user.id)
    );
    //SPLICE Adds/Removes elements from an array
    post.comments.splice(removeIndex, 1);

    await post.save();
    // powinien zwrocic tablice comment'ow
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});
module.exports = router;
