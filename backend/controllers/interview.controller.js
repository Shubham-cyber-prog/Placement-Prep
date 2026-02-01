import Interview from "../models/Interview.model.js";
import { generateToken } from "../utils/generateToken.js";

// Get mock interview questions
export const getMockInterview = async (req, res) => {
  try {
    const { type, company, difficulty } = req.query;
    const userId = req.user._id;

    // Generate mock questions based on type
    const questions = generateMockQuestions(type, company, difficulty);

    res.json({
      success: true,
      data: {
        questions,
        type,
        company,
        difficulty,
        estimatedTime: type === 'technical' ? 60 : type === 'behavioral' ? 30 : 45
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get mock interview",
      error: error.message
    });
  }
};

// Schedule an interview
export const scheduleInterview = async (req, res) => {
  try {
    const { type, company, role, difficulty, scheduledAt, duration } = req.body;
    const userId = req.user._id;

    const interview = new Interview({
      userId,
      type,
      company,
      role,
      difficulty,
      scheduledAt,
      duration
    });

    await interview.save();

    res.status(201).json({
      success: true,
      data: interview,
      message: "Interview scheduled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message
    });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOneAndUpdate(
      { _id: id, userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json({
      success: true,
      data: interview,
      message: "Interview cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview",
      error: error.message
    });
  }
};

// Get interview history
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Interview.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        interviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interview history",
      error: error.message
    });
  }
};

// Submit interview response
export const submitInterviewResponse = async (req, res) => {
  try {
    const { interviewId, responses } = req.body;
    const userId = req.user._id;

    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    // Calculate scores and generate feedback
    const evaluation = evaluateResponses(responses, interview.type);
    const feedback = generateFeedback(evaluation, interview.type);

    interview.questions = responses.map((response, index) => ({
      question: response.question,
      answer: response.answer,
      evaluation: {
        score: evaluation.scores[index] || 0,
        feedback: evaluation.feedbacks[index] || "No feedback available",
        suggestions: evaluation.suggestions[index] || []
      },
      timeTaken: response.timeTaken || 0,
      category: interview.type
    }));

    interview.overallScore = evaluation.overallScore;
    interview.feedback = feedback;
    interview.status = 'completed';
    interview.aiAnalysis = {
      sentiment: evaluation.sentiment,
      confidence: evaluation.confidence,
      communicationScore: evaluation.communicationScore,
      technicalScore: evaluation.technicalScore,
      behavioralScore: evaluation.behavioralScore
    };

    await interview.save();

    res.json({
      success: true,
      data: {
        interview,
        evaluation,
        feedback
      },
      message: "Interview response submitted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit interview response",
      error: error.message
    });
  }
};

// Get interview analytics
export const getInterviewAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({ userId, status: 'completed' });

    const analytics = {
      totalInterviews: interviews.length,
      averageScore: interviews.length > 0 ?
        interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / interviews.length : 0,
      typeBreakdown: {},
      companyBreakdown: {},
      scoreTrend: interviews.map(i => ({
        date: i.createdAt,
        score: i.overallScore || 0
      })).sort((a, b) => new Date(a.date) - new Date(b.date)),
      strengths: [],
      areasToImprove: []
    };

    // Calculate breakdowns
    interviews.forEach(interview => {
      analytics.typeBreakdown[interview.type] = (analytics.typeBreakdown[interview.type] || 0) + 1;
      analytics.companyBreakdown[interview.company] = (analytics.companyBreakdown[interview.company] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interview analytics",
      error: error.message
    });
  }
};

// Get interview questions
export const getInterviewQuestions = async (req, res) => {
  try {
    const { type, company } = req.query;
    const questions = generateMockQuestions(type, company);

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interview questions",
      error: error.message
    });
  }
};

// Simulate interview
export const simulateInterview = async (req, res) => {
  try {
    const { type, company, difficulty } = req.body;
    const userId = req.user._id;

    const questions = generateMockQuestions(type, company, difficulty);

    const interview = new Interview({
      userId,
      type,
      company,
      difficulty,
      status: 'in-progress',
      questions: questions.map(q => ({
        question: q.question,
        answer: "",
        evaluation: { score: 0, feedback: "", suggestions: [] },
        timeTaken: 0,
        category: type
      }))
    });

    await interview.save();

    res.json({
      success: true,
      data: {
        interviewId: interview._id,
        questions,
        type,
        company
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to simulate interview",
      error: error.message
    });
  }
};

// Get interview tips
export const getInterviewTips = async (req, res) => {
  try {
    const { type } = req.query;

    const tips = {
      technical: [
        "Explain your thought process clearly",
        "Start with a brute force solution, then optimize",
        "Consider edge cases and time/space complexity",
        "Practice coding on a whiteboard or paper",
        "Ask clarifying questions when needed"
      ],
      behavioral: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Prepare specific examples from your experience",
        "Show enthusiasm and cultural fit",
        "Be honest about your weaknesses",
        "Ask thoughtful questions about the company"
      ],
      'system-design': [
        "Start with requirements and constraints",
        "Discuss trade-offs and scalability",
        "Draw diagrams to illustrate your design",
        "Consider database design and APIs",
        "Think about monitoring and failure scenarios"
      ]
    };

    res.json({
      success: true,
      data: tips[type] || tips.technical
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interview tips",
      error: error.message
    });
  }
};

// Save interview recording
export const saveInterviewRecording = async (req, res) => {
  try {
    const { interviewId, recordingUrl } = req.body;
    const userId = req.user._id;

    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, userId },
      { recordingUrl },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json({
      success: true,
      data: interview,
      message: "Recording saved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save recording",
      error: error.message
    });
  }
};

// Get interview feedback
export const getInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({ _id: id, userId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json({
      success: true,
      data: {
        feedback: interview.feedback,
        overallScore: interview.overallScore,
        aiAnalysis: interview.aiAnalysis,
        questions: interview.questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interview feedback",
      error: error.message
    });
  }
};

// Get recommended interviews
export const getRecommendedInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's progress and completed interviews
    const completedInterviews = await Interview.find({ userId, status: 'completed' });
    const completedTypes = [...new Set(completedInterviews.map(i => i.type))];

    const recommendations = [];

    // Recommend based on what's not done yet
    const allTypes = ['technical', 'behavioral', 'system-design', 'hr'];
    const missingTypes = allTypes.filter(type => !completedTypes.includes(type));

    missingTypes.forEach(type => {
      recommendations.push({
        type,
        reason: `You haven't practiced ${type} interviews yet`,
        priority: 'high'
      });
    });

    // Recommend companies based on progress
    const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix'];
    const practicedCompanies = completedInterviews.map(i => i.company);

    companies.forEach(company => {
      if (!practicedCompanies.includes(company)) {
        recommendations.push({
          company,
          reason: `Practice interviews for ${company}`,
          priority: 'medium'
        });
      }
    });

    res.json({
      success: true,
      data: recommendations.slice(0, 5) // Return top 5 recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message
    });
  }
};

// Helper functions
function generateMockQuestions(type, company, difficulty = 'medium') {
  const questionSets = {
    technical: [
      "Explain the time and space complexity of your solution to the two-sum problem.",
      "How would you design a URL shortening service like bit.ly?",
      "Implement a function to detect a cycle in a linked list.",
      "Explain the difference between TCP and UDP protocols.",
      "How does garbage collection work in your preferred programming language?",
      "Design a cache with LRU eviction policy.",
      "Explain the concept of database indexing and when to use it.",
      "How would you handle concurrent access to a shared resource?",
      "Describe the process of compiling a high-level language to machine code.",
      "How do you approach debugging a complex software issue?"
    ],
    behavioral: [
      "Tell me about a time when you faced a difficult technical challenge.",
      "How do you handle disagreements with team members?",
      "Describe your approach to learning new technologies.",
      "Tell me about a project you worked on that you're particularly proud of.",
      "How do you prioritize tasks when you have multiple deadlines?",
      "Describe a situation where you had to explain a complex technical concept to a non-technical person.",
      "How do you handle constructive criticism?",
      "Tell me about a time when you had to work under pressure.",
      "How do you stay motivated and productive during long projects?",
      "Describe your ideal work environment and team dynamic."
    ],
    'system-design': [
      "Design a notification system for a large-scale application.",
      "How would you design Instagram's feed system?",
      "Design a rate limiting system for an API.",
      "How would you design a distributed file storage system?",
      "Design a recommendation engine for an e-commerce platform.",
      "How would you handle database scaling for a growing application?",
      "Design a chat system that supports millions of users.",
      "How would you design a payment processing system?",
      "Design a search engine for a large dataset.",
      "How would you handle traffic spikes in a web application?"
    ],
    hr: [
      "Why do you want to work for our company?",
      "Where do you see yourself in 5 years?",
      "What are your salary expectations?",
      "Why did you leave your previous job?",
      "What are your greatest strengths and weaknesses?",
      "How do you handle work-life balance?",
      "What motivates you to do your best work?",
      "How do you handle failure or setbacks?",
      "What are you looking for in a manager?",
      "How do you stay updated with industry trends?"
    ]
  };

  const questions = questionSets[type] || questionSets.technical;

  return questions.map((question, index) => ({
    id: index + 1,
    question,
    type,
    company: company || 'General',
    difficulty,
    timeLimit: type === 'technical' ? 15 : type === 'behavioral' ? 10 : 20, // minutes
    category: type
  }));
}

function evaluateResponses(responses, type) {
  // Simple evaluation logic - in a real app, this could use AI/ML
  const scores = responses.map(response => {
    const answer = response.answer || '';
    let score = 0;

    // Basic scoring based on answer length and keywords
    if (answer.length > 50) score += 3;
    else if (answer.length > 20) score += 2;
    else if (answer.length > 0) score += 1;

    // Type-specific scoring
    if (type === 'technical') {
      const techKeywords = ['algorithm', 'complexity', 'optimization', 'data structure', 'time', 'space'];
      const keywordCount = techKeywords.filter(keyword => answer.toLowerCase().includes(keyword)).length;
      score += keywordCount;
    } else if (type === 'behavioral') {
      const behavioralKeywords = ['team', 'challenge', 'learned', 'improved', 'situation', 'action', 'result'];
      const keywordCount = behavioralKeywords.filter(keyword => answer.toLowerCase().includes(keyword)).length;
      score += keywordCount;
    }

    return Math.min(score, 10); // Max 10 points per question
  });

  const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * 10)) * 100);

  const feedbacks = responses.map((response, index) => {
    const score = scores[index];
    if (score >= 8) return "Excellent answer with good depth and clarity.";
    if (score >= 6) return "Good answer, but could be more detailed.";
    if (score >= 4) return "Basic answer, try to provide more specific examples.";
    return "Answer needs more substance and detail.";
  });

  const suggestions = responses.map(() => [
    "Provide more specific examples",
    "Explain your thought process",
    "Consider edge cases",
    "Practice timing your responses"
  ]);

  return {
    scores,
    overallScore,
    feedbacks,
    suggestions,
    sentiment: overallScore > 70 ? 'positive' : overallScore > 40 ? 'neutral' : 'negative',
    confidence: Math.min(overallScore / 10, 10),
    communicationScore: Math.round(overallScore * 0.8),
    technicalScore: type === 'technical' ? overallScore : Math.round(overallScore * 0.6),
    behavioralScore: type === 'behavioral' ? overallScore : Math.round(overallScore * 0.7)
  };
}

function generateFeedback(evaluation, type) {
  const { overallScore } = evaluation;

  let overallFeedback = "";
  if (overallScore >= 80) {
    overallFeedback = "Outstanding performance! You demonstrated excellent knowledge and communication skills.";
  } else if (overallScore >= 60) {
    overallFeedback = "Good performance with room for improvement. Focus on deepening your technical knowledge.";
  } else {
    overallFeedback = "Needs significant improvement. Consider more practice and study of fundamental concepts.";
  }

  const strengths = [];
  const areasToImprove = [];
  const recommendedResources = [];

  if (evaluation.communicationScore > 70) {
    strengths.push("Strong communication skills");
  } else {
    areasToImprove.push("Improve communication clarity");
  }

  if (evaluation.technicalScore > 70) {
    strengths.push("Solid technical foundation");
  } else {
    areasToImprove.push("Strengthen technical knowledge");
    recommendedResources.push("LeetCode", "GeeksforGeeks", "System Design Primer");
  }

  if (evaluation.behavioralScore > 70) {
    strengths.push("Good behavioral interview skills");
  } else {
    areasToImprove.push("Practice behavioral questions");
    recommendedResources.push("STAR method guide", "Behavioral interview prep");
  }

  return {
    strengths,
    areasToImprove,
    overallFeedback,
    recommendedResources
  };
}
