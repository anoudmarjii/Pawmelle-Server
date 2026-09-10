import express from "express";
import pgclient from "../db/db.js";
import { requireLogin } from "../middleware/authMiddleware.js";

const petRoutes = express.Router();

// Pets are linked to the currently logged-in user.
// We use req.session.userId instead of accepting user_id from the frontend
// so users can only create, view, update, or delete their own pets.


// GET /api/pets
// Get all pets that belong to the currently logged-in user
//  require login > checks that the user has an active session before allowing the request.
petRoutes.get("/", requireLogin, async (req, res) => {
    try {
        const result = await pgclient.query(
            "SELECT * FROM pets WHERE user_id = $1 ORDER BY id",
            [req.session.userId] //gets the ID of the currently logged-in user.
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// POST /api/pets
// Add a new pet for the currently logged-in user
petRoutes.post("/", requireLogin, async (req, res) => {
    const { name, species, breed, age } = req.body;

    try {
        const result = await pgclient.query(
            `INSERT INTO pets (name, species, breed, age, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, species, breed, age, req.session.userId] 
            //request.sess.id > The logged in user automatically becomes the owner
        );

        res.status(201).json({
            message: "Pet added successfully",
            pet: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET /api/pets/:id
// Get one pet only if it belongs to the currently logged-in user
// Needed when the frontend wants to view, edit, or book an appointment for one specific pet.
petRoutes.get("/:id", requireLogin, async (req, res) => {
    try {
        const result = await pgclient.query(
            "SELECT * FROM pets WHERE id = $1 AND user_id = $2", //We also check that the pet belongs to the logged-in user.
            [req.params.id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pet not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// PUT /api/pets/:id
// Update a pet only if it belongs to the currently logged-in user.
// id = $5 AND user_id = $6 > only if the user requested the pet ID and belongs to their acc
petRoutes.put("/:id", requireLogin, async (req, res) => {
    const { name, species, breed, age } = req.body;

    try {
        const result = await pgclient.query(
            `UPDATE pets
             SET name = $1,
                 species = $2,
                 breed = $3,
                 age = $4
             WHERE id = $5 AND user_id = $6  
             RETURNING *`,
            [
                name,
                species,
                breed,
                age,
                req.params.id,
                req.session.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pet not found"
            });
        }

        res.status(200).json({
            message: "Pet updated successfully",
            pet: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// DELETE /api/pets/:id
// Delete a pet only if it belongs to the currently logged-in user.
petRoutes.delete("/:id", requireLogin, async (req, res) => {
    try {
        const result = await pgclient.query(
            `DELETE FROM pets
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [req.params.id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pet not found"
            });
        }

        res.status(200).json({
            message: "Pet deleted successfully",
            pet: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default petRoutes;