const express = require("express");
const { v4: uuid } = require("uuid");
const { db } = require("../mongo");
const multer = require("multer");

const router = express.Router();

// Set up multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // Destination folder
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  // Filename
  }
})
const upload = multer({storage: storage})

router.post("/create", upload.single('image'), async (req, res) => {
console.log("POST /create route hit");
  try {
    const { title, content } = req.body;
    const { filename } = req.file; // get the filename of uploaded image

    const post = {
      id: uuid(),
      title: title,
      image: filename,
      content: content,
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

module.exports = router;
