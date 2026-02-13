import express from "express";
import {
    sendMessage,
    getGroupMessages,
    addEmoji,
    editMessage,
    deleteMessage,
    markAsRead
} from "../controllers/message.controller.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Message routes
router.get("/groups/:groupId", getGroupMessages);
router.post("/groups/:groupId", sendMessage);
router.post("/:messageId/emoji", addEmoji);
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/groups/:groupId/read", markAsRead);

export default router;