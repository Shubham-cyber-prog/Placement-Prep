import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";

export const getProblems = async (req, res) => {
    const problems = await PracticeProblem.find({ user: req.user._id }).populate('topic');
    res.json(problems);
};

export const createProblem = async (req, res) => {
    let { topic } = req.body;

    console.log('createProblem called with topic:', topic, 'type:', typeof topic);

    // If topic is a string (name), try to resolve/create a Topic document
    if (typeof topic === 'string') {
        let topicDoc = await Topic.findOne({ name: topic });
        console.log('found topicDoc:', topicDoc);
        if (!topicDoc) {
            topicDoc = await Topic.create({ name: topic, user: req.user._id });
            console.log('created topicDoc:', topicDoc);
        }
        topic = topicDoc._id;
        console.log('topic resolved to id:', topic);
    }

    const payload = { ...req.body, topic, user: req.user._id };
    console.log('creating problem with payload:', payload);
    const problem = await PracticeProblem.create(payload);
    res.json(problem);
};
