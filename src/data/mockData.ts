import type { User } from '../types';

export const EVENT_NAME = 'DevConnect 2026';
const EVENT = EVENT_NAME;
const G = ['#6c63ff', '#f06292', '#26a69a', '#ff7043', '#5c6bc0', '#ec407a', '#66bb6a', '#ab47bc', '#ffa726', '#42a5f5'];

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Margarita',
  role: 'iOS Developer',
  company: 'Indie',
  bio: 'Building apps for health & productivity. Into wearables, cycle tracking and focus tools.',
  interests: ['health', 'mobile', 'startup', 'design'],
  skills: ['Swift', 'UI/UX', 'Running'],
  hobbies: ['Running', 'Sketching', 'Cold water swimming'],
  lookingFor: 'A backend dev to pair on a health app side-project',
  canHelp: 'iOS/SwiftUI, App Store submission, HealthKit',
  intents: ['cofounder', 'learning'],
  socials: { twitter: '@margarita', instagram: '@margarita.dev' },
  event: EVENT,
  photoColor: '#6c63ff',
};

export const INTENT_LABELS: Record<string, string> = {
  hiring: '🧲 Hiring',
  job: '💼 Open to work',
  cofounder: '🤝 Find co-founder',
  clients: '📈 Find clients',
  invest: '💰 Investing',
  mentor: '🧭 Mentoring',
  learning: '📚 Here to learn',
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Carter', role: 'Founder', company: 'Lexi AI', bio: 'Building an AI writing tool with TypeScript & Python. Looking for UX help and early users.', interests: ['ai', 'startup', 'design'], intents: ['cofounder', 'hiring'], skills: ['TypeScript', 'Python', 'AI graphics'], hobbies: ['Chess', 'Bouldering'], lookingFor: 'A UX designer for design feedback', canHelp: 'Fundraising, LLM product strategy, Python', speaker: true, speakerTopic: 'From idea to AI product in 6 weeks', socials: { twitter: '@alex_founder', linkedin: 'alex-carter' }, event: EVENT, photoColor: G[0] },
  { id: '2', name: 'Maya Bennett', role: 'UX Designer', company: 'Figma', bio: 'Design systems & accessibility. Into web design and graphic design. Yoga and running.', interests: ['design', 'sport', 'frontend'], intents: ['job', 'learning'], skills: ['UI/UX', 'Web design', 'Graphic design', 'Yoga', 'Running'], hobbies: ['Yoga', 'Pottery', 'Running'], lookingFor: 'A new design role at a product company', canHelp: 'Figma, UI/UX, graphic design, accessibility', speaker: true, speakerTopic: 'Design systems that scale', socials: { twitter: '@maya_ux', instagram: '@maya.design' }, event: EVENT, photoColor: G[1] },
  { id: '3', name: 'Olivia Reed', role: 'Tech Recruiter', company: 'HireLoop', bio: 'I connect engineers with great teams and run networking events.', interests: ['networking', 'startup', 'business'], intents: ['hiring'], skills: [], hobbies: ['Travel', 'Wine tasting'], lookingFor: 'Senior React & mobile engineers who are hiring-curious', canHelp: 'Intros, salary benchmarks, CV review', socials: { linkedin: 'olivia-reed', twitter: '@olivia_hr' }, event: EVENT, photoColor: G[2] },
  { id: '4', name: 'Liam Walsh', role: 'iOS Developer', company: 'Focusly', bio: 'I build focus and habit apps with Swift. Open to new roles. Drummer and cyclist.', interests: ['mobile', 'health', 'ai'], intents: ['job', 'learning'], skills: ['Swift', 'Cycling'], hobbies: ['Drumming', 'Cycling'], lookingFor: 'A senior iOS role, ideally in health-tech', canHelp: 'Swift, Core Data, on-device ML', socials: { twitter: '@liam_ios', instagram: '@liam.code' }, event: EVENT, photoColor: G[3] },
  { id: '5', name: 'Sara Lindqvist', role: 'Running Coach', company: 'RunWell', bio: 'I write about healthy living and coach runners on the side.', interests: ['sport', 'health', 'travel'], intents: ['clients', 'mentor'], skills: ['Running', 'Cycling'], hobbies: ['Marathon', 'Running', 'Cooking'], lookingFor: 'A dev to build a simple training-log app with me', canHelp: 'Training plans, content, community building', socials: { instagram: '@sara.run', twitter: '@sara_sport' }, event: EVENT, photoColor: G[4] },
  { id: '6', name: 'Tom Bakker', role: 'Frontend Engineer', company: 'Vercel', bio: 'React & TypeScript nerd. Amsterdam local, happy to show people around.', interests: ['design', 'frontend', 'travel'], intents: ['job', 'cofounder'], skills: ['React', 'TypeScript', 'JavaScript', 'Football'], hobbies: ['Photography', 'Board games', 'Football'], lookingFor: 'Hackathon teammates and a new frontend role', canHelp: 'React, JavaScript, animations, local tips', speaker: true, speakerTopic: 'Edge rendering with React', socials: { twitter: '@tombakker', linkedin: 'tom-bakker' }, event: EVENT, photoColor: G[5] },
  { id: '7', name: 'Priya Sharma', role: 'ML Engineer', company: 'Cloudflare', bio: 'Work on recommendation systems in Python. Curious about health & wearables data.', interests: ['ai', 'health', 'data'], intents: ['job', 'learning'], skills: ['Python', 'Climbing'], hobbies: ['Climbing', 'Reading'], lookingFor: 'An ML role in health-tech', canHelp: 'ML pipelines, data science, Python', speaker: true, speakerTopic: 'Recommenders at the edge', socials: { linkedin: 'priya-sharma', twitter: '@priya_ml' }, event: EVENT, photoColor: G[6] },
  { id: '8', name: 'Marco Rossi', role: 'Startup Founder', company: 'PayLoop', bio: 'Second-time founder in fintech. Always up for a coffee chat.', interests: ['startup', 'networking', 'ai'], intents: ['cofounder', 'invest'], skills: ['Go', 'Running'], hobbies: ['Espresso', 'Running'], lookingFor: 'A technical co-founder for a new idea', canHelp: 'Go-to-market, sales, hiring', socials: { linkedin: 'marco-rossi', twitter: '@marco_r' }, event: EVENT, photoColor: G[7] },
  { id: '9', name: 'Yuki Tanaka', role: 'Mobile Developer', company: 'Picnic', bio: 'Flutter & React Native in Dart & Kotlin. Open to remote work. Surfer.', interests: ['mobile', 'startup', 'travel'], intents: ['job'], skills: ['Dart', 'Kotlin', 'Surfing'], hobbies: ['Anime', 'Surfing'], lookingFor: 'A remote mobile-dev role', canHelp: 'Flutter, Dart, Kotlin, app performance', socials: { twitter: '@yuki_dev', instagram: '@yuki.codes' }, event: EVENT, photoColor: G[8] },
  { id: '10', name: 'Emma Wilson', role: 'Product Manager', company: 'Calm', bio: 'PM in wellness apps. Into calm, focused UX. Hiker.', interests: ['health', 'business', 'design'], intents: ['hiring'], skills: ['UI/UX', 'Gym'], hobbies: ['Hiking', 'Journaling'], lookingFor: 'Designers & devs in the wellness space', canHelp: 'Product discovery, user research', socials: { linkedin: 'emma-wilson', twitter: '@emma_pm' }, event: EVENT, photoColor: G[9] },
  { id: '11', name: 'Jonas Hoffmann', role: 'Backend Engineer', company: 'GitLab', bio: 'Node & Go. I build APIs that scale and mentor juniors. Open to new roles. Climber.', interests: ['backend', 'startup', 'networking'], intents: ['job', 'mentor'], skills: ['Go', 'JavaScript', 'Climbing'], hobbies: ['Climbing', 'Brewing'], lookingFor: 'A staff backend role', canHelp: 'Go, Node.js, backend architecture, DevOps', socials: { twitter: '@jonas_be', linkedin: 'jonas-h' }, event: EVENT, photoColor: G[0] },
  { id: '12', name: 'Sofia Garcia', role: 'Designer & Illustrator', company: 'Studio Forma', bio: 'Brand and graphic design. I draw conference sketchnotes for fun.', interests: ['design', 'travel', 'networking'], intents: ['clients'], skills: ['Graphic design', 'Branding'], hobbies: ['Illustration', 'Salsa'], lookingFor: 'Founders who need a brand identity', canHelp: 'Branding, graphic design, illustration', socials: { instagram: '@sofia.draws', twitter: '@sofia_g' }, event: EVENT, photoColor: G[1] },
  { id: '13', name: 'Noah Bell', role: 'Developer Advocate', company: 'Sentry', bio: 'Developer advocate. I love connecting people and giving talks. Tennis player.', interests: ['networking', 'ai', 'startup'], intents: ['mentor'], skills: ['JavaScript', 'Tennis'], hobbies: ['Public speaking', 'Tennis'], lookingFor: 'Interesting projects to feature in talks', canHelp: 'Talks, community, content, intros', speaker: true, speakerTopic: 'Pitching your project to judges', socials: { twitter: '@noah_devrel', linkedin: 'noah-bell' }, event: EVENT, photoColor: G[2] },
  { id: '14', name: 'Anna Petersen', role: 'Data Scientist', company: 'Whoop', bio: 'Health analytics in Python & R. I track sleep, HRV, mood. Open to new roles. Swimmer.', interests: ['health', 'data', 'sport'], intents: ['job'], skills: ['Python', 'Swimming'], hobbies: ['Quantified self', 'Swimming'], lookingFor: 'A data-science role in health-tech', canHelp: 'Stats, data viz, Python, wearable APIs', socials: { linkedin: 'anna-petersen', twitter: '@anna_data' }, event: EVENT, photoColor: G[3] },
  { id: '15', name: 'Ravi Patel', role: 'Fullstack Dev', company: 'Freelance', bio: 'I ship side-projects fast in JavaScript. Looking for my next gig. Cricket fan.', interests: ['startup', 'frontend', 'ai'], intents: ['job'], skills: ['JavaScript', 'TypeScript'], hobbies: ['Cricket', 'Cooking'], lookingFor: 'A fullstack role or contract', canHelp: 'JavaScript, fullstack, Supabase, rapid prototyping', socials: { twitter: '@ravi_builds', instagram: '@ravi.dev' }, event: EVENT, photoColor: G[4] },
  { id: '16', name: 'Julia Moreau', role: 'Frontend Lead', company: 'Nx', bio: 'Lead a React team. Passionate about DX and mentoring. Rock climber.', interests: ['frontend', 'startup', 'networking'], intents: ['hiring', 'mentor'], skills: ['React', 'TypeScript', 'Climbing'], hobbies: ['Rock climbing', 'Baking'], lookingFor: 'Engineers who care about developer experience', canHelp: 'React, TypeScript, team leadership', socials: { linkedin: 'julia-moreau', twitter: '@julia_fe' }, event: EVENT, photoColor: G[5] },
  { id: '17', name: 'Daniel Kim', role: 'Indie Hacker', company: 'Solo', bio: 'Bootstrapped two micro-SaaS. Love talking pricing and growth.', interests: ['startup', 'ai', 'business'], intents: ['cofounder'], skills: ['JavaScript', 'Web design'], hobbies: ['Travel', 'Photography'], lookingFor: 'Other indie hackers to share numbers with', canHelp: 'SaaS pricing, SEO, solo founder life', socials: { twitter: '@danielkim', linkedin: 'daniel-kim' }, event: EVENT, photoColor: G[6] },
  { id: '18', name: 'Mia Andersen', role: 'Accessibility Engineer', company: 'Spotify', bio: 'I make the web usable for everyone. Big on inclusive web design. Open to roles.', interests: ['design', 'frontend', 'networking'], intents: ['job'], skills: ['UI/UX', 'Web design', 'JavaScript'], hobbies: ['Sign language', 'Gardening'], lookingFor: 'An accessibility / frontend role', canHelp: 'WCAG, screen readers, inclusive UX', socials: { linkedin: 'mia-andersen', twitter: '@mia_a11y' }, event: EVENT, photoColor: G[7] },
  { id: '19', name: 'Carlos Mendez', role: 'Game Developer', company: 'Pixel Forge', bio: 'Unity & C# web games. Exploring gamification for health apps.', interests: ['gamedev', 'health', 'startup'], intents: ['cofounder'], skills: ['C#', 'Motion design'], hobbies: ['Gaming', 'Guitar'], lookingFor: 'Health founders curious about gamification', canHelp: 'Game design, C#, animation', socials: { twitter: '@carlos_games', instagram: '@carlos.makes' }, event: EVENT, photoColor: G[8] },
  { id: '20', name: 'Nina Larsen', role: 'Founder', company: 'CycleSync', bio: 'Building a cycle + sleep tracker. Looking for iOS help! Pilates fan.', interests: ['health', 'startup', 'design'], intents: ['cofounder', 'hiring'], skills: ['UI/UX', 'Yoga'], hobbies: ['Pilates', 'Tea'], lookingFor: 'An iOS dev who knows HealthKit', canHelp: 'Health domain expertise, product vision', socials: { linkedin: 'nina-larsen', twitter: '@nina_wellness' }, event: EVENT, photoColor: G[9] },
  { id: '21', name: 'Victoria Hale', role: 'Partner', company: 'Northstar Ventures', bio: 'Early-stage VC investing in dev tools and health-tech. Always meeting founders.', interests: ['business', 'startup', 'ai'], intents: ['invest'], skills: [], hobbies: ['Sailing', 'Opera'], lookingFor: 'Pre-seed & seed founders in dev tools / health', canHelp: 'Fundraising, intros to investors, GTM', socials: { linkedin: 'victoria-hale', twitter: '@victoria_vc' }, event: EVENT, photoColor: G[0] },
  { id: '22', name: 'Hana Suzuki', role: 'HCI Researcher', company: 'TU Delft', bio: 'I study attention & focus and design research. Runner.', interests: ['health', 'design', 'data'], intents: ['learning'], skills: ['UI/UX', 'Running'], hobbies: ['Calligraphy', 'Running'], lookingFor: 'App builders to interview', canHelp: 'User research, study design', speaker: true, speakerTopic: 'Designing for focus', socials: { linkedin: 'hana-suzuki', twitter: '@hana_hci' }, event: EVENT, photoColor: G[1] },
  { id: '23', name: 'Felix Weber', role: 'Freelance Dev', company: 'Freelance', bio: 'React & Node in JavaScript for hire. Between projects, looking for my next role. Skier.', interests: ['frontend', 'backend', 'travel'], intents: ['job', 'cofounder'], skills: ['React', 'JavaScript'], hobbies: ['Skiing', 'Cooking'], lookingFor: 'A fullstack role or a co-founder gig', canHelp: 'JavaScript, fullstack, MVPs, code review', socials: { twitter: '@felix_dev', linkedin: 'felix-weber' }, event: EVENT, photoColor: G[2] },
  { id: '24', name: 'Zara Ahmed', role: 'Product Designer', company: 'Linear', bio: 'I design calm, focused interfaces. Into UI/UX and motion design. Open to roles.', interests: ['design', 'frontend', 'health'], intents: ['job'], skills: ['UI/UX', 'Motion design', 'Climbing'], hobbies: ['Knitting', 'Climbing'], lookingFor: 'A senior product-design role', canHelp: 'UI/UX, design systems, prototyping', socials: { instagram: '@zara.designs', twitter: '@zara_ux' }, event: EVENT, photoColor: G[3] },
  { id: '25', name: 'Erik Lund', role: 'Engineering Manager', company: 'Klarna', bio: 'I grow happy teams. Interested in remote culture and async. Hiker.', interests: ['networking', 'business', 'travel'], intents: ['hiring', 'mentor'], skills: ['Gym'], hobbies: ['Hiking', 'Photography'], lookingFor: 'ICs interested in management, or great culture stories', canHelp: 'Career advice, 1:1 coaching, team building', socials: { linkedin: 'erik-lund', twitter: '@erik_em' }, event: EVENT, photoColor: G[4] },
];

/** Faceted sub-options shown under search to refine by specific skill/interest. */
export const FACETS: { key: string; label: string; options: string[] }[] = [
  { key: 'programming', label: '💻 Programming', options: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Java', 'C#'] },
  { key: 'design', label: '🎨 Design', options: ['UI/UX', 'Web design', 'Graphic design', 'AI graphics', 'Motion design', 'Branding'] },
  { key: 'sport', label: '🏃 Sport', options: ['Running', 'Cycling', 'Climbing', 'Yoga', 'Swimming', 'Football', 'Tennis', 'Gym', 'Surfing'] },
];

/** Short scannable badge code for an attendee, e.g. "EM-007". Matches the QR concept. */
export function userCode(id: string): string {
  return `EM-${id.padStart(3, '0')}`;
}

/** Look up an attendee by id. */
export function getUserById(id: string | undefined): User | undefined {
  if (!id) return undefined;
  return MOCK_USERS.find(u => u.id === id);
}

/** Find an attendee by free text: matches name, role, or code (EM-007 / 007 / 7). */
export function findUsers(query: string): User[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_USERS;
  return MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(q) ||
    (u.role || '').toLowerCase().includes(q) ||
    userCode(u.id).toLowerCase().includes(q) ||
    u.id === q.replace(/^em-?/, '').replace(/^0+/, '')
  );
}

export const INTEREST_LABELS: Record<string, string> = {
  sport: '🏃 Sport',
  design: '🎨 Design',
  startup: '🚀 Startup',
  travel: '✈️ Travel',
  health: '💚 Health',
  ai: '🤖 AI',
  networking: '🤝 Networking',
  business: '💼 Business',
  programming: '💻 Programming',
  frontend: '⚛️ Frontend',
  backend: '🗄 Backend',
  mobile: '📱 Mobile',
  devops: '⚙️ DevOps',
  data: '📊 Data',
  security: '🔐 Security',
  gamedev: '🎮 GameDev',
  web3: '⛓ Web3',
  music: '🎵 Music',
  reading: '📚 Reading',
  gaming: '🕹 Gaming',
  food: '🍜 Food',
};

export const ICE_BREAKERS: Record<string, string[]> = {
  sport: ['What was your last race or workout?', 'Morning or evening training person?'],
  design: ['Last project you were proud of?', 'Figma or Sketch?'],
  startup: ['What stage is your product at?', "What's missing in your team right now?"],
  travel: ['Where are you heading next?', 'Remote work from abroad — do you do it?'],
  health: ['How do you track your sleep?', 'Favourite health app?'],
  ai: ['What have you automated with AI recently?', 'GPT or Anthropic?'],
  networking: ['How do you stay in touch after events?', 'Best connection from a past event?'],
  business: ['What metric do you obsess over?', 'B2B or B2C — and why?'],
  programming: ['Favourite language this year?', 'Tabs or spaces? 😄'],
  frontend: ['React, Vue or Svelte?', 'Best CSS trick you learned recently?'],
  backend: ['Monolith or microservices?', 'Favourite database to work with?'],
  mobile: ['Native or cross-platform?', 'Worst App Store review story?'],
  devops: ['Kubernetes — love or hate?', 'How do you handle on-call?'],
  data: ['SQL or NoSQL for this?', 'Coolest dashboard you have built?'],
  security: ['Scariest vuln you have found?', 'Favourite security tool?'],
  gamedev: ['Unity, Unreal or Godot?', 'What are you building?'],
  web3: ['What problem does it actually solve?', 'Favourite chain to build on?'],
  music: ['What instrument do you play?', 'Coding playlist — what is on it?'],
  reading: ['Best book you read this year?', 'Fiction or non-fiction?'],
  gaming: ['What are you playing now?', 'PC or console?'],
  food: ['Best food spot in Amsterdam?', 'Cook or order in?'],
};
