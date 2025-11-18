import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailyEntry, Habit, HabitLog, Meals, Mood, Task, ReligiousHabit, ReligiousHabitLog } from '../types';
import { INITIAL_HABITS, INITIAL_RELIGIOUS_HABITS } from '../constants';

interface HabitContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  habits: Habit[];
  dailyEntries: Record<string, DailyEntry>;
  habitLogs: Record<string, HabitLog[]>;
  todayEntry: DailyEntry;
  updateMood: (mood: Mood) => void;
  updateWater: (newCount: number) => void;
  updateTask: (taskId: number, done: boolean) => void;
  updateTaskText: (taskId: number, text: string) => void;
  updateMeals: (meals: Partial<Meals>) => void;
  updateNotes: (notes: string) => void;
  logHabit: (habitId: string, done: boolean) => void;
  getHabitLogForToday: (habitId: string) => HabitLog | undefined;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateJournal: (text: string, image?: string) => void;
  currentWeight: number | null;
  targetWeight: number | null;
  setCurrentWeight: (weight: number | null) => void;
  setTargetWeight: (weight: number | null) => void;
  religiousHabits: ReligiousHabit[];
  addReligiousHabit: (habit: Omit<ReligiousHabit, 'id'>) => void;
  religiousHabitLogs: Record<string, ReligiousHabitLog[]>;
  updateReligiousHabitCount: (habitId: string, count: number) => void;
  getReligiousHabitLogForToday: (habitId: string) => ReligiousHabitLog | undefined;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Helper to check for localStorage availability
const isStorageAvailable = () => {
  try {
    const testKey = '__test_storage__';
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
const storageAvailable = isStorageAvailable();


const safeJSONParse = <T>(key: string, fallback: T): T => {
    if (!storageAvailable) return fallback;

    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;

    try {
        const parsed = JSON.parse(saved);
        return parsed ?? fallback;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage. Removing item.`, error);
        localStorage.removeItem(key);
        return fallback;
    }
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const createNewDailyEntry = (date: string): DailyEntry => ({
  date,
  mood: null,
  waterCount: 0,
  meals: { 
    breakfast: '', 
    lunch: '', 
    dinner: '',
    breakfastCalories: undefined,
    lunchCalories: undefined,
    dinnerCalories: undefined,
  },
  tasks: [
    { id: 1, text: '', done: false },
    { id: 2, text: '', done: false },
    { id: 3, text: '', done: false },
  ],
  notes: '',
  journal: '',
});

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string | null>(() => {
    if (!storageAvailable) return null;
    return localStorage.getItem('userName');
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = safeJSONParse('habits', INITIAL_HABITS);
    if (!Array.isArray(stored)) {
        return INITIAL_HABITS;
    }
    // Filter out invalid entries to prevent crashes from malformed data.
    return stored.filter(h => h && typeof h === 'object' && h.id && h.name);
  });
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>(() => {
    let entries = safeJSONParse('dailyEntries', {});

    // Ensure entries is a valid object, not an array or primitive.
    if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) {
      entries = {};
    }

    const today = getTodayDateString();

    // Ensure today's entry exists before sanitizing
    if (!entries[today]) {
      entries[today] = createNewDailyEntry(today);
    }
    
    // Sanitize all entries to prevent crashes from old data structures.
    Object.keys(entries).forEach(date => {
        const defaultEntry = createNewDailyEntry(date);
        const existingEntry = entries[date];

        // If an entry from localStorage is malformed (not an object), replace it with a default one.
        if (typeof existingEntry !== 'object' || existingEntry === null) {
          entries[date] = defaultEntry;
          return;
        }

        // Deep merge to ensure all properties exist
        entries[date] = {
            ...defaultEntry,
            ...existingEntry,
            meals: {
                ...defaultEntry.meals,
                // FIX: Ensure 'meals' is a non-null object before spreading to prevent crashes.
                ...(typeof existingEntry.meals === 'object' && existingEntry.meals !== null ? existingEntry.meals : {}),
            },
            tasks: defaultEntry.tasks.map((defaultTask, index) => {
                // Ensure 'tasks' is an array before trying to access its elements.
                const existingTasksArray = Array.isArray(existingEntry.tasks) ? existingEntry.tasks : [];
                const existingTask = existingTasksArray[index];
                
                // Ensure individual task is an object before spreading.
                return {
                    ...defaultTask,
                    ...(existingTask && typeof existingTask === 'object' ? existingTask : {}),
                };
            }),
        };
    });

    return entries;
  });
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog[]>>(() => {
    const logs = safeJSONParse('habitLogs', {});
    if (typeof logs !== 'object' || logs === null || Array.isArray(logs)) return {};
    
    // Ensure every log entry is an array of valid log objects
    Object.keys(logs).forEach(date => {
        if (!Array.isArray(logs[date])) {
            logs[date] = []; // If not an array, reset to empty array
        } else {
            // Filter out any invalid items within the array
            logs[date] = logs[date].filter(log => log && typeof log === 'object' && log.habitId !== undefined && log.done !== undefined);
        }
    });
    return logs;
  });
  const [currentWeight, setCurrentWeightState] = useState<number | null>(() => safeJSONParse('currentWeight', null));
  const [targetWeight, setTargetWeightState] = useState<number | null>(() => safeJSONParse('targetWeight', null));
  const [religiousHabits, setReligiousHabits] = useState<ReligiousHabit[]>(() => {
    const stored = safeJSONParse('religiousHabits', INITIAL_RELIGIOUS_HABITS);
    if (!Array.isArray(stored)) {
        return INITIAL_RELIGIOUS_HABITS;
    }
    // Filter out invalid entries
    return stored.filter(h => h && typeof h === 'object' && h.id && h.name);
  });
  const [religiousHabitLogs, setReligiousHabitLogs] = useState<Record<string, ReligiousHabitLog[]>>(() => {
    const logs = safeJSONParse('religiousHabitLogs', {});
    if (typeof logs !== 'object' || logs === null || Array.isArray(logs)) return {};

    // Ensure every log entry is an array of valid log objects
    Object.keys(logs).forEach(date => {
        if (!Array.isArray(logs[date])) {
            logs[date] = []; // If not an array, reset to empty array
        } else {
            // Filter out any invalid items within the array
            logs[date] = logs[date].filter(log => log && typeof log === 'object' && log.habitId !== undefined && log.count !== undefined);
        }
    });
    return logs;
  });

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('habitLogs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  useEffect(() => {
    if (!storageAvailable) return;
    if (currentWeight !== null) localStorage.setItem('currentWeight', JSON.stringify(currentWeight));
    else localStorage.removeItem('currentWeight');
  }, [currentWeight]);

  useEffect(() => {
      if (!storageAvailable) return;
      if (targetWeight !== null) localStorage.setItem('targetWeight', JSON.stringify(targetWeight));
      else localStorage.removeItem('targetWeight');
  }, [targetWeight]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('religiousHabits', JSON.stringify(religiousHabits));
  }, [religiousHabits]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('religiousHabitLogs', JSON.stringify(religiousHabitLogs));
  }, [religiousHabitLogs]);
  
  const setUserName = (name: string) => {
    if (storageAvailable) {
      localStorage.setItem('userName', name);
    }
    setUserNameState(name);
  };
  
  const setCurrentWeight = (weight: number | null) => setCurrentWeightState(weight);
  const setTargetWeight = (weight: number | null) => setTargetWeightState(weight);

  const todayDateString = getTodayDateString();
  const todayEntry = dailyEntries[todayDateString] || createNewDailyEntry(todayDateString);

  const updateStateForToday = (updater: (entry: DailyEntry) => DailyEntry) => {
    const today = getTodayDateString();
    setDailyEntries(prev => {
      const currentEntry = prev[today] || createNewDailyEntry(today);
      return { ...prev, [today]: updater(currentEntry) };
    });
  };

  const updateMood = (mood: Mood) => {
    updateStateForToday(entry => ({ ...entry, mood }));
  };

  const updateWater = (newCount: number) => {
    updateStateForToday(entry => ({ ...entry, waterCount: newCount }));
  };

  const updateTask = (taskId: number, done: boolean) => {
    updateStateForToday(entry => ({
      ...entry,
      tasks: entry.tasks.map(t => t.id === taskId ? { ...t, done } : t),
    }));
  };
  
  const updateTaskText = (taskId: number, text: string) => {
    updateStateForToday(entry => ({
      ...entry,
      tasks: entry.tasks.map(t => t.id === taskId ? { ...t, text } : t),
    }));
  };

  const updateMeals = (newMeals: Partial<Meals>) => {
    updateStateForToday(entry => ({
      ...entry,
      meals: { ...entry.meals, ...newMeals },
    }));
  };

  const updateNotes = (notes: string) => {
    updateStateForToday(entry => ({ ...entry, notes }));
  };
  
  const updateJournal = (text: string, image?: string) => {
    updateStateForToday(entry => ({
      ...entry,
      journal: text,
      journalImage: image || entry.journalImage,
    }));
  };

  const logHabit = (habitId: string, done: boolean) => {
    const today = getTodayDateString();
    const habit = habits.find(h => h.id === habitId);

    setHabitLogs(prev => {
      const todayLogs = prev[today] || [];
      const existingLogIndex = todayLogs.findIndex(log => log.habitId === habitId);
      let newLogsForToday;

      // For weekly habits, we only store positive logs (when done is true).
      // Un-checking a weekly habit removes its log for that day.
      // This simplifies weekly progress calculation (just count the logs for the week).
      if (habit?.type === 'weekly') {
        if (done) {
          if (existingLogIndex === -1) {
            newLogsForToday = [...todayLogs, { date: today, habitId, done: true }];
          } else {
            // This case is unlikely if we remove on 'done: false', but good for safety.
            newLogsForToday = todayLogs.map((log, index) => index === existingLogIndex ? { ...log, done: true } : log);
          }
        } else {
          newLogsForToday = todayLogs.filter((_, index) => index !== existingLogIndex);
        }
      } else { // For daily habits, we toggle 'done' status.
        if (existingLogIndex > -1) {
          newLogsForToday = todayLogs.map((log, index) => index === existingLogIndex ? { ...log, done } : log);
        } else {
          newLogsForToday = [...todayLogs, { date: today, habitId, done }];
        }
      }

      const newLogs = { ...prev };
      if (newLogsForToday && newLogsForToday.length > 0) {
        newLogs[today] = newLogsForToday;
      } else {
        delete newLogs[today];
      }
      return newLogs;
    });
  };

  const getHabitLogForToday = (habitId: string) => {
    const today = getTodayDateString();
    return (habitLogs[today] || []).find(log => log.habitId === habitId);
  };
  
  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateReligiousHabitCount = (habitId: string, count: number) => {
    const today = getTodayDateString();
    setReligiousHabitLogs(prev => {
      const todayLogs = prev[today] || [];
      const existingLogIndex = todayLogs.findIndex(log => log.habitId === habitId);
      let newLogsForToday;
      const safeCount = Math.max(0, count);

      if (existingLogIndex > -1) {
        if (safeCount > 0) {
          newLogsForToday = todayLogs.map((log, index) => 
            index === existingLogIndex ? { ...log, count: safeCount } : log
          );
        } else {
          newLogsForToday = todayLogs.filter((_, index) => index !== existingLogIndex);
        }
      } else if (safeCount > 0) {
        newLogsForToday = [...todayLogs, { date: today, habitId, count: safeCount }];
      } else {
        newLogsForToday = todayLogs;
      }
      
      return { ...prev, [today]: newLogsForToday };
    });
  };
  
  const addReligiousHabit = (habit: Omit<ReligiousHabit, 'id'>) => {
    const newHabit: ReligiousHabit = {
      ...habit,
      id: `r_${new Date().getTime().toString()}`,
    };
    setReligiousHabits(prev => [...prev, newHabit]);
  };

  const getReligiousHabitLogForToday = (habitId: string) => {
    const today = getTodayDateString();
    return (religiousHabitLogs[today] || []).find(log => log.habitId === habitId);
  };

  const value: HabitContextType = {
    userName,
    setUserName,
    habits,
    dailyEntries,
    habitLogs,
    todayEntry,
    updateMood,
    updateWater,
    updateTask,
    updateTaskText,
    updateMeals,
    updateNotes,
    logHabit,
    getHabitLogForToday,
    addHabit,
    updateJournal,
    currentWeight,
    targetWeight,
    setCurrentWeight,
    setTargetWeight,
    religiousHabits,
    addReligiousHabit,
    religiousHabitLogs,
    updateReligiousHabitCount,
    getReligiousHabitLogForToday,
  };

  return React.createElement(HabitContext.Provider, { value: value }, children);
};

export const useHabitStore = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabitStore must be used within a HabitProvider');
  }
  return context;
};