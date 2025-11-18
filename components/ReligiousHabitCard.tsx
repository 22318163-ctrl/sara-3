import React from 'react';
import { ReligiousHabit } from '../types';
import { useHabitStore } from '../hooks/useHabitStore';
import { ICONS } from '../constants';

interface ReligiousHabitCardProps {
  habit: ReligiousHabit;
}

const ReligiousHabitCard: React.FC<ReligiousHabitCardProps> = ({ habit }) => {
  const { updateReligiousHabitCount, getReligiousHabitLogForToday } = useHabitStore();
  const log = getReligiousHabitLogForToday(habit.id);
  const count = log?.count || 0;
  const isDone = count > 0;

  const handleToggle = () => {
    updateReligiousHabitCount(habit.id, isDone ? 0 : 1);
  };

  const handleIncrement = () => {
    updateReligiousHabitCount(habit.id, count + 1);
  };

  const handleDecrement = () => {
    updateReligiousHabitCount(habit.id, count - 1);
  };
  
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount)) {
      updateReligiousHabitCount(habit.id, newCount);
    }
  }

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
          <p className={`font-bold text-lg text-dark-green ${isDone && !habit.hasCounter ? 'line-through opacity-70' : ''}`}>{habit.name}</p>
        </div>
      </div>
      
      {habit.hasCounter ? (
        <div className="flex items-center gap-2">
          <button onClick={handleDecrement} className="bg-pastel-green text-dark-green rounded-full h-8 w-8 text-xl flex items-center justify-center shadow-sm hover:bg-dark-green hover:text-white transition-colors">-</button>
          <input 
            type="number"
            value={count}
            onChange={handleCountChange}
            className="w-20 text-center bg-transparent font-bold text-dark-green text-lg outline-none"
            aria-label={`عدد ${habit.name}`}
          />
          <button onClick={handleIncrement} className="bg-pastel-green text-dark-green rounded-full h-8 w-8 text-xl flex items-center justify-center shadow-sm hover:bg-dark-green hover:text-white transition-colors">+</button>
        </div>
      ) : (
        <button onClick={handleToggle} className={buttonClasses}>
          {isDone ? (
            <div className="flex items-center gap-1">
              <ICONS.check className="w-5 h-5" />
              <span>تم</span>
            </div>
          ) : (
            'إنجاز'
          )}
        </button>
      )}
    </div>
  );
};

export default ReligiousHabitCard;
