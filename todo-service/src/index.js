const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://mongo.todo-app.svc.cluster.local:27017/todosdb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Todo = mongoose.model("Todo", TodoSchema);

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(400).json({ error: "Failed to create todo" });
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(400).json({ error: "Failed to update todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(400).json({ error: "Failed to delete todo" });
  }
});

app.get("/", (req, res) => res.json({ message: "Todo Service OK" }));

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? "healthy" : "unhealthy";
  res.status(dbState === 1 ? 200 : 503).json({
    status,
    service: "todo-service",
    database: dbState === 1 ? "connected" : "disconnected",
  });
});

app.listen(3001, () => console.log("Todo Service running on 3001"));
