/**
 * Generate ICS (iCalendar) file content for interview schedules
 */

export const generateICSFile = (schedule) => {
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = new Date(`${schedule.scheduledDate.toISOString().split('T')[0]}T${schedule.scheduledTime}:00`);
  const endDate = new Date(startDate.getTime() + (schedule.duration || 60) * 60000);

  const uid = `${schedule._id}@placementprep`;
  const dtstamp = formatDate(new Date());
  const dtstart = formatDate(startDate);
  const dtend = formatDate(endDate);

  const interviewTypes = {
    'technical': 'Technical Interview',
    'behavioral': 'Behavioral Interview',
    'system-design': 'System Design Interview',
    'hr': 'HR Interview',
    'mock': 'Mock Interview',
    'peer': 'Peer Interview',
    'mentor': 'Mentor Session'
  };

  const statusValues = {
    'pending': 'TENTATIVE',
    'confirmed': 'CONFIRMED',
    'cancelled': 'CANCELLED',
    'completed': 'CONFIRMED'
  };

  const summary = interviewTypes[schedule.interviewType] || 'Interview';
  const description = `Interview Type: ${summary}\\nRole: ${schedule.role || 'N/A'}\\nCompany: ${schedule.company || 'N/A'}\\nNotes: ${schedule.notes || 'N/A'}`;
  const location = schedule.meetingLink || 'TBD';

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Placement Prep//Interview Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:${statusValues[schedule.status] || 'TENTATIVE'}
ORGANIZER:mailto:host@placementprep.com
ATTENDEE;CN=${schedule.participantName};PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${schedule.participantEmail}
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

/**
 * Generate Google Calendar URL for direct calendar addition
 */
export const generateGoogleCalendarUrl = (schedule) => {
  const startDate = new Date(`${schedule.scheduledDate.toISOString().split('T')[0]}T${schedule.scheduledTime}:00`);
  const endDate = new Date(startDate.getTime() + (schedule.duration || 60) * 60000);

  const formatForGoogle = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const interviewTypes = {
    'technical': 'Technical Interview',
    'behavioral': 'Behavioral Interview',
    'system-design': 'System Design Interview',
    'hr': 'HR Interview',
    'mock': 'Mock Interview',
    'peer': 'Peer Interview',
    'mentor': 'Mentor Session'
  };

  const title = interviewTypes[schedule.interviewType] || 'Interview';
  const details = `Interview Type: ${title}\\nRole: ${schedule.role || 'N/A'}\\nCompany: ${schedule.company || 'N/A'}`;
  const location = schedule.meetingLink || '';

  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: title,
    dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
    details: details,
    location: location,
    sf: 'true',
    output: 'xml'
  });

  return `${baseUrl}&${params.toString()}`;
};

/**
 * Generate Outlook Web Calendar URL
 */
export const generateOutlookCalendarUrl = (schedule) => {
  const startDate = new Date(`${schedule.scheduledDate.toISOString().split('T')[0]}T${schedule.scheduledTime}:00`);
  const endDate = new Date(startDate.getTime() + (schedule.duration || 60) * 60000);

  const formatForOutlook = (date) => {
    return date.toISOString();
  };

  const interviewTypes = {
    'technical': 'Technical Interview',
    'behavioral': 'Behavioral Interview',
    'system-design': 'System Design Interview',
    'hr': 'HR Interview',
    'mock': 'Mock Interview',
    'peer': 'Peer Interview',
    'mentor': 'Mentor Session'
  };

  const title = interviewTypes[schedule.interviewType] || 'Interview';
  const details = `Interview Type: ${title}\\nRole: ${schedule.role || 'N/A'}\\nCompany: ${schedule.company || 'N/A'}`;
  const location = schedule.meetingLink || '';

  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: title,
    startdt: formatForOutlook(startDate),
    enddt: formatForOutlook(endDate),
    body: details,
    location: location,
    allday: 'false'
  });

  return `${baseUrl}&${params.toString()}`;
};

export default {
  generateICSFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl
};
