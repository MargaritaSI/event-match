export interface Session {
  id: string;
  day: 1 | 2;
  time: string; // HH:MM
  endTime: string;
  title: string;
  speaker?: string;
  speakerCompany?: string;
  description?: string;
  location: string;
  locationColor: string;
  type: 'keynote' | 'talk' | 'workshop' | 'networking' | 'break' | 'hackathon';
}

export const SESSIONS: Session[] = [
  // Day 1
  { id: 'd1-1', day: 1, time: '09:30', endTime: '10:00', title: 'Hackathon Kicks Off — Challenge Revealed & Team Formation', speaker: 'Organisers', speakerCompany: 'DevConnect', description: 'Welcome, challenge brief and team formation. Find teammates and pick your Kendo UI idea.', location: 'Web Engineering Track', locationColor: '#e65100', type: 'hackathon' },
  { id: 'd1-2', day: 1, time: '10:00', endTime: '13:00', title: 'Hacking Begins', description: 'Heads-down building time. Mentors roam the working zone.', location: 'Working Zone', locationColor: '#1565c0', type: 'hackathon' },
  { id: 'd1-3', day: 1, time: '11:00', endTime: '12:00', title: 'Mentorship Session: Product & Design', speaker: 'Sasha Petrova', speakerCompany: 'Figma', description: 'Drop-in product & design feedback. Bring your mockups and questions.', location: 'Working Zone', locationColor: '#1565c0', type: 'workshop' },
  { id: 'd1-4', day: 1, time: '12:30', endTime: '13:30', title: 'Lunch & Networking', description: 'Grab food and meet other hackers. Great time for a Random Coffee match.', location: 'Food Court', locationColor: '#2e7d32', type: 'break' },
  { id: 'd1-5', day: 1, time: '13:30', endTime: '16:00', title: 'Afternoon Hacking', description: 'Keep building. Sponsor reps available at booths for questions.', location: 'Working Zone', locationColor: '#1565c0', type: 'hackathon' },
  { id: 'd1-6', day: 1, time: '14:00', endTime: '15:00', title: 'Mentorship Session: Tech & Architecture', speaker: 'Lukas Müller', speakerCompany: 'GitLab', description: 'Architecture reviews and backend/DevOps help for your build.', location: 'Working Zone', locationColor: '#1565c0', type: 'workshop' },
  { id: 'd1-7', day: 1, time: '16:00', endTime: '18:00', title: 'Networking & Evening Sessions', description: 'Wind-down networking, lightning intros and community time.', location: 'Web Engineering Track', locationColor: '#e65100', type: 'networking' },

  // Day 2
  { id: 'd2-1', day: 2, time: '09:00', endTime: '12:00', title: 'Continued Hacking & Mentor Support', description: 'Final build push with mentors on hand.', location: 'Working Zone', locationColor: '#1565c0', type: 'hackathon' },
  { id: 'd2-2', day: 2, time: '10:00', endTime: '11:00', title: 'Mentorship: Pitching & Presentation', speaker: 'Noah Smith', speakerCompany: 'Sentry', description: 'How to pitch your project to judges. Structure, demo tips and storytelling.', location: 'Working Zone', locationColor: '#1565c0', type: 'workshop' },
  { id: 'd2-3', day: 2, time: '11:00', endTime: '12:00', title: 'Final Polish & Demo Prep', description: 'Last hour — polish UI, rehearse your demo, check submission.', location: 'Working Zone', locationColor: '#1565c0', type: 'hackathon' },
  { id: 'd2-4', day: 2, time: '12:00', endTime: '12:00', title: '🚨 Submissions Close', description: 'Hard deadline — make sure your project is submitted.', location: 'Online', locationColor: '#b71c1c', type: 'keynote' },
  { id: 'd2-5', day: 2, time: '12:00', endTime: '13:00', title: 'Lunch Break', description: 'Refuel before pitches.', location: 'Food Court', locationColor: '#2e7d32', type: 'break' },
  { id: 'd2-6', day: 2, time: '16:25', endTime: '17:00', title: 'Team Pitches & Judging', speaker: 'Judging Panel', speakerCompany: 'DevConnect', description: 'Teams pitch to the judges. Scored on code quality, design, creativity, functionality and presentation.', location: 'Web Engineering Track', locationColor: '#e65100', type: 'keynote' },
  { id: 'd2-7', day: 2, time: '17:00', endTime: '18:00', title: '🏆 Winners Announced & Prizes Awarded', description: 'Results and prizes. Congrats to all who shipped!', location: 'Web Engineering Track', locationColor: '#e65100', type: 'keynote' },
];

// Amsterdam CEST = UTC+2
export function getNowAmsterdam(): { day: 1 | 2; time: string } {
  const now = new Date();
  const amsterdam = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
  const h = amsterdam.getHours().toString().padStart(2, '0');
  const m = amsterdam.getMinutes().toString().padStart(2, '0');
  const dayOfMonth = amsterdam.getDate();
  return {
    day: dayOfMonth <= 11 ? 1 : 2,
    time: `${h}:${m}`,
  };
}

export function isSessionNow(s: Session, now: { day: 1 | 2; time: string }): boolean {
  if (s.day !== now.day) return false;
  return s.time <= now.time && now.time < s.endTime;
}

export function isSessionUpcoming(s: Session, now: { day: 1 | 2; time: string }): boolean {
  if (s.day !== now.day) return false;
  const diff = timeToMinutes(s.time) - timeToMinutes(now.time);
  return diff > 0 && diff <= 60;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
