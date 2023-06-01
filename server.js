const express = require("express");
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const PORT = process.env.API_PORT || 4000;

var { mongoConnect } = require('./mongo.js');
mongoConnect();

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(logger('dev'));
app.use(cors());


// Add CORS headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// register the routes here
var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postRouter = require('./routes/posts')

app.use('/', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/post', postRouter)


server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
