export type Page = 'today' | 'habits' | 'mood' | 'meals' | 'journal' | 'monthly' | 'religious';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  goal: string;
  type: 'daily' | 'weekly' | 'custom';
  weeklyGoal?: number; // e.g., 3 for "3 times a week"
  accentColor: string;
  createdAt: string;
}

export interface Task {
  id: number;
  text: string;
  done: boolean;
}

export interface Meals {
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastImage?: string;
  lunchImage?: string;
  dinnerImage?: string;
  breakfastCalories?: number;
  lunchCalories?: number;
  dinnerCalories?: number;
}

export type Mood = '😍' | '😊' | '😐' | '😟' | '😭' | '😡' | null;

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Mood;
  waterCount: number;
  meals: Meals;
  tasks: Task[];
  notes: string;
  journal: string;
  journalImage?: string;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  done: boolean;
}

export interface ReligiousHabit {
  id: string;
  name: string;
  icon: string;
  hasCounter?: boolean;
}

export interface ReligiousHabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  count: number;
}