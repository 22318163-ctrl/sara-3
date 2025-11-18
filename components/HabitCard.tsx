import React from 'react';
import { Habit } from '../types';
import { useHabitStore } from '../hooks/useHabitStore';
import { ICONS } from '../constants';

interface HabitCardProps {
  habit: Habit;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { logHabit, getHabitLogForToday } = useHabitStore();
  const log = getHabitLogForToday(habit.id);
  const isDone = log?.done || false;

  const handleToggle = () => {
    logHabit(habit.id, !isDone);
  };

  const cardClasses = `p-4 rounded-2xl flex items-center justify-between transition-colors duration-300 shadow-sm border ${
    isDone ? 'bg-light-green border-pastel-green' : 'bg-white border-light-green'
  }`;

  const buttonClasses = `px-6 py-2 rounded-full font-bold transition-colors duration-300 text-sm ${
    isDone ? 'bg-dark-green text-white animate-bounce-subtle' : 'bg-light-green text-dark-green hover:bg-pastel-green'
  }`;

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-4">
        <div className={`text-3xl transition-transform ${isDone ? 'animate-bounce-subtle' : ''}`}>{habit.icon}</div>
        <div>
          <p className={`font-bold text-lg text-dark-green ${isDone ? 'line-through opacity-70' : ''}`}>{habit.name}</p>
          <p className={`text-sm text-dark-green/70 ${isDone ? 'line-through' : ''}`}>{habit.goal}</p>
        </div>
      </div>
      <button onClick={handleToggle} className={buttonClasses}>
        {isDone ? (
          <div className="flex items-center gap-1">
            <span>تم</span>
            <ICONS.check className="w-5 h-5" />
          </div>
        ) : (
          'إنجاز اليوم'
        )}
      </button>
    </div>
  );
};

export default HabitCard;
