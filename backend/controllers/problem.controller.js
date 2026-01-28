import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";
import { validateProblemInput } from "../utils/validators.js";

export const getProblems = async (req, res, next) => {
    try {
        const query = { user: req.user._id };
        if (req.query.favorite === 'true') {
            query.isFavorite = true;
        }
        const problems = await PracticeProblem.find(query).populate('topic');
        res.json(problems);
    } catch (error) {
        next(error);
    }
};

export const createProblem = async (req, res, next) => {
    try {
        let { topic, title, difficulty } = req.body;

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
    } catch (error) {
        next(error);
    }
};

export const toggleFavorite = async (req, res, next) => {
    try {
        const problem = await PracticeProblem.findOne({ _id: req.params.id, user: req.user._id });
        if (!problem) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            return next(error);
        }

        problem.isFavorite = !problem.isFavorite;
        await problem.save();
        res.json(problem);
    } catch (error) {
        next(error);
    }
};

export const markAsSolved = async (req, res, next) => {
    try {
        const problem = await PracticeProblem.findOne({ _id: req.params.id, user: req.user._id });
        if (!problem) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            return next(error);
        }

        problem.solved = true;
        problem.solvedDate = new Date();
        await problem.save();
        res.json(problem);
    } catch (error) {
        next(error);
    }
};

export const markAsUnsolved = async (req, res, next) => {
    try {
        const problem = await PracticeProblem.findOne({ _id: req.params.id, user: req.user._id });
        if (!problem) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            return next(error);
        }

        problem.solved = false;
        problem.solvedDate = null;
        await problem.save();
        res.json(problem);
    } catch (error) {
        next(error);
    }
};
