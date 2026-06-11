import { INTEREST_LABELS } from '../data/mockData';
import type { Interest } from '../types';

interface Props {
  interest: Interest;
  small?: boolean;
}

const colors: Record<string, string> = {
  sport: '#e8f5e9',
  design: '#fce4ec',
  startup: '#fff3e0',
  travel: '#e0f7fa',
  health: '#f1f8e9',
  ai: '#f3e5f5',
  networking: '#e3f2fd',
  business: '#ede7f6',
  programming: '#e8eaf6',
  frontend: '#e1f5fe',
  backend: '#f3e5f5',
  mobile: '#e0f2f1',
  devops: '#fbe9e7',
  data: '#fff8e1',
  security: '#ffebee',
  gamedev: '#f3e5f5',
  web3: '#e8eaf6',
  music: '#fce4ec',
  reading: '#efebe9',
  gaming: '#e8eaf6',
  food: '#fff3e0',
};

export function InterestBadge({ interest, small }: Props) {
  return (
    <span style={{
      background: colors[interest] || '#f5f5f5',
      borderRadius: 20,
      padding: small ? '2px 8px' : '4px 12px',
      fontSize: small ? 11 : 13,
      fontWeight: 500,
      display: 'inline-block',
      margin: '2px',
    }}>
      {INTEREST_LABELS[interest] || interest}
    </span>
  );
}
