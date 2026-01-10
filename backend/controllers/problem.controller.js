import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";
import { validateProblemInput } from "../utils/validators.js";

export const getProblems = async (req, res) => {
    const problems = await PracticeProblem.find({ user: req.user._id }).populate('topic');
    res.json(problems);
};

export const createProblem = async (req, res) => {
    let { topic, title, difficulty } = req.body;

    const { valid, errors } = validateProblemInput(title, difficulty);
    if (!valid) return res.status(400).json({ message: errors.join(", ") });

    // If topic is a string (name), try to resolve/create a Topic document
    if (typeof topic === 'string') {
        let topicDoc = await Topic.findOne({ name: topic });
        if (!topicDoc) {
            topicDoc = await Topic.create({ name: topic, user: req.user._id });
        }
        topic = topicDoc._id;
    }

    const payload = { ...req.body, topic, user: req.user._id };
    const problem = await PracticeProblem.create(payload);
    res.json(problem);
};
