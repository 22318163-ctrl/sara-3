import React, { useRef, useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS } from '../../constants';
import { Meals } from '../../types';
import { GoogleGenAI } from "@google/genai";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


const MealInput: React.FC<{
  label: string;
  mealKey: 'breakfast' | 'lunch' | 'dinner';
  value: string;
  image?: string;
  calories?: number;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onImageSelect: (file: File) => void;
}> = ({ label, value, image, calories, isLoading, onTextChange, onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-light-green">
      <h3 className="text-lg font-bold text-dark-green mb-2">{label}</h3>
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0">
          {image ? (
            <img src={image} alt={label} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-full bg-light-gray rounded-lg flex items-center justify-center text-dark-green/50">
              <ICONS.camera className="w-8 h-8" />
            </button>
          )}
        </div>
        <textarea
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`ماذا أكلتِ على ${label.toLowerCase()}؟`}
          className="w-full h-24 bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green resize-none"
        />
      </div>
      <div className="flex items-center gap-2 mt-2 text-dark-green">
          <ICONS.fire className="w-5 h-5 text-soft-gold" />
          {isLoading ? (
            <span className="text-sm text-dark-green/70">جاري حساب السعرات...</span>
          ) : calories ? (
            <span className="font-bold">{calories} سعرة حرارية (تقريباً)</span>
          ) : (
            <span className="text-sm text-dark-green/50">أضيفي صورة لحساب السعرات</span>
          )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

const MealsView: React.FC = () => {
  const { todayEntry, updateMeals } = useHabitStore();
  const [loadingMeal, setLoadingMeal] = useState<string | null>(null);
  
  const handleImageUpload = async (meal: 'breakfast' | 'lunch' | 'dinner', file: File) => {
    setLoadingMeal(meal);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key not found");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const base64Data = await blobToBase64(file);
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
      
      const textPart = {
        text: 'احسب السعرات الحرارية التقريبية في هذه الوجبة. قدم الإجابة كرقم فقط بدون وحدات أو نص إضافي.',
      };

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
      });

      const caloriesText = response.text?.trim() ?? '';
      const calories = parseInt(caloriesText.match(/\d+/)?.[0] || '0', 10);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        const imageKey = `${meal}Image` as keyof Meals;
        const calorieKey = `${meal}Calories` as keyof Meals;
        updateMeals({ 
          [imageKey]: imageDataUrl,
          [calorieKey]: calories,
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error calculating calories:", error);
      // Optionally show an error to the user
    } finally {
      setLoadingMeal(null);
    }
  };


  const handleMealTextChange = (meal: keyof Meals, text: string) => {
    updateMeals({ [meal]: text });
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-dark-green">وجبات اليوم</h1>
      <div className="space-y-4">
        <MealInput
          label="الفطور"
          mealKey="breakfast"
          value={todayEntry.meals.breakfast}
          image={todayEntry.meals.breakfastImage}
          calories={todayEntry.meals.breakfastCalories}
          isLoading={loadingMeal === 'breakfast'}
          onTextChange={(text) => handleMealTextChange('breakfast', text)}
          onImageSelect={(file) => handleImageUpload('breakfast', file)}
        />
        <MealInput
          label="الغداء"
          mealKey="lunch"
          value={todayEntry.meals.lunch}
          image={todayEntry.meals.lunchImage}
          calories={todayEntry.meals.lunchCalories}
          isLoading={loadingMeal === 'lunch'}
          onTextChange={(text) => handleMealTextChange('lunch', text)}
          onImageSelect={(file) => handleImageUpload('lunch', file)}
        />
        <MealInput
          label="العشاء"
          mealKey="dinner"
          value={todayEntry.meals.dinner}
          image={todayEntry.meals.dinnerImage}
          calories={todayEntry.meals.dinnerCalories}
          isLoading={loadingMeal === 'dinner'}
          onTextChange={(text) => handleMealTextChange('dinner', text)}
          onImageSelect={(file) => handleImageUpload('dinner', file)}
        />
      </div>
    </div>
  );
};

export default MealsView;