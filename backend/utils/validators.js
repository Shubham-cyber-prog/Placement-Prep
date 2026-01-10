export const validateRegisterInput = (name, email, password) => {
    const errors = [];
    if (!name || name.trim().length === 0) errors.push("Name is required");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Valid email is required");
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
    return { valid: errors.length === 0, errors };
};

export const validateLoginInput = (email, password) => {
    const errors = [];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Valid email is required");
    if (!password) errors.push("Password is required");
    return { valid: errors.length === 0, errors };
};

export const validateProblemInput = (title, difficulty) => {
    const errors = [];
    if (!title || title.trim().length === 0) errors.push("Title is required");
    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!difficulty || !validDifficulties.includes(difficulty)) {
        errors.push(`Difficulty must be one of: ${validDifficulties.join(", ")}`);
    }
    return { valid: errors.length === 0, errors };
};
