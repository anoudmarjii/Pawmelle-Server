import express from "express";
import bcrypt from "bcrypt";
import pgclient from "../db/db.js";

const authRoutes = express.Router();


// POST /api/auth/signup
authRoutes.post("/signup", async (req, res) => {
    //gets the registration data sent from React
    const {
    name,
    email,
    phone,
    petType,
    petAge,
    password
} = req.body || {};

    if (!name ||
        !email ||
        !phone ||
        !petType ||
        petAge === undefined ||
        petAge === "" ||
        !password) {
        return res.status(400).json({
            message: "All Fields are required"
    });
}

    try {
        // Check if the email is already registered
        const existingUser = await pgclient.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        //here the actual check happens
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // New accounts are always created as normal users so no one pretends to be an admin
        const result = await pgclient.query(
            `INSERT INTO users (name, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, phone, role`,
            [name, email, phone, hashedPassword, "user"]
        );

        const newUser = result.rows[0];

        await pgclient.query(
            `INSERT INTO pets (species, age, user_id)
            VALUES ($1, $2, $3)`,
            [petType, petAge, newUser.id]
        );


        res.status(201).json({
            message: "Account created successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// POST /api/auth/login
authRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
    });
}

    try {
        // Find the user by email
        const result = await pgclient.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // If the email does not exist
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare entered password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Store user information inside the session
        req.session.userId = user.id;
        req.session.role = user.role;

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Get the currently logged-in user using the session user ID
// GET /api/auth/me
authRoutes.get("/me", async (req, res) => {
    // Check if the user has a session
    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const result = await pgclient.query(
            "SELECT id, name, email, phone, role FROM users WHERE id = $1",
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];

        res.status(200).json({
            message: "Login successful",
            user: {
            id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Log out the current user by destroying the active session
authRoutes.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }

        res.clearCookie("connect.sid");

        res.status(200).json({
            message: "Logout successful"
        });
    });
});

export default authRoutes;