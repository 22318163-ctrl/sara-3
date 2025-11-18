import React, { useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';

const WelcomeView: React.FC = () => {
  const { setUserName } = useHabitStore();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-creamy flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="max-w-md w-full">
        <span className="text-6xl" role="img" aria-label="leaf">🌿</span>
        <h1 className="text-4xl font-bold text-dark-green mt-4">أهلًا بصفحتك الجديدة</h1>
        <p className="text-dark-green/70 mt-2 text-lg">ابدأي رحلة العادات بلطف — خطوة بخطوة</p>

        <form onSubmit={handleSubmit} className="mt-10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white text-lg text-center p-4 rounded-full outline-none focus:ring-2 focus:ring-pastel-green"
            placeholder="اكتبي اسمك هنا..."
            required
            autoFocus
          />
          <button
            type="submit"
            className="mt-6 w-full px-8 py-4 bg-dark-green text-white font-bold rounded-full text-lg shadow-lg hover:bg-pastel-green hover:text-dark-green transition-colors duration-300"
          >
            ابدأي رحلتك
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeView;
