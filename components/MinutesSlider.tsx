"use client";

import { useState, useEffect } from "react";

interface MinutesSliderProps {
  onMinutesChange: (minutes: number, price: number) => void;
}

export default function MinutesSlider({ onMinutesChange }: MinutesSliderProps) {
  const [minutes, setMinutes] = useState(60);
  const minMinutes = 30;
  const maxMinutes = 1000;

  // Функция для расчета цены за минуту в зависимости от количества минут
  const getPricePerMinute = (minutes: number) => {
    if (minutes >= 500) return 5;
    if (minutes >= 200) return 6;
    if (minutes >= 100) return 7;
    return 8;
  };

  // Расчет общей стоимости
  const calculateTotalPrice = (minutes: number) => {
    const pricePerMinute = getPricePerMinute(minutes);
    return minutes * pricePerMinute;
  };

  useEffect(() => {
    const totalPrice = calculateTotalPrice(minutes);
    onMinutesChange(minutes, totalPrice);
  }, [minutes, onMinutesChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label
          htmlFor="minutes"
          className="block text-sm font-medium text-gray-700"
        >
          Количество минут: {minutes}
        </label>
        <span className="text-sm text-gray-500">
          {getPricePerMinute(minutes)} ₽/минута
        </span>
      </div>

      <input
        type="range"
        id="minutes"
        min={minMinutes}
        max={maxMinutes}
        step={10}
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />

      <div className="flex justify-between text-xs text-gray-500">
        <span>{minMinutes} мин</span>
        <span>{maxMinutes} мин</span>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Итоговая стоимость:
          </span>
          <span className="text-lg font-semibold text-blue-600">
            {calculateTotalPrice(minutes)} ₽
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Чем больше минут вы покупаете, тем ниже стоимость за минуту
        </p>
      </div>
    </div>
  );
}
