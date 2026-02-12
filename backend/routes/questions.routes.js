import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    questions: [
      { id: 1, question: "Explain closure in JavaScript", difficulty: "Medium" },
      { id: 2, question: "What is React virtual DOM?", difficulty: "Easy" }
    ]
  });
});

export default router;
