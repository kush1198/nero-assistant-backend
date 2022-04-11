const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/todo", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
  });
const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    if (user) {
      res.status(500);
      res.json({
        message: "user already exists",
      });
      return;
    }
    await User.create({ username, password });
    res.json({
      message: "success",
    });
  });

app.listen(port,() => {
    console.log('Listening')
});
