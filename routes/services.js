import express from "express";
import pgclient from "../db/db.js";
import { requireAdmin } from "../middleware/authMiddleware.js"; //for extra auth for roles and login


const serviceRoutes = express.Router();


// GET all services
// http://localhost:5000/api/services/
serviceRoutes.get("/", async (req, res) => {
    const services = await pgclient.query("SELECT * FROM services;");
    res.json(services.rows);
});


// GET one service
// http://localhost:5000/api/services/1
serviceRoutes.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pgclient.query(
            "SELECT * FROM services WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// POST new service
// http://localhost:5000/api/services/
serviceRoutes.post("/", requireAdmin, async (req, res) => {
    const { name, description, price, duration } = req.body;

    try {
        const result = await pgclient.query(
            `INSERT INTO services 
            (name, description, price, duration)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [name, description, price, duration]
        );

        res.status(200).json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// UPDATE service
// http://localhost:5000/api/services/1
serviceRoutes.put("/:id", requireAdmin, async (req, res) => {
    const { name, description, price, duration } = req.body;
    // Gets the new values from the request body.

    try {
        const result = await pgclient.query(   //Runs the SQL update query.
            `UPDATE services
            SET name = $1,
                description = $2,
                price = $3,
                duration = $4
            WHERE id = $5
            RETURNING *`,
            [
                name,
                description,
                price,
                duration,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// DELETE service
// http://localhost:5000/api/services/1
serviceRoutes.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const result = await pgclient.query(
            "DELETE FROM services WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.json({
            message: "Service deleted",
            service: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


export default serviceRoutes;