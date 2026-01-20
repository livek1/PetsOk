// --- File: src/components/becomeASitter/SitterAppPreviewSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/SitterAppPreviewSection.scss';

// Иконки для списка преимуществ
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#4CAF50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#3598FE"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>;

const SitterAppPreviewSection: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        { titleKey: "becomeSitter.appFeature1Title", descKey: "becomeSitter.appFeature1Desc" },
        { titleKey: "becomeSitter.appFeature2Title", descKey: "becomeSitter.appFeature2Desc" },
        { titleKey: "becomeSitter.appFeature3Title", descKey: "becomeSitter.appFeature3Desc" }
    ];

    return (
        <section className="sitter-app-preview wrapper">
            <div className="sitter-app-preview__content">
                <motion.div
                    className="sitter-app-preview__text"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>{t('becomeSitter.appPreviewTitle')}</h2>
                    <p>{t('becomeSitter.appPreviewSubtitle')}</p>

                    <ul className="app-features-list">
                        {features.map((f, i) => (
                            <li key={i}>
                                <div className="check-icon"><CheckCircleIcon /></div>
                                <div>
                                    <strong>{t(f.titleKey)}</strong>
                                    <span>{t(f.descKey)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    className="sitter-app-preview__visual"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Макет телефона: Имитация Dashboard из React Native */}
                    <div className="phone-mockup">
                        <div className="phone-screen">

                            {/* Header */}
                            <div className="app-top-bar">
                                <div>Добрый вечер, <br /><b>Александр</b></div>
                                <div className="avatar">А</div>
                            </div>

                            {/* Metrics Cards (Scrollable imitation) */}
                            <div className="metrics-row">
                                <div className="metric-card green">
                                    <div className="icon">💰</div>
                                    <div className="val">45 500 ₽</div>
                                    <div className="lbl">За 30 дней</div>
                                </div>
                                <div className="metric-card blue">
                                    <div className="icon">⏳</div>
                                    <div className="val">3 200 ₽</div>
                                    <div className="lbl">В ожидании</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="tabs-row">
                                <div className="tab active">
                                    <BellIcon /> Активность (2)
                                </div>
                                <div className="tab">Заказы</div>
                            </div>

                            {/* Activity Feed */}
                            <div className="feed-list">
                                {/* Item 1: New Invite */}
                                <div className="feed-item invite">
                                    <div className="feed-header">
                                        <div className="badge blue">Новое приглашение</div>
                                        <div className="time">2 мин</div>
                                    </div>
                                    <div className="feed-body">
                                        <h4>Передержка • Корги</h4>
                                        <p>15 — 17 мая (2 ночи)</p>
                                    </div>
                                    <div className="feed-price">4 500 ₽</div>
                                    <div className="btn-row">
                                        <div className="btn-sml accept">Принять</div>
                                    </div>
                                </div>

                                {/* Item 2: Payout */}
                                <div className="feed-item payout">
                                    <div className="feed-header">
                                        <div className="badge green">Выплачено</div>
                                        <div className="time">Вчера</div>
                                    </div>
                                    <div className="feed-body">
                                        <h4>Выплата за неделю</h4>
                                    </div>
                                    <div className="feed-price success">+ 12 400 ₽</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SitterAppPreviewSection;