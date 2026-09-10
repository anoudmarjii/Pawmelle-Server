import express from "express";
import dotenv from "dotenv";
import pgclient from "./db/db.js";
import serviceRoutes from "./routes/services.js";
import authRoutes from "./routes/auth.js";
import petRoutes from "./routes/pets.js";
import appointmentRoutes from "./routes/appointments.js";
import userRoutes from "./routes/users.js";
import session from "express-session";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// middleware
app.use(express.json()); 

// for session/cookie
// secret: The server creates a session ID when the user logs in, signs it using the secret key, and sends it to the browser in a cookie. On later requests, the server verifies the signature to make sure the session ID was not changed or tampered with.
// it should be placed before app.use belows, and after middleware

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,  //protects/signs the session cookie
    resave: false,  //don't save the session again if nothing changed
    saveUninitialized: false, //don't create sessions for visitors who haven't logged in
    cookie: {
      httpOnly: true,  //js in the browser cannot directly access the cookie
      secure: process.env.NODE_ENV === "production",  //false while using http://localhost
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000  // 24 hours in milliseconds
    }
  })
);

// CORS middleware
// allows the frontend (running on a different port) to make requests to the backend.
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);


// for routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);  

// to test db connection
pgclient.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));

app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`);
});

