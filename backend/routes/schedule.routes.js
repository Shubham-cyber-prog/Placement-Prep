import express from "express";

import {
  createSchedule,
  getMySchedules,
  getAvailableSlots,
  getUpcomingInterviews,
  getScheduleById,
  updateSchedule,
  confirmSchedule,
  cancelSchedule,
  addFeedback,
  getFeedback,
  updateAvailability,
  getAvailability,
  exportToICS,
  getAvailableHosts
} from "../controllers/schedule.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes protected
router.use(protect);

// Schedule CRUD operations
router.post("/", createSchedule);
router.get("/", getMySchedules);
router.get("/upcoming", getUpcomingInterviews);
router.get("/available-hosts", getAvailableHosts);
router.get("/availability", getAvailability);
router.put("/availability", updateAvailability);

// Get available slots (can be called without auth for public availability)
router.get("/available-slots", getAvailableSlots);

// Specific schedule operations
router.get("/:id", getScheduleById);
router.put("/:id", updateSchedule);
router.patch("/:id/confirm", confirmSchedule);
router.patch("/:id/cancel", cancelSchedule);

// Feedback
router.post("/:id/feedback", addFeedback);
router.get("/:id/feedback", getFeedback);

// Export
router.get("/:id/export", exportToICS);

export default router;
