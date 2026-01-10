import Profile from "../models/Profile.js";
import PracticeProblem from "../models/PracticeProblem.js";

export const getProfile = async (req, res) => {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await Profile.create({ user: req.user._id });
    }
    res.json(profile);
};

export const updateProfile = async (req, res) => {
    const { bio, company, location, skills } = req.body;
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
        profile = await Profile.create({ user: req.user._id });
    }

    profile.bio = bio || profile.bio;
    profile.company = company || profile.company;
    profile.location = location || profile.location;
    profile.skills = skills || profile.skills;

    await profile.save();
    res.json(profile);
};

// Implement Issue #50: User Dashboard Stats
export const getProfileStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregation Pipeline
        const stats = await PracticeProblem.aggregate([
            { $match: { user: userId } },
            {
                $facet: {
                    totalSolved: [{ $count: "count" }],
                    byDifficulty: [
                        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
                    ],
                    byTopic: [
                        {
                            $lookup: {
                                from: "topics", // Verify collection name in MongoDB (usually lowercase plural)
                                localField: "topic",
                                foreignField: "_id",
                                as: "topicDetails"
                            }
                        },
                        { $unwind: "$topicDetails" }, // Unwind lookup array
                        { $group: { _id: "$topicDetails.name", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        // Formatting the response
        const data = stats[0];
        const formattedStats = {
            totalSolved: data.totalSolved[0] ? data.totalSolved[0].count : 0,
            difficultyBreakdown: data.byDifficulty.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            topicBreakdown: data.byTopic.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };

        res.json({ success: true, data: formattedStats });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Server Error fetching stats" });
    }
};
