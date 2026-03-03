// --- File: src/components/becomeASitter/SitterAppPreviewSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import '@/style/components/becomeASitter/SitterAppPreviewSection.scss';

const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#38A169"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>;

const SitterAppPreviewSection: React.FC = () => {
    const features = [
        { title: "Задачи и отметки", desc: "Идеально для визитов: отмечайте кормление, уборку лотка и отправляйте фотоотчет в 1 клик." },
        { title: "GPS-маршруты выгула", desc: "Автоматическая запись маршрута прогулки. Владелец будет спокоен, видя вашу активность." },
        { title: "Календарь и финансы", desc: "Все заказы под контролем. Отслеживайте свой доход и управляйте расписанием прямо в телефоне." }
    ];

    return (
        <section className="sitter-app-preview wrapper">
            <div className="sitter-app-preview__content">
                <motion.div className="sitter-app-preview__text" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2>Ваш бизнес в одном приложении</h2>
                    <p>Профессиональный инструмент для управления заказами. Особенно удобно для тех, кто берет выгулы и визиты на дом!</p>
                    <ul className="app-features-list">
                        {features.map((f, i) => (
                            <li key={i}>
                                <div className="check-icon"><CheckCircleIcon /></div>
                                <div>
                                    <strong>{f.title}</strong>
                                    <span>{f.desc}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <div className="sitter-app-preview__visual">
                    {/* УВЕДОМЛЕНИЕ 1: Новый заказ (Слева сверху) */}
                    <motion.div className="floating-push push-1" initial={{ opacity: 0, x: -60, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}>
                        <div className="push-icon">📍</div>
                        <div className="push-text">
                            <b>Новый заказ: Выгул</b>
                            <span>Активный выгул • 60 мин • <strong className="text-blue">+800 ₽</strong></span>
                        </div>
                    </motion.div>

                    {/* УВЕДОМЛЕНИЕ 2: Оплата (Справа снизу) */}
                    <motion.div className="floating-push push-2" initial={{ opacity: 0, x: 60, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}>
                        <div className="push-icon">💳</div>
                        <div className="push-text">
                            <b>Зачисление средств</b>
                            <span className="text-green">+14 500 ₽ переведено на карту</span>
                        </div>
                    </motion.div>

                    {/* УВЕДОМЛЕНИЕ 3: Сообщение (Справа сверху) */}
                    <motion.div className="floating-push push-3" initial={{ opacity: 0, x: 60, y: -20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}>
                        <div className="push-icon">💬</div>
                        <div className="push-text">
                            <b>Елена (Владелец Арчи)</b>
                            <span>Спасибо огромное за фото! 🥰</span>
                        </div>
                    </motion.div>

                    {/* УВЕДОМЛЕНИЕ 4: Напоминание (Слева снизу) */}
                    <motion.div className="floating-push push-4" initial={{ opacity: 0, x: -60, y: -20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}>
                        <div className="push-icon">⏰</div>
                        <div className="push-text">
                            <b>Напоминание</b>
                            <span>Выгул собаки Арчи через 30 минут</span>
                        </div>
                    </motion.div>

                    <div className="phone-mockup">
                        <div className="phone-screen">
                            <div className="app-header-area">
                                <div className="greeting">Мои заказы</div>
                                <div className="avatar">A</div>
                            </div>

                            <div className="balance-widget">
                                <span className="balance-label">Доступно к выплате</span>
                                <span className="balance-value">28 500 ₽</span>
                            </div>

                            <div className="orders-header">Сегодня</div>

                            <div className="app-card">
                                <div className="app-card-top">
                                    <span className="app-badge">Через 1 час</span>
                                    <span className="app-time">14:00</span>
                                </div>
                                <h4>Выгул собаки • Корги Арчи</h4>
                                <div className="app-price">800 ₽</div>
                                <div className="app-button" style={{ backgroundColor: '#3598FE' }}>Начать выгул (GPS)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SitterAppPreviewSection;