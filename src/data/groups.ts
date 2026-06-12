export interface EventGroup {
  id: string;
  name: string;
  description: string;
  category: 'language' | 'role' | 'topic' | 'interest';
  icon: string;
  color: string;
  meetTime?: string; // HH:MM Amsterdam
  meetDay?: 1 | 2;
  meetPlace: string;
  meetPlaceColor: string;
  maxMembers: number;
  going: number; // baseline attendees already going
  discord: string; // community link that lives on after the event
  discussions: string[]; // example talking points the community gathers around
  tags: string[];
}

export const GROUPS: EventGroup[] = [
  {
    id: 'react',
    name: 'React Developers',
    description: 'Building with React, Next.js, RSC — share patterns, war stories, and roadmap thoughts.',
    category: 'language',
    icon: '⚛️',
    color: '#61dafb',
    meetTime: '12:30',
    meetDay: 1,
    meetPlace: 'Coffee Point',
    meetPlaceColor: '#795548',
    maxMembers: 20, going: 15, discord: 'https://discord.gg/devconnect',
    discussions: ["Server components in production?", "Next.js vs Remix", "State management in 2026"],
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    id: 'mobile',
    name: 'Mobile Devs',
    description: 'iOS, Android, Flutter, React Native — cross-platform challenges and native wins.',
    category: 'language',
    icon: '📱',
    color: '#6c63ff',
    meetTime: '16:00',
    meetDay: 1,
    meetPlace: 'Working Zone',
    meetPlaceColor: '#1565c0',
    maxMembers: 15, going: 12, discord: 'https://discord.gg/devconnect',
    discussions: ["React Native vs Flutter — real talk", "App Store & TestFlight war stories", "Native or cross-platform?"],
    tags: ['iOS', 'Android', 'Flutter', 'React Native'],
  },
  {
    id: 'founders',
    name: 'Founders & Product',
    description: 'Solo founders, PMs, and product builders — from 0-to-1 to scaling. Share your current challenge.',
    category: 'role',
    icon: '🚀',
    color: '#ff6f00',
    meetTime: '13:30',
    meetDay: 1,
    meetPlace: 'Food Court',
    meetPlaceColor: '#2e7d32',
    maxMembers: 12, going: 10, discord: 'https://discord.gg/devconnect',
    discussions: ["Side projects & weekend hacks", "Freelance vs full-time", "Pricing your first SaaS"],
    tags: ['Startup', 'Product', 'B2B', 'B2C'],
  },
  {
    id: 'design',
    name: 'Designers & UX',
    description: 'UI, UX, design systems, accessibility. Show your work or bring a problem to solve together.',
    category: 'role',
    icon: '🎨',
    color: '#e91e8c',
    meetTime: '11:00',
    meetDay: 1,
    meetPlace: 'Web Engineering Track',
    meetPlaceColor: '#e65100',
    maxMembers: 15, going: 12, discord: 'https://discord.gg/devconnect',
    discussions: ["Design tokens that scale", "Figma vs code-first", "Accessibility from day one"],
    tags: ['Figma', 'Design Systems', 'Accessibility'],
  },
  {
    id: 'ai-builders',
    name: 'AI Builders',
    description: "Building with LLMs, agents, RAG, and AI-powered products. What's your stack?",
    category: 'topic',
    icon: '🤖',
    color: '#7b1fa2',
    meetTime: '14:30',
    meetDay: 1,
    meetPlace: 'Working Zone',
    meetPlaceColor: '#1565c0',
    maxMembers: 20, going: 15, discord: 'https://discord.gg/devconnect',
    discussions: ["LLM products — what actually ships?", "RAG vs fine-tuning", "Agents in production"],
    tags: ['LLM', 'Agents', 'AI', 'Anthropic', 'OpenAI'],
  },
  {
    id: 'adhd',
    name: 'ADHD & Focus',
    description: 'Neurodivergent devs and focus nerds — share your systems, tools, and hacks for staying productive.',
    category: 'interest',
    icon: '🧠',
    color: '#3949ab',
    meetTime: '10:30',
    meetDay: 2,
    meetPlace: 'Coffee Point',
    meetPlaceColor: '#795548',
    maxMembers: 10, going: 9, discord: 'https://discord.gg/devconnect',
    discussions: ["Focus & productivity systems", "Best timers for deep work", "Beating procrastination"],
    tags: ['ADHD', 'Productivity', 'Focus', 'Neurodiversity'],
  },
  {
    id: 'health-tech',
    name: 'Health & Wellness Tech',
    description: 'Building apps for health, fitness, mental wellness, wearables, cycles, sleep. Discuss and connect.',
    category: 'interest',
    icon: '💚',
    color: '#2e7d32',
    meetTime: '11:30',
    meetDay: 2,
    meetPlace: 'Food Court',
    meetPlaceColor: '#2e7d32',
    maxMembers: 12, going: 10, discord: 'https://discord.gg/devconnect',
    discussions: ["Health apps & wearables", "Burnout & sustainable dev pace", "Wearable data you actually use"],
    tags: ['HealthTech', 'Wearables', 'Apple Watch', 'Mental Health'],
  },
  {
    id: 'dutch',
    name: 'Dutch / Netherlands',
    description: 'Local Amsterdam & Netherlands-based devs — city recommendations, co-working spots, and local community.',
    category: 'topic',
    icon: '🇳🇱',
    color: '#d32f2f',
    meetTime: '16:30',
    meetDay: 1,
    meetPlace: 'Food Court',
    meetPlaceColor: '#2e7d32',
    maxMembers: 25, going: 18, discord: 'https://discord.gg/devconnect',
    discussions: ["Best coworking in Amsterdam", "Where to eat near the venue", "Weekend trips from NL"],
    tags: ['Amsterdam', 'Netherlands', 'Local'],
  },
];

export const CATEGORY_LABELS: Record<EventGroup['category'], string> = {
  language: 'Tech Stack',
  role: 'Role',
  topic: 'Topic',
  interest: 'Interest',
};
