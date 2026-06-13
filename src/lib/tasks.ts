/** Local (offline) persistence for follow-up tasks. Cloud sync lives in lib/backend. */
import { load, save } from './storage';
import { serializeTask, reviveTask } from './backend/mappers';
import type { Task } from '../types';

export function loadTasks(): Task[] {
  const raw = load<Record<string, unknown>[]>('tasks', []);
  return raw.map(reviveTask);
}

export function saveTasks(tasks: Task[]): void {
  save('tasks', tasks.map(serializeTask));
}
