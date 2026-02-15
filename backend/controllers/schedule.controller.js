import InterviewSchedule from "../models/InterviewSchedule.model.js";
import User from "../models/User.js";
import { generateICSFile } from "../utils/icsGenerator.js";

// Create a new interview schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      participantId,
      participantName,
      participantEmail,
      interviewType,
      role,
      company,
      scheduledDate,
      scheduledTime,
      duration,
      timezone,
      meetingLink,
      notes
    } = req.body;

    const hostUserId = req.user._id;

    // Check for conflicting schedules
    const conflict = await InterviewSchedule.findOne({
      hostUserId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked"
      });
    }

    const schedule = new InterviewSchedule({
      hostUserId,
      participantId,
      participantName,
      participantEmail,
      interviewType,
      role,
      company,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: duration || 60,
      timezone: timezone || 'UTC',
      meetingLink: meetingLink || '',
      notes
    });

    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule,
      message: "Interview scheduled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
      error: error.message
    });
  }
};

// Get all schedules for current user (as host or participant)
export const getMySchedules = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10, type } = req.query;

    const query = {
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.interviewType = type;
    }

    const schedules = await InterviewSchedule.find(query)
      .populate('hostUserId', 'name email')
      .populate('participantId', 'name email')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InterviewSchedule.countDocuments(query);

    res.json({
      success: true,
      data: {
        schedules,
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
      message: "Failed to get schedules",
      error: error.message
    });
  }
};

// Get available time slots for a specific date and host
export const getAvailableSlots = async (req, res) => {
  try {
    const { hostId, date, timezone = 'UTC' } = req.query;

    if (!date || !hostId) {
      return res.status(400).json({
        success: false,
        message: "Host ID and date are required"
      });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get host's availability settings
    const hostSchedule = await InterviewSchedule.findOne({ hostUserId: hostId });
    
    const availability = hostSchedule?.availabilitySettings || {
      availableDays: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '18:00',
      slotDuration: 60
    };

    // Check if the day is available
    if (!availability.availableDays.includes(dayOfWeek)) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: "Host is not available on this day",
          slots: []
        }
      });
    }

    // Get booked slots for the date
    const bookedSlots = await InterviewSchedule.find({
      hostUserId: hostId,
      scheduledDate: targetDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('scheduledTime duration');

    // Generate available slots
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
      bookedSlots
    );

    res.json({
      success: true,
      data: {
        available: true,
        date: date,
        timezone,
        slots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get available slots",
      error: error.message
    });
  }
};

// Get upcoming interviews
export const getUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const now = new Date();

    const schedules = await InterviewSchedule.find({
      $or: [
        { hostUserId: userId, status: { $in: ['pending', 'confirmed'] } },
        { participantId: userId, status: { $in: ['pending', 'confirmed'] } }
      ],
      scheduledDate: { $gte: now }
    })
      .populate('hostUserId', 'name email')
      .populate('participantId', 'name email')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming interviews",
      error: error.message
    });
  }
};

// Get specific schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ]
    })
      .populate('hostUserId', 'name email')
      .populate('participantId', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get schedule",
      error: error.message
    });
  }
};

// Update/reschedule an interview
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      scheduledDate,
      scheduledTime,
      duration,
      timezone,
      meetingLink,
      notes,
      interviewType,
      role,
      company
    } = req.body;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      hostUserId: userId
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    if (!schedule.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: "This interview cannot be rescheduled"
      });
    }

    // Check for conflicts if date/time is being changed
    if (scheduledDate || scheduledTime) {
      const newDate = scheduledDate ? new Date(scheduledDate) : schedule.scheduledDate;
      const newTime = scheduledTime || schedule.scheduledTime;

      const conflict = await InterviewSchedule.findOne({
        hostUserId: userId,
        scheduledDate: newDate,
        scheduledTime: newTime,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: id }
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked"
        });
      }
    }

    // Update fields
    if (scheduledDate) schedule.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) schedule.scheduledTime = scheduledTime;
    if (duration) schedule.duration = duration;
    if (timezone) schedule.timezone = timezone;
    if (meetingLink !== undefined) schedule.meetingLink = meetingLink;
    if (notes !== undefined) schedule.notes = notes;
    if (interviewType) schedule.interviewType = interviewType;
    if (role !== undefined) schedule.role = role;
    if (company !== undefined) schedule.company = company;

    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: "Interview rescheduled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error.message
    });
  }
};

// Confirm a pending interview
export const confirmSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    if (schedule.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending interviews can be confirmed"
      });
    }

    schedule.status = 'confirmed';
    schedule.confirmedAt = new Date();

    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: "Interview confirmed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to confirm schedule",
      error: error.message
    });
  }
};

// Cancel an interview
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    if (!schedule.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: "This interview cannot be cancelled"
      });
    }

    schedule.status = 'cancelled';
    schedule.cancelledAt = new Date();
    schedule.cancelledBy = userId;
    schedule.cancellationReason = reason || '';

    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: "Interview cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel schedule",
      error: error.message
    });
  }
};

// Add feedback after interview
export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      rating,
      technicalSkills,
      communication,
      problemSolving,
      comments,
      strengths,
      areasToImprove
    } = req.body;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ],
      status: 'completed'
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Completed interview not found"
      });
    }

    // Check if feedback already submitted
    if (schedule.feedback?.rating) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted"
      });
    }

    schedule.feedback = {
      rating,
      technicalSkills,
      communication,
      problemSolving,
      comments,
      strengths: strengths || [],
      areasToImprove: areasToImprove || [],
      submittedAt: new Date()
    };

    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message
    });
  }
};

// Get feedback for an interview
export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ],
      status: 'completed'
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json({
      success: true,
      data: {
        feedback: schedule.feedback,
        interviewType: schedule.interviewType,
        scheduledDate: schedule.scheduledDate,
        role: schedule.role,
        company: schedule.company
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get feedback",
      error: error.message
    });
  }
};

// Update availability settings
export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { availabilitySettings } = req.body;

    let schedule = await InterviewSchedule.findOne({ hostUserId: userId });

    if (!schedule) {
      // Create a new schedule document for availability settings
      schedule = new InterviewSchedule({
        hostUserId: userId,
        participantName: '',
        participantEmail: '',
        interviewType: 'mock',
        scheduledDate: new Date(),
        scheduledTime: '00:00',
        availabilitySettings
      });
    } else {
      schedule.availabilitySettings = availabilitySettings;
    }

    await schedule.save();

    res.json({
      success: true,
      data: schedule.availabilitySettings,
      message: "Availability settings updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message
    });
  }
};

// Get availability settings
export const getAvailability = async (req, res) => {
  try {
    const userId = req.user._id;

    const schedule = await InterviewSchedule.findOne({ hostUserId: userId });

    const defaultSettings = {
      availableDays: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '18:00',
      slotDuration: 60
    };

    res.json({
      success: true,
      data: schedule?.availabilitySettings || defaultSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get availability",
      error: error.message
    });
  }
};

// Export schedule to ICS file
export const exportToICS = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const schedule = await InterviewSchedule.findOne({
      _id: id,
      $or: [
        { hostUserId: userId },
        { participantId: userId }
      ]
    }).populate('hostUserId', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    const icsContent = generateICSFile(schedule);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export to ICS",
      error: error.message
    });
  }
};

// Get mentors/peers for scheduling
export const getAvailableHosts = async (req, res) => {
  try {
    const { type = 'mentor' } = req.query;
    
    // In a real app, you'd have a way to distinguish mentors from regular users
    // For now, we'll return all users who have set up availability
    const hosts = await InterviewSchedule.find({
      availabilitySettings: { $exists: true }
    }).populate('hostUserId', 'name email');

    const formattedHosts = hosts.map(h => ({
      _id: h.hostUserId._id,
      name: h.hostUserId.name,
      email: h.hostUserId.email,
      availabilitySettings: h.availabilitySettings
    }));

    res.json({
      success: true,
      data: formattedHosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get available hosts",
      error: error.message
    });
  }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, slotDuration, bookedSlots) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  const bookedTimes = bookedSlots.map(b => ({
    time: b.scheduledTime,
    duration: b.duration || 60
  }));

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Check if slot is booked
    const isBooked = bookedTimes.some(booked => {
      if (booked.time === timeStr) return true;
      // Check overlapping slots
      const [bookedHour, bookedMin] = booked.time.split(':').map(Number);
      const bookedEndMin = bookedMin + booked.duration;
      const bookedEndHour = bookedHour + Math.floor(bookedEndMin / 60);
      const actualBookedEndMin = bookedEndMin % 60;
      
      const currentEndMin = currentMin + slotDuration;
      const currentEndHour = currentHour + Math.floor(currentEndMin / 60);
      const actualCurrentEndMin = currentEndMin % 60;
      
      return (currentHour < bookedEndHour || (currentHour === bookedEndHour && currentMin < actualBookedEndMin)) &&
             (bookedHour < currentEndHour || (bookedHour === currentEndHour && bookedMin < actualCurrentEndMin));
    });

    if (!isBooked) {
      slots.push({
        time: timeStr,
        available: true
      });
    }

    // Move to next slot
    currentMin += slotDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

export default {
  createSchedule,
  getMySchedules,
  getAvailableSlots,
  getUpcomingInterviews,
  getScheduleById,
  updateSchedule,
  confirmSchedule,
  cancelSchedule,
  addFeedback,
  getFeedback,
  updateAvailability,
  getAvailability,
  exportToICS,
  getAvailableHosts
};
