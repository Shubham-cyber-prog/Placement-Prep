# Sliding Window Technique

## 📌 What is Sliding Window?
Sliding Window is an optimization technique used to reduce time complexity 
from O(n²) to O(n) for problems involving subarrays or substrings.

## 🧠 Types of Sliding Window
### 1. Fixed Size Window
Window size remains constant.
Example: Maximum sum subarray of size K.

### 2. Variable Size Window
Window size changes based on conditions.
Example: Longest substring without repeating characters.

## ⏱️ Time & Space Complexity
- Time Complexity: O(n)
- Space Complexity: O(1) or O(k)

## ✅ When to Use Sliding Window
- Subarrays / substrings
- Maximum or minimum window problems
- Counting problems with constraints

## ❌ Common Mistakes
- Forgetting to shrink the window
- Wrong condition in while loop
- Not updating answer at the right time
