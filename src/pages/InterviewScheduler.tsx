import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle,
  MapPin,
  Star,
  Send,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface InterviewSchedule {
  _id: string;
  hostUserId: { _id: string; name: string; email: string };
  participantId?: { _id: string; name: string; email: string };
  participantName: string;
  participantEmail: string;
  interviewType: string;
  role: string;
  company: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  meetingLink: string;
  notes: string;
  feedback?: {
    rating: number;
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    comments: string;
    strengths: string[];
    areasToImprove: string[];
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Host {
  _id: string;
  name: string;
  email: string;
  availabilitySettings: {
    availableDays: number[];
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}

const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical Interview' },
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'system-design', label: 'System Design' },
  { value: 'hr', label: 'HR Interview' },
  { value: 'mock', label: 'Mock Interview' },
  { value: 'peer', label: 'Peer Practice' },
  { value: 'mentor', label: 'Mentor Session' }
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const InterviewScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  // Form state
  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    interviewType: 'technical',
    role: '',
    company: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    timezone: 'UTC',
    meetingLink: '',
    notes: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchHosts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data.schedules);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async () => {
    try {
      const response = await fetch('/api/schedules/available-hosts');
      const data = await response.json();
      if (data.success) {
        setHosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
    }
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const token = localStorage.getItem('token');
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/schedules/available-slots?hostId=${localStorage.getItem('userId')}&date=${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Interview scheduled successfully!');
        setShowModal(false);
        resetForm();
        fetchSchedules();
      } else {
        toast.error(data.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schedules/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Interview cancelled successfully');
        fetchSchedules();
      } else {
        toast.error(data.message || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      toast.error('Failed to cancel interview');
    }
  };

  const handleExport = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schedules/${id}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${id}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Calendar event exported');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export calendar event');
    }
  };

  const resetForm = () => {
    setFormData({
      participantName: '',
      participantEmail: '',
      interviewType: 'technical',
      role: '',
      company: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      timezone: 'UTC',
      meetingLink: '',
      notes: ''
    });
    setSelectedDate(null);
    setAvailableSlots([]);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isDateSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasScheduleOnDay = (day: number) => {
    return schedules.some(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate);
      return (
        scheduleDate.getDate() === day &&
        scheduleDate.getMonth() === currentDate.getMonth() &&
        scheduleDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingSchedules = schedules
    .filter(s => new Date(s.scheduledDate) >= new Date() && s.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Scheduler</h1>
            <p className="text-gray-600 mt-1">Schedule and manage your mock interviews</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md transition ${view === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md transition ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Schedule Interview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentDate).map((day, index) => (
                  <button
                    key={index}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`
                      relative p-2 min-h-[80px] border rounded-lg transition
                      ${!day ? 'border-transparent' : 'border-gray-200 hover:border-blue-300'}
                      ${isDateSelected(day) ? 'bg-blue-50 border-blue-500' : ''}
                      ${day && !isDateSelected(day) ? 'bg-white' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <span className={`text-sm ${hasScheduleOnDay(day) ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                          {day}
                        </span>
                        {hasScheduleOnDay(day) && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Available Slots */}
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">
                    Available slots for {selectedDate.toLocaleDateString()}
                  </h3>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setFormData({
                            ...formData,
                            scheduledDate: selectedDate.toISOString().split('T')[0],
                            scheduledTime: slot.time
                          })}
                          disabled={!slot.available}
                          className={`
                            p-2 text-sm rounded-lg border transition
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                            ${formData.scheduledTime === slot.time ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:border-blue-400'}
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No available slots for this date</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Interviews</h3>
              {upcomingSchedules.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSchedules.map(schedule => (
                    <div key={schedule._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {INTERVIEW_TYPES.find(t => t.value === schedule.interviewType)?.label}
                          </p>
                          <p className="text-sm text-gray-600">{schedule.participantName}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(schedule.scheduledDate).toLocaleDateString()} at {schedule.scheduledTime}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {schedule.meetingLink && (
                          <a
                            href={schedule.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Video className="w-4 h-4" />
                            Join
                          </a>
                        )}
                        <button
                          onClick={() => handleExport(schedule._id)}
                          className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming interviews</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{schedules.filter(s => s.status === 'completed').length}</p>
                  <p className="text-sm text-blue-600">Completed</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{schedules.filter(s => s.status === 'pending').length}</p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{schedules.filter(s => s.status === 'confirmed').length}</p>
                  <p className="text-sm text-green-600">Confirmed</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{schedules.length}</p>
                  <p className="text-sm text-purple-600">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Schedule New Interview</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Participant Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participant Name
                      </label>
                      <input
                        type="text"
                        value={formData.participantName}
                        onChange={e => setFormData({ ...formData, participantName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participant Email
                      </label>
                      <input
                        type="email"
                        value={formData.participantEmail}
                        onChange={e => setFormData({ ...formData, participantEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Interview Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interview Type
                    </label>
                    <select
                      value={formData.interviewType}
                      onChange={e => setFormData({ ...formData, interviewType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {INTERVIEW_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Role & Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Google"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <select
                        value={formData.scheduledTime}
                        onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select time</option>
                        {availableSlots.filter(s => s.available).map(slot => (
                          <option key={slot.time} value={slot.time}>{slot.time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Duration & Timezone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <select
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Schedule Interview
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewScheduler;
