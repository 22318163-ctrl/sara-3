import React, { useMemo } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { QUOTES, MOOD_OPTIONS, GREETINGS, ICONS } from '../../constants';
import ProgressBarCircle from '../ProgressBarCircle';
import { Mood } from '../../types';

const TodayView: React.FC = () => {
  const { todayEntry, updateMood, updateWater, updateTask, updateTaskText, updateMeals, updateNotes, habits, habitLogs, userName } = useHabitStore();

  const { todayQuote, todayGreeting } = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const quote = QUOTES[dayOfYear % QUOTES.length];
    const greeting = GREETINGS[now.getDate() % GREETINGS.length];
    return { todayQuote: quote, todayGreeting: greeting };
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const todayHabitLogs = habitLogs[today] || [];
  const habitsDoneCount = todayHabitLogs.filter(log => log.done).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (habitsDoneCount / totalHabits) * 100 : 0;

  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-dark-green mb-1">أهلاً بعودتكِ, {userName}!</h1>
        <p className="text-lg text-dark-green/70">{todayFormatted} - {todayGreeting}</p>
        <p className="text-soft-gold italic mt-3 text-sm">"{todayQuote.text}"</p>
      </header>

      <div className="flex justify-center items-center flex-col">
        <ProgressBarCircle progress={progressPercent} />
        <p className="mt-2 text-dark-green/80">
          {progressPercent < 100 ? `أنجزتِ ${habitsDoneCount} من ${totalHabits} عادة` : "🎉 يوم رائع! كل عاداتك مكتملة"}
        </p>
        {progressPercent >= 100 && <p className="text-soft-gold text-lg font-bold">تهانينا!</p>}
      </div>
      
      {/* Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green/50 space-y-4">
        
        {/* Mood Tracker */}
        <div className="pb-4 border-b border-light-green/70">
          <h2 className="text-xl font-bold mb-3 text-dark-green flex items-center gap-2">
            <ICONS.mood className="w-6 h-6" />
            مزاج اليوم
          </h2>
          <div className="flex justify-around items-center bg-light-gray p-2 rounded-full">
            {MOOD_OPTIONS.map(mood => (
              <button 
                key={mood}
                onClick={() => updateMood(mood as Mood)}
                className={`text-3xl transition-transform duration-200 ${todayEntry.mood === mood ? 'scale-125' : 'scale-100 opacity-50 hover:opacity-100'}`}
                aria-label={`Mood: ${mood}`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Water Intake */}
        <div className="py-4 border-b border-light-green/70 flex justify-between items-center">
          <h2 className="text-xl font-bold text-dark-green flex items-center gap-2">
            <ICONS.water className="w-6 h-6" />
            شرب الماء
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-dark-green">{todayEntry.waterCount} 💧</span>
            <button onClick={() => updateWater(todayEntry.waterCount + 1)} className="bg-pastel-green text-dark-green rounded-full h-10 w-10 text-2xl flex items-center justify-center shadow-sm hover:bg-dark-green hover:text-white transition-colors">+</button>
          </div>
        </div>
        
        {/* Main Tasks */}
        <div className="py-4 border-b border-light-green/70">
          <h2 className="text-xl font-bold mb-3 text-dark-green flex items-center gap-2">
            <ICONS.tasks className="w-6 h-6" />
            3 مهام رئيسية
          </h2>
          <div className="space-y-3">
            {todayEntry.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={task.done}
                  onChange={e => updateTask(task.id, e.target.checked)}
                  className="h-6 w-6 rounded-md border-pastel-green text-dark-green focus:ring-dark-green shrink-0"
                />
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateTaskText(task.id, e.target.value)}
                  placeholder={`مهمة ${task.id}...`}
                  className={`w-full bg-transparent border-b-2 outline-none transition-colors py-1 ${task.done ? 'line-through text-gray-400 border-gray-300' : 'text-dark-green border-pastel-green focus:border-dark-green'}`}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Meals */}
        <div className="py-4 border-b border-light-green/70">
          <h2 className="text-xl font-bold mb-3 text-dark-green flex items-center gap-2">
            <ICONS.meals className="w-6 h-6" />
            وجبات اليوم
          </h2>
          <div className="space-y-2">
            <input type="text" placeholder="فطور..." value={todayEntry.meals.breakfast} onChange={e => updateMeals({ breakfast: e.target.value })} className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"/>
            <input type="text" placeholder="غداء..." value={todayEntry.meals.lunch} onChange={e => updateMeals({ lunch: e.target.value })} className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"/>
            <input type="text" placeholder="عشاء..." value={todayEntry.meals.dinner} onChange={e => updateMeals({ dinner: e.target.value })} className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"/>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-4">
          <h2 className="text-xl font-bold mb-3 text-dark-green flex items-center gap-2">
            <ICONS.notes className="w-6 h-6" />
            ملاحظات اليوم
          </h2>
          <textarea
            placeholder="اكتبي ملاحظاتك هنا..."
            value={todayEntry.notes}
            onChange={e => updateNotes(e.target.value)}
            className="w-full h-24 bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"
          />
        </div>
      </div>
    </div>
  );
};

export default TodayView;