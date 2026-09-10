import express from "express";
import pgclient from "../db/db.js";
import { requireLogin, requireAdmin } from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

// Admin-only routes for viewing and managing user accounts.


// GET /api/users
// Allows the admin to view all registered users without exposing passwords.
// require admin > This runs before the route and blocks anyone who is not an admin.
userRoutes.get("/", requireAdmin, async (req, res) => {
    try {
        const result = await pgclient.query(
            "SELECT id, name, email, role FROM users ORDER BY id"
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// DELETE /api/users/:id
// Allows the admin to delete a user account by ID.
userRoutes.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const result = await pgclient.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, name, email, role`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// PUT /api/users/profile
// Allows the logged-in user to update their own profile without choosing a user ID.
userRoutes.put("/profile", requireLogin, async (req, res) => {
    const { name, email } = req.body;

    try {
        const result = await pgclient.query(
            `UPDATE users
             SET name = $1, email = $2
             WHERE id = $3
             RETURNING id, name, email, role`,
            [name, email, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default userRoutes;