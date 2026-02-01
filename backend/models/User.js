import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
    required: function() {
      return !this.isOAuth;
    }
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  isOAuth: {
    type: Boolean,
    default: false
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github', null],
    default: null
  },
  oauthId: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  profile: {
    bio: String,
    location: String,
    website: String,
    github: String,
    linkedin: String,
    twitter: String,
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: Number
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    skills: [String],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired', 'past_due'],
      default: 'active'
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isOAuth) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isOAuth) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;