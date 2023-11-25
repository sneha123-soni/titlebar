// Install required packages
// npm install express mongoose passport passport-jwt body-parser

// Create app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/knovatortest')
//, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());

const route = require("./routes/userRoute")
app.use("/api",route);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
