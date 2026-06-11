import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  type GameAction, type Counts, type Achievement,
  totalPoints, unlockedAchievements, newlyUnlocked, levelFromPoints,
} from './gamificationLogic';

interface GamificationValue {
  counts: Counts;
  points: number;
  level: number;
  unlocked: Achievement[];
  award: (action: GameAction, once?: boolean) => void;
  toast: Achievement | null;
  clearToast: () => void;
}

const Ctx = createContext<GamificationValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>({});
  const [toast, setToast] = useState<Achievement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const award = useCallback((action: GameAction, once = false) => {
    setCounts(prev => {
      if (once && (prev[action] || 0) > 0) return prev; // once-only actions don't re-award
      const next = { ...prev, [action]: (prev[action] || 0) + 1 };
      const fresh = newlyUnlocked(prev, next);
      if (fresh.length > 0) {
        setToast(fresh[0]);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
      }
      return next;
    });
  }, []);

  const points = totalPoints(counts);
  const value: GamificationValue = {
    counts,
    points,
    level: levelFromPoints(points),
    unlocked: unlockedAchievements(counts),
    award,
    toast,
    clearToast: () => setToast(null),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGamification(): GamificationValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGamification must be used within GamificationProvider');
  return v;
}
