const express = require("express");
const { v4: uuid } = require("uuid");
const { db } = require("../mongo");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alanblog_photos',
    format: async (req, file) => 'png', // Convert files to PNG format
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

const upload = multer({ storage: storage });
const router = express.Router();

router.post("/create", upload.single('image'), async (req, res) => {
  try {
    const { title, content, username } = req.body;
    const imageUrl = req.file.path;

    const post = {
      id: uuid(),
      title: title,
      image: imageUrl,
      content: content,
      username: username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db().collection("posts").insertOne(post);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});



router.get("/all", async (req, res) => {
  try {
    const posts = await db().collection("posts").find().sort({ createdAt: -1 }).toArray();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving posts" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const post = await db().collection("posts").findOne({ id: id });

    if (!post) {
      return res.status(404).json({ error: "No post found with this ID" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the post" });
  }
});

router.put("/edit/:id", upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;

    // grab the existing post first
    const existingPost = await db().collection("posts").findOne({ id: id });


    if (!existingPost) {
      return res.status(404).json({ error: "No post found with this ID to update" });
    }

    const updatedPost = {
      title: req.body.title,
      content: req.body.content,
      username: existingPost.username,
      updatedAt: new Date(),
    };

    if(req.file) {
      updatedPost.image = req.file.path;  // Only update image if new image was provided
    }

    const result = await db().collection("posts").updateOne({ id: id }, { $set: updatedPost });

    if(result.modifiedCount === 0) {
      return res.status(404).json({ error: "No post found with this ID to update" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the post" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db().collection("posts").deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No post found with this ID to delete" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the post" });
  }
});




module.exports = router;


