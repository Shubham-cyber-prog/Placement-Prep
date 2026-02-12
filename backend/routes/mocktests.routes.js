import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    tests: [
      { id: 1, name: "FAANG Mock Test", difficulty: "Hard" },
      { id: 2, name: "DSA Basics", difficulty: "Medium" }
    ]
  });
});

export default router;
