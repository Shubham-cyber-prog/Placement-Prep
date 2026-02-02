import Group from "../models/Group.model.js";
import User from "../models/User.js";

// Create a new group
export const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const group = new Group({
            name,
            description,
            creator: req.user._id,
            members: [req.user._id]
        });
        await group.save();
        res.status(201).json({ success: true, group });
    } catch (error) {
        next(error);
    }
};

// Get all groups
export const getGroups = async (req, res, next) => {
    try {
        const groups = await Group.find().populate('creator', 'name').populate('members', 'name');
        res.json({ success: true, groups });
    } catch (error) {
        next(error);
    }
};

// Join a group
export const joinGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: "Group not found" });
        if (group.members.includes(req.user._id)) return res.status(400).json({ success: false, message: "Already a member" });
        group.members.push(req.user._id);
        await group.save();
        res.json({ success: true, message: "Joined group successfully" });
    } catch (error) {
        next(error);
    }
};

// Leave a group
export const leaveGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: "Group not found" });
        group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
        await group.save();
        res.json({ success: true, message: "Left group successfully" });
    } catch (error) {
        next(error);
    }
};
