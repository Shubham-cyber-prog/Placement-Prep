import mongoose from "mongoose";

const mentorshipRequestSchema = new mongoose.Schema({
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  category: {
    type: String,
    enum: ['Data Structures', 'Algorithms', 'System Design', 'Frontend', 'Backend', 'Databases', 'OOP', 'Resume Review', 'Mock Interview', 'Career Advice'],
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    timeSlots: [String]
  }],
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  scheduledSession: {
    date: Date,
    duration: Number, // in minutes
    meetingLink: String,
    notes: String
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: {
    type: String
  },
  
  isPaid: {
    type: Boolean,
    default: false
  },
  
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
mentorshipRequestSchema.index({ menteeId: 1, status: 1 });
mentorshipRequestSchema.index({ mentorId: 1, status: 1 });
mentorshipRequestSchema.index({ category: 1, status: 1 });

const Mentorship = mongoose.model('Mentorship', mentorshipRequestSchema);
export default Mentorship;