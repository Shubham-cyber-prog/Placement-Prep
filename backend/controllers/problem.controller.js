import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";
import { validateProblemInput } from "../utils/validators.js";

export const getProblems = async (req, res) => {
    const query = { user: req.user._id };
    if (req.query.favorite === 'true') {
        query.isFavorite = true;
    }
    const problems = await PracticeProblem.find(query).populate('topic');
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

export const toggleFavorite = async (req, res) => {
    try {
        const problem = await PracticeProblem.findOne({ _id: req.params.id, user: req.user._id });
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        problem.isFavorite = !problem.isFavorite;
        await problem.save();
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
