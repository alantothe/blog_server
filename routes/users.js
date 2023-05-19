const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const { db } = require("../mongo");
const jwt = require("jsonwebtoken");


const router = express.Router();



router.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const existingUser = await db().collection("users").findOne({ email });
    if (existingUser) {
      res
        .status(409)
        .json({ success: false, message: "Email already exists." });
      return;
    }

    const saltRounds = 5;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = {
      id: uuid(),
      userName: userName,
      email: email,
      password: passwordHash,


    };

    const result = await db().collection("users").insertOne(user);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db().collection("users").findOne({ email });

    if (!user) {
      res.json({ success: false, message: "Could not find user." }).status(204);
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.json({ success: false, message: "Password was incorrect." }).status(204);
      return;
    }

    const userData = {
      date: new Date(),
      userId: user.id,
    };

    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    const payload = {
      userData,
      exp,
    };

    const jwtSecretKey = process.env.TOKEN_KEY;
    const token = jwt.sign(payload, jwtSecretKey);

    const userResponse = {
        id: user.id,
        userName: user.userName,
        email: user.email,
      };

    res.json({ success: true, token, email, user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});



module.exports = router;



