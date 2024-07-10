import db from "../config/db.js";

export const listTasks = (req, res) => {
  db.query("SELECT * FROM tasks ORDER BY created_at ASC", (err, results) => {
    if (err) {
      console.error("Error retrieving tasks: ", err);
      res.status(500).json({ error: "Error retrieving tasks" });
      return;
    }
    res.status(200).json(results);
  });
};

export const addTask = (req, res) => {
  const { heading, description, date, time, priority, image } = req.body;

  const newTask = {
    heading,
    description,
    date,
    time,
    image,
    priority,
  };

  db.query("INSERT INTO tasks SET ?", newTask, (err, result) => {
    if (err) {
      console.error("Error adding task: ", err);
      res.status(500).json({ error: "Error adding task" });
      return;
    }
    res
      .status(201)
      .json({ message: "Task added successfully", id: result.insertId });
  });
};

export const getTask = (req, res) => {
  const taskId = req.params.id;

  db.query("SELECT * FROM tasks WHERE id = ?", taskId, (err, results) => {
    if (err) {
      console.error("Error retrieving task: ", err);
      res.status(500).json({ error: "Error retrieving task" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(results[0]);
  });
};

export const updateTask = (req, res) => {
  const taskId = req.params.id;
  let { heading, description, date, time, priority, image } = req.body;

  if (date) {
    let dateObj = new Date(date);
    date = dateObj.toISOString().split("T")[0];
  }

  db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, results) => {
    if (err) {
      console.error("Error fetching task: ", err);
      return res.status(500).json({ error: "Error fetching task" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const existingTask = results[0];

    const updatedTask = {
      heading: heading || existingTask.heading,
      description: description || existingTask.description,
      date: date || existingTask.date,
      time: time || existingTask.time,
      priority: priority || existingTask.priority,
      image: image || existingTask.image,
    };

    db.query(
      "UPDATE tasks SET ? WHERE id = ?",
      [updatedTask, taskId],
      (err, result) => {
        if (err) {
          console.error("Error updating task: ", err);
          return res.status(500).json({ error: "Error updating task" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Task not found" });
        }

        res
          .status(200)
          .json({ message: "Task updated successfully", id: taskId });
      }
    );
  });
};

export const deleteTask = (req, res) => {
  const taskId = req.params.id;

  db.query("DELETE FROM tasks WHERE id = ?", taskId, (err, result) => {
    if (err) {
      console.error("Error deleting task: ", err);
      res.status(500).json({ error: "Error deleting task" });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json({ message: "Task deleted successfully", id: taskId });
  });
};
