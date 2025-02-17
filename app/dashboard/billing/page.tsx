"use client";

import { useState } from "react";
import MinutesSlider from "@/components/MinutesSlider";
import "./billing.css";

export default function BillingPage() {
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // В реальном приложении эти данные должны приходить с бэкенда
  const availableMinutes = 45;
  const usedMinutes = 155;

  const handleMinutesChange = (minutes: number, price: number) => {
    setSelectedMinutes(minutes);
    setTotalPrice(price);
  };

  const handlePurchase = () => {
    // Здесь будет логика оплаты
    console.log(`Покупка ${selectedMinutes} минут за ${totalPrice} рублей`);
  };

  return (
    <div className="billing-container">
      {/* Текущий баланс */}
      <div className="billing-card balance-card">
        <h3>Ваш баланс минут</h3>
        <div className="balance-grid">
          <div className="balance-item available">
            <dt>Доступно минут</dt>
            <dd>{availableMinutes}</dd>
          </div>
          <div className="balance-item used">
            <dt>Использовано минут</dt>
            <dd>{usedMinutes}</dd>
          </div>
        </div>
      </div>

      {/* Покупка минут */}
      <div className="billing-card purchase-card">
        <h3>Пополнение баланса</h3>
        <p className="description">
          Выберите количество минут для покупки. Чем больше минут вы покупаете,
          тем ниже стоимость за минуту.
        </p>
        <div className="slider-container">
          <MinutesSlider onMinutesChange={handleMinutesChange} />
        </div>
        <button
          type="button"
          onClick={handlePurchase}
          disabled={selectedMinutes === 0}
          className="purchase-button"
        >
          Оплатить {totalPrice} ₽
        </button>
      </div>

      {/* Тарифы */}
      <div className="billing-card rates-card">
        <h3>Тарифы</h3>
        <div className="rates-list">
          <div className="rate-item">
            <div className="rate-info">
              <h4>30-99 минут</h4>
              <p>Базовый тариф</p>
            </div>
            <span className="rate-price">3 ₽/мин</span>
          </div>
          <div className="rate-item">
            <div className="rate-info">
              <h4>100-199 минут</h4>
              <p>Стандартный тариф</p>
            </div>
            <span className="rate-price">2.5 ₽/мин</span>
          </div>
          <div className="rate-item">
            <div className="rate-info">
              <h4>200-499 минут</h4>
              <p>Продвинутый тариф</p>
            </div>
            <span className="rate-price">2 ₽/мин</span>
          </div>
          <div className="rate-item">
            <div className="rate-info">
              <h4>500+ минут</h4>
              <p>Корпоративный тариф</p>
            </div>
            <span className="rate-price">1.5 ₽/мин</span>
          </div>
        </div>
      </div>
    </div>
  );
}
