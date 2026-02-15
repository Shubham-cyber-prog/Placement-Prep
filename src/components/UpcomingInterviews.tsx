import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

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
}

const INTERVIEW_TYPES: { [key: string]: string } = {
  'technical': 'Technical',
  'behavioral': 'Behavioral',
  'system-design': 'System Design',
  'hr': 'HR',
  'mock': 'Mock',
  'peer': 'Peer',
  'mentor': 'Mentor'
};

const UpcomingInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingInterviews();
  }, []);

  const fetchUpcomingInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schedules/upcoming?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInterviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilInterview = (date: string, time: string) => {
    const interviewDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    const diff = interviewDateTime.getTime() - now.getTime();

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Timer className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Upcoming Interviews</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming interviews</p>
          <p className="text-sm text-gray-400 mt-1">Schedule one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Upcoming Interviews</h3>
        </div>
        <span className="text-sm text-gray-500">{interviews.length} scheduled</span>
      </div>

      <div className="space-y-3">
        {interviews.map(interview => {
          const timeUntil = getTimeUntilInterview(interview.scheduledDate, interview.scheduledTime);
          
          return (
            <div
              key={interview._id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(interview.status)}`}>
                      {INTERVIEW_TYPES[interview.interviewType] || interview.interviewType}
                    </span>
                    {getStatusIcon(interview.status)}
                  </div>
                  
                  <p className="font-medium text-gray-900 mt-1 truncate">
                    {interview.participantName}
                  </p>
                  
                  {interview.role && (
                    <p className="text-sm text-gray-500 truncate">
                      {interview.role}
                      {interview.company && ` at ${interview.company}`}
                    </p>
                  )}
                </div>

                <div className="text-right ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">{interview.scheduledTime}</p>
                  <p className={`text-xs font-medium mt-1 ${
                    timeUntil === 'Past' ? 'text-gray-400' :
                    timeUntil.includes('d') ? 'text-blue-600' :
                    timeUntil.includes('h') ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {timeUntil === 'Past' ? 'Past' : `in ${timeUntil}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {interview.meetingLink && interview.status === 'confirmed' && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Video className="w-4 h-4" />
                    Join
                  </a>
                )}
                <button
                  onClick={() => {
                    toast.info('View details coming soon');
                  }}
                  className="flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {interviews.length > 0 && (
        <button
          onClick={() => {
            // Navigate to full scheduler
            window.location.href = '/interview-scheduler';
          }}
          className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition flex items-center justify-center gap-1"
        >
          View All Interviews
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default UpcomingInterviews;
