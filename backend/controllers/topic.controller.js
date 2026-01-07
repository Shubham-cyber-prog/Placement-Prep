import Topic from "../models/Topic.js";

export const getTopics = async (req, res) => {
    const topics = await Topic.find({ user: req.user._id });
    res.json(topics);
};

export const createTopic = async (req, res) => {
    const topic = await Topic.create({
        title: req.body.title,
        user: req.user._id,
    });
    res.json(topic);
};
