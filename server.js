import express from "express";
import dotenv from "dotenv";
import pgclient from "./db/db.js";
import serviceRoutes from "./routes/services.js";

const app = express();
dotenv.config();

app.use(express.json());

// for servies routes
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT;

// to test db connection
pgclient.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));

app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`);
});

