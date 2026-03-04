import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes below
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create task and attach owner = req.user._id (provided by authMiddleware)
    const task = await Task.create({
      title,
      description,
      owner: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error creating task" });
  }
});

// GET /api/tasks - Return only tasks belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    // Find tasks where the 'owner' matches the current user's ID
    const tasks = await Task.find({ owner: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// DELETE /api/tasks/:id - Delete a specific task
router.delete("/:id", async (req, res) => {
  try {
    // Check ownership: Find a task with this ID AND make sure the owner is the current user
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;