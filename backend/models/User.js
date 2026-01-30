import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    progressStats: {
        totalTestsTaken: { type: Number, default: 0 },
        averageAccuracy: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        lastActive: { type: Date, default: Date.now }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user profile (without password)
userSchema.methods.toProfileJSON = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        progressStats: this.progressStats,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const User = mongoose.model("User", userSchema);

export default User;