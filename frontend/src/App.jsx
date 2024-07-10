import React, { useState, useEffect } from "react";
import axios from "./services/axiosService";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "./firebase";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTaskHeading, setNewTaskHeading] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");
  const [newTaskImage, setNewTaskImage] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [imagePerc, setImagePerc] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/");
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleImageChange = async (event) => {
    const image = event.target.files[0];
    if (!image) {
      setImageError(true);
      console.error("No image selected");
      return;
    }

    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePerc(Math.round(progress));
      },
      (error) => {
        setImageError(true);
        console.error("Error uploading image:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setNewTaskImage(downloadURL);
        });
      }
    );
  };

  const validateForm = () => {
    let errors = {};
    if (!newTaskHeading) errors.heading = "Heading is required";
    if (!newTaskDescription) errors.description = "Description is required";
    if (!newTaskDate) errors.date = "Date is required";
    if (!newTaskTime) errors.time = "Time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newTask = {
      heading: newTaskHeading,
      description: newTaskDescription,
      date: newTaskDate,
      time: newTaskTime,
      priority: newTaskPriority,
      image: newTaskImage,
    };

    try {
      const response = await axios.post("/", newTask);

      setTasks([...tasks, response.data]);
      setFilteredTasks([...tasks, response.data]);
      setNewTaskHeading("");
      setNewTaskDescription("");
      setNewTaskDate("");
      setNewTaskTime("");
      setNewTaskPriority("low");
      setNewTaskImage(null);
      setImagePerc(0);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/${id}`);
      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleFilterTasks = (priority) => {
    if (priority === "all") {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter((task) => task.priority === priority);
      setFilteredTasks(filtered);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTaskHeading(task.heading);
    setNewTaskDescription(task.description);
    setNewTaskDate(task.date);
    setNewTaskTime(task.time);
    setNewTaskPriority(task.priority);
    setNewTaskImage(task.image);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const updatedTask = {
      heading: newTaskHeading,
      description: newTaskDescription,
      date: newTaskDate,
      time: newTaskTime,
      priority: newTaskPriority,
      image: newTaskImage,
    };

    console.log(updatedTask);

    try {
      await axios.put(`/${editingTask.id}`, updatedTask);

      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id ? { ...task, ...updatedTask } : task
      );
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setEditingTask(null);
      setNewTaskHeading("");
      setNewTaskDescription("");
      setNewTaskDate("");
      setNewTaskTime("");
      setNewTaskPriority("low");
      setNewTaskImage(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-center font-bold text-2xl mb-5">
              Task Manager
            </h1>

            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => handleFilterTasks("all")}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring focus:border-gray-600"
              >
                All
              </button>
              <button
                onClick={() => handleFilterTasks("low")}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300"
              >
                Low
              </button>
              <button
                onClick={() => handleFilterTasks("medium")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring focus:border-yellow-300"
              >
                Medium
              </button>
              <button
                onClick={() => handleFilterTasks("high")}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300"
              >
                High
              </button>
            </div>

            <form
              onSubmit={editingTask ? handleUpdateTask : handleAddTask}
              encType="multipart/form-data"
              className="mt-6 flex flex-col gap-4 bg-gray-100 rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-center">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              {formErrors.heading && (
                <p className="text-red-500 text-sm">{formErrors.heading}</p>
              )}
              <input
                type="text"
                placeholder="Task heading"
                value={newTaskHeading}
                onChange={(e) => setNewTaskHeading(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm">{formErrors.description}</p>
              )}
              <textarea
                placeholder="Task description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full h-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              ></textarea>
              {formErrors.date && (
                <p className="text-red-500 text-sm">{formErrors.date}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <div className="w-full md:w-1/2">
                  <label
                    htmlFor="taskDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="taskDate"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
                {formErrors.time && (
                  <p className="text-red-500 text-sm w-full md:w-1/2">
                    {formErrors.time}
                  </p>
                )}
                <div className="w-full md:w-1/2">
                  <label
                    htmlFor="taskTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    id="taskTime"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  htmlFor="taskImage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image (optional)
                </label>
                <div className="w-full">
                  <input
                    type="file"
                    id="taskImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                  {imagePerc > 0 && (
                    <p className="text-sm text-gray-500">
                      Uploading: {imagePerc}%
                    </p>
                  )}
                  {imageError && (
                    <p className="text-sm text-red-500">
                      Error uploading image
                    </p>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  <label
                    htmlFor="taskPriority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring focus:ring-offset-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                {editingTask ? "Update Task" : "Add Task"}
              </button>
            </form>

            <div className="space-y-4 mt-6">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <h2 className="font-semibold text-lg">{task.heading}</h2>
                    <p className="text-gray-800">{task.description}</p>
                    <div className="text-sm text-gray-600">
                      <p>Date: {new Date(task.date).toLocaleDateString()}</p>
                      <p>Time: {task.time}</p>
                      <p className="mt-3">
                        Priority:{" "}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.priority === "low"
                              ? "bg-green-500 text-white"
                              : task.priority === "medium"
                              ? "bg-yellow-500 text-gray-900"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </p>
                    </div>
                  </div>

                  {task.image && (
                    <img
                      src={task.image}
                      alt="Task"
                      className="ml-4 w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-md"
                    />
                  )}

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
