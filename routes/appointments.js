import express from "express";
import pgclient from "../db/db.js";
import { requireLogin, requireAdmin } from "../middleware/authMiddleware.js";

const appointmentRoutes = express.Router();

// Appointments belong to the currently logged-in user.
// The session user ID is used so users can only access and manage their own appointments.

// GET /api/appointments
// Get all appointments that belong to the currently logged-in user.
appointmentRoutes.get("/", requireLogin, async (req, res) => {
    try {
        const result = await pgclient.query(
            `SELECT * FROM appointments
             WHERE user_id = $1
             ORDER BY appointment_date, appointment_time`,
            [req.session.userId]
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// POST /api/appointments
// Create a new appointment for the currently logged-in user.
appointmentRoutes.post("/", requireLogin, async (req, res) => {
    const { pet_id, service_id, appointment_date, appointment_time } = req.body;

    try {
        // Make sure the selected pet belongs to the logged-in user
        const pet = await pgclient.query(
            "SELECT * FROM pets WHERE id = $1 AND user_id = $2",
            [pet_id, req.session.userId]
        );

        if (pet.rows.length === 0) {
            return res.status(404).json({
                message: "Pet not found"
            });
        }

        const result = await pgclient.query(
            `INSERT INTO appointments
             (appointment_date, appointment_time, user_id, pet_id, service_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                appointment_date,
                appointment_time,
                req.session.userId,
                pet_id,
                service_id
            ]
        );

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// PUT /api/appointments/:id/cancel
// Allows a logged-in user to cancel only their own appointment.
// cancel means only changing teh status without actually deleting the record
appointmentRoutes.put("/:id/cancel", requireLogin, async (req, res) => {
    try {
        const result = await pgclient.query(
            `UPDATE appointments
             SET status = 'cancelled'
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [req.params.id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// GET /api/appointments/admin/all
// Allows admins to view appointments from all users.
appointmentRoutes.get("/admin/all", requireAdmin, async (req, res) => {
    try {
        const result = await pgclient.query(
            `SELECT * FROM appointments
             ORDER BY appointment_date, appointment_time`
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


// PUT /api/appointments/:id/status
// Allows admins to accept or reject an appointment.
appointmentRoutes.put("/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({
            message: "Status must be accepted or rejected"
        });
    } //It is just a backend safety check in case someone sends an invalid value manually

    try {
        const result = await pgclient.query(
            `UPDATE appointments
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            message: "Appointment status updated successfully",
            appointment: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default appointmentRoutes;