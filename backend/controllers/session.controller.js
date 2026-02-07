import Session from "../models/Session.model.js";
import User from "../models/User.js";

// Create a new collaborative coding session
export const createSession = async (req, res, next) => {
    try {
        const { title, description, problemId } = req.body;
        const roomId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Generate unique room ID

        const session = new Session({
            title,
            description,
            creator: req.user._id,
            participants: [req.user._id],
            problem: problemId,
            roomId
        });

        await session.save();
        res.status(201).json({ success: true, session });
    } catch (error) {
        next(error);
    }
};

// Get all active sessions
export const getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ isActive: true })
            .populate('creator', 'name')
            .populate('participants', 'name')
            .populate('problem', 'title');
        res.json({ success: true, sessions });
    } catch (error) {
        next(error);
    }
};

// Join a session
export const joinSession = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        if (!session.isActive) return res.status(400).json({ success: false, message: "Session is not active" });
        if (session.participants.includes(req.user._id)) return res.status(400).json({ success: false, message: "Already a participant" });

        session.participants.push(req.user._id);
        await session.save();
        res.json({ success: true, message: "Joined session successfully", session });
    } catch (error) {
        next(error);
    }
};

// Leave a session
export const leaveSession = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        session.participants = session.participants.filter(participant => participant.toString() !== req.user._id.toString());
        await session.save();
        res.json({ success: true, message: "Left session successfully" });
    } catch (error) {
        next(error);
    }
};

// End a session (only creator can end)
export const endSession = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        if (session.creator.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Only creator can end the session" });

        session.isActive = false;
        await session.save();
        res.json({ success: true, message: "Session ended successfully" });
    } catch (error) {
        next(error);
    }
};
