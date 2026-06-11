import type { Interest } from '../types';

export interface Sponsor {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'partner';
  description: string;
  booth?: string;
  website: string;
  hiring: boolean;
  tags: Interest[];
  logo: string; // emoji fallback
}

export const SPONSORS: Sponsor[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    tier: 'gold',
    description: 'Deploy web apps globally. The platform for frontend developers — Next.js, Edge Functions, and more.',
    booth: 'A1',
    website: 'vercel.com',
    hiring: true,
    tags: ['startup', 'design', 'ai'],
    logo: '▲',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    tier: 'gold',
    description: 'Complete DevOps platform — CI/CD, code review, security scanning, and project management in one place.',
    booth: 'A2',
    website: 'gitlab.com',
    hiring: true,
    tags: ['startup'],
    logo: '🦊',
  },
  {
    id: 'progress',
    name: 'Progress / Telerik',
    tier: 'gold',
    description: 'Kendo UI — professional React, Angular, Vue components. KendoReact powers this app!',
    booth: 'B1',
    website: 'telerik.com',
    hiring: false,
    tags: ['design', 'startup'],
    logo: '⚡',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    tier: 'silver',
    description: 'Edge computing, CDN, Workers, and AI inference at the edge. Building a faster, safer internet.',
    booth: 'B2',
    website: 'cloudflare.com',
    hiring: true,
    tags: ['ai', 'startup'],
    logo: '☁️',
  },
  {
    id: 'nx',
    name: 'Nx',
    tier: 'silver',
    description: 'Smart monorepo tools for JS/TS. Faster CI, better DX, scalable codebases for teams.',
    booth: 'C1',
    website: 'nx.dev',
    hiring: true,
    tags: ['startup'],
    logo: '🔧',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    tier: 'silver',
    description: 'Application monitoring & error tracking. Know when your code breaks before your users tell you.',
    booth: 'C2',
    website: 'sentry.io',
    hiring: false,
    tags: ['startup', 'health'],
    logo: '🔍',
  },
  {
    id: 'jetbrains',
    name: 'JetBrains',
    tier: 'partner',
    description: 'WebStorm, IntelliJ, and developer tools loved by millions. AI-powered coding assistants.',
    booth: 'D1',
    website: 'jetbrains.com',
    hiring: false,
    tags: ['ai', 'design'],
    logo: '🧠',
  },
  {
    id: 'picnic',
    name: 'Picnic',
    tier: 'partner',
    description: 'Amsterdam-based online grocery startup — building tech to reinvent sustainable grocery delivery across Europe.',
    booth: 'D2',
    website: 'picnic.app',
    hiring: true,
    tags: ['startup', 'health', 'travel'],
    logo: '🧺',
  },
];
