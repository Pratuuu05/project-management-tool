const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks?project=:projectId
// @desc    Get tasks for a project
router.get('/', protect, async (req, res) => {
  try {
    const filter = { project: req.query.project };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('order');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, deadline, tags, status } = req.body;

    const task = await Task.create({
      title, description, project, assignedTo, priority, deadline, tags, status,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project progress
    const allTasks = await Task.find({ project });
    const done = allTasks.filter(t => t.status === 'done').length;
    const progress = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
    await Project.findByIdAndUpdate(project, { progress });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Recalculate project progress
    const allTasks = await Task.find({ project: task.project });
    const done = allTasks.filter(t => t.status === 'done').length;
    const progress = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
    await Project.findByIdAndUpdate(task.project, { progress });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectId = task.project;
    await task.deleteOne();

    // Recalculate project progress
    const allTasks = await Task.find({ project: projectId });
    const done = allTasks.filter(t => t.status === 'done').length;
    const progress = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
    await Project.findByIdAndUpdate(projectId, { progress });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
