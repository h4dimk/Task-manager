import express from "express";
import cors from "cors";
import db from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import dotenv from "dotenv";


dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
