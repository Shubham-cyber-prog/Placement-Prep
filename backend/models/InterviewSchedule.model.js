import mongoose from "mongoose";

const interviewScheduleSchema = new mongoose.Schema({
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  participantName: {
    type: String,
    required: true
  },
  participantEmail: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'system-design', 'hr', 'mock', 'peer', 'mentor'],
    required: true
  },
  role: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'in-progress'],
    default: 'pending'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  calendarEventId: {
    type: String,
    default: null
  },
  calendarProvider: {
    type: String,
    enum: ['google', 'outlook', 'none'],
    default: 'none'
  },
  availabilitySettings: {
    availableDays: {
      type: [Number], // 0-6 (Sunday-Saturday)
      default: [1, 2, 3, 4, 5] // Monday-Friday
    },
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '18:00'
    },
    slotDuration: {
      type: Number,
      default: 60 // minutes
    }
  },
  reminders: {
    email24h: {
      type: Boolean,
      default: true
    },
    email1h: {
      type: Boolean,
      default: true
    },
    pushNotification: {
      type: Boolean,
      default: true
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    technicalSkills: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comments: {
      type: String,
      default: ''
    },
    strengths: {
      type: [String],
      default: []
    },
    areasToImprove: {
      type: [String],
      default: []
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  }
});

// Index for efficient queries
interviewScheduleSchema.index({ hostUserId: 1, scheduledDate: 1 });
interviewScheduleSchema.index({ participantId: 1, scheduledDate: 1 });
interviewScheduleSchema.index({ status: 1 });

// Pre-save middleware to update timestamp
interviewScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted date-time
interviewScheduleSchema.virtual('scheduledDateTime').get(function() {
  return new Date(`${this.scheduledDate.toISOString().split('T')[0]}T${this.scheduledTime}:00`);
});

// Method to check if interview can be cancelled
interviewScheduleSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if interview can be rescheduled
interviewScheduleSchema.methods.canBeRescheduled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

export default mongoose.model('InterviewSchedule', interviewScheduleSchema);
