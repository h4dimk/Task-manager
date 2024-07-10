import express from "express";

import {
  listTasks,
  addTask,
  deleteTask,
  getTask,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", listTasks);
router.post("/", addTask);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
