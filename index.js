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

const todosSchema = new mongoose.Schema({
  userId: mongoose.Schema.ObjectId,
  todos: [
    {
      text: String,
      id: String,
    },
  ],
});
const Todos = mongoose.model("Todos", todosSchema);

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

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    if (!user || user.password !== password) {
      res.status(403);
      res.json({
        message: "invalid login",
      });
      return;
    }
    res.json({
      message: "success",
    });
  });
  
  app.post("/todos", async (req, res) => {
    const { authorization } = req.headers;
    const [, token] = authorization.split(" ");
    const [username, password] = token.split(":");
    const todosItems = req.body;
    const user = await User.findOne({ username }).exec(); // common for all post and get requests
    if (!user || user.password !== password) {
      res.status(403);
      res.json({
        message: "invalid access",
      });
      return;
    }
    const todosExist = await Todos.findOne({ userId: user._id }).exec();
    if (!todosExist) {
      await Todos.create({
        userId: user._id,
        todos: todosItems,
      });
    } else {
      todosExist.todos = todosItems;
      await todosExist.save({ validateBeforeSave: false });
    }
    res.json(todosItems);
  });
  
  app.get("/todos", async (req, res) => {
    const { authorization } = req.headers;
    const [, token] = authorization.split(" ");
    const [username, password] = token.split(":");
    const user = await User.findOne({ username }).exec();
    if (!user || user.password !== password) {
      res.status(403);
      res.json({
        message: "invalid access",
      });
      return;
    }
    const allTodos = await Todos.findOne({ userId: user._id }).exec();
    if (!allTodos) return;
    res.json(allTodos.todos);
  });
app.listen(port,() => {
    console.log('Listening')
});
