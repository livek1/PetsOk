// --- File: src/components/home/LandingAddons.tsx ---
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import style from '@/style/components/home/LandingAddons.module.scss';

// --- ИКОНКИ ---
const CheckIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const CrossIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const MsgIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const MapRouteIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const TaskListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const GreenCheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>;

// --- ДОБАВИТЬ ЭТИ ИКОНКИ К ОСТАЛЬНЫМ В НАЧАЛЕ ФАЙЛА ---
const VetIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>; // Пульс/Медицина
const TrainerIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>; // Мишень/Дрессировка (Кинолог)
const PsychoIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>; // Сердце/Психология
const ArrowRightSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

// --- 1. СРАВНЕНИЕ С ГОСТИНИЦАМИ ---
export const ComparisonSection = () => {
    return (
        <section className={style.section}>
            <div className={style.wrapper}>
                <header className={style.sectionHeader}>
                    <h2>Скучаете по питомцу в отпуске?</h2>
                    <p>Сделайте так, чтобы ему было так же хорошо, как и вам. Забудьте о зоогостиницах.</p>
                </header>

                <div className={style.comparisonGrid}>
                    <motion.article className={`${style.compareCard} ${style.bad}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h3>Обычная зоогостиница</h3>
                        <ul>
                            <li><CrossIcon /> <strong>Жизнь в клетке</strong> (вольер 1х1 метр)</li>
                            <li><CrossIcon /> <strong>Стресс</strong> от постоянного лая других собак</li>
                            <li><CrossIcon /> <strong>Строгий режим</strong> (выгул по 15 минут в день)</li>
                            <li><CrossIcon /> <strong>Дефицит внимания</strong> (1 сотрудник на 20 животных)</li>
                        </ul>
                    </motion.article>

                    <motion.article className={`${style.compareCard} ${style.good}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                        <div className={style.recommendedBadge}>Выбор владельцев</div>
                        <h3>Домашний ситтер PetsOk</h3>
                        <ul>
                            <li><CheckIcon /> <strong>Квартирное содержание</strong> (сон на диване)</li>
                            <li><CheckIcon /> <strong>Спокойная обстановка</strong> (как дома)</li>
                            <li><CheckIcon /> <strong>Ваш личный график</strong> прогулок и кормления</li>
                            <li><CheckIcon /> <strong>100% внимания</strong> (питомец под постоянным присмотром ситтера)</li>
                        </ul>
                    </motion.article>
                </div>
            </div>
        </section>
    );
};

export const ExpertsSection = () => {
    const categories = [
        {
            title: "Ветеринарные врачи",
            icon: "/images/badges/vet.png", // Путь к вашей картинке
            painPoints: "Нужно давать таблетки, делать уколы или требуется уход за пожилым питомцем?",
            features: ["Строгий график приема лекарств", "Умение делать инъекции", "Оказание первой помощи"],
            linkText: "Найти ситтера с мед. навыками",
            linkHref: "/search?role=vet"
        },
        {
            title: "Профессиональные кинологи",
            icon: "/images/badges/cynologist.png",
            painPoints: "Крупная собака тянет поводок, подбирает с земли или проявляет зооагрессию?",
            features: ["Безопасный выгул сильных собак", "Коррекция поведения на улице", "Отработка базовых команд"],
            linkText: "Найти кинолога",
            linkHref: "/search?role=trainer"
        },
        {
            title: "Зоопсихологи",
            icon: "/images/badges/brain.png",
            painPoints: "Питомец воет в одиночестве, портит вещи или тяжело адаптируется после приюта?",
            features: ["Снижение сепарационной тревоги", "Мягкая адаптация пугливых", "Круглосуточный присмотр без стресса"],
            linkText: "Найти зоопсихолога",
            linkHref: "/search?role=psycho"
        }
    ];

    return (
        <section className={`${style.section} ${style.bgLight}`}>
            <div className={style.wrapper}>
                <header className={style.sectionHeader}>
                    <h2>Кому доверить особенного питомца?</h2>
                    <p>
                        На PetsOk работают не только заботливые любители животных, но и <strong>сертифицированные профильные специалисты</strong>. Идеально для хвостиков, требующих особого подхода.
                    </p>
                </header>

                <div className={style.expertsGrid}>
                    {categories.map((cat, i) => (
                        <motion.article
                            key={i}
                            className={style.expertCategoryCard}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            viewport={{ once: true }}
                        >
                            {/* Иконка жестко слева */}
                            <div className={style.expertIconWrapper}>
                                <Image
                                    src={cat.icon}
                                    alt={cat.title}
                                    width={72} // Крупный размер
                                    height={72}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>

                            {/* Весь текст жестко справа в отдельной колонке */}
                            <div className={style.expertTextContent}>
                                <h3>{cat.title}</h3>
                                <p className={style.painPoints}>{cat.painPoints}</p>

                                <ul className={style.featureList}>
                                    {cat.features.map((feature, idx) => (
                                        <li key={idx}><CheckIcon /> {feature}</li>
                                    ))}
                                </ul>

                                {/* Ссылка сама прижмется к низу благодаря margin-top: auto в CSS */}
                                <a href={cat.linkHref} className={style.expertLink}>
                                    {cat.linkText} <ArrowRightSmall />
                                </a>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- 3. ЧАТ И ФОТООТЧЕТЫ (Киллер-фича) ---
export const ChatPreviewSection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Автоматическое переключение вкладок
    useEffect(() => {
        if (isHovered) return; // Пауза при наведении (Accessibility best practice)
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <section className={style.section}>
            <div className={`${style.wrapper} ${style.chatSection}`}>

                {/* ТЕКСТОВЫЙ БЛОК + ТАБЫ */}
                <motion.div className={style.textContent} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2>Вы всегда знаете, что с ним всё хорошо</h2>
                    <p>Тревожитесь? Это нормально. В PetsOk вы получаете не только сообщения от ситтера, но и детализированные системные отчеты прямо в приложении.</p>

                    <ul className={style.featureTabs} role="tablist" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                        <li role="presentation">
                            <button
                                role="tab"
                                aria-selected={activeTab === 0}
                                className={activeTab === 0 ? style.activeTab : ''}
                                onClick={() => setActiveTab(0)}
                            >
                                <div className={style.tabIcon}><MsgIcon /></div>
                                <div className={style.tabTextCol}>
                                    <strong>Постоянная связь в чате</strong>
                                    <span>Задавайте вопросы и получайте фото/видео в реальном времени.</span>
                                </div>
                            </button>
                        </li>
                        <li role="presentation">
                            <button
                                role="tab"
                                aria-selected={activeTab === 1}
                                className={activeTab === 1 ? style.activeTab : ''}
                                onClick={() => setActiveTab(1)}
                            >
                                <div className={style.tabIcon}><MapRouteIcon /></div>
                                <div className={style.tabTextCol}>
                                    <strong>Отчеты о прогулках</strong>
                                    <span>Точный GPS-маршрут, время на улице и отметки о туалете.</span>
                                </div>
                            </button>
                        </li>
                        <li role="presentation">
                            <button
                                role="tab"
                                aria-selected={activeTab === 2}
                                className={activeTab === 2 ? style.activeTab : ''}
                                onClick={() => setActiveTab(2)}
                            >
                                <div className={style.tabIcon}><TaskListIcon /></div>
                                <div className={style.tabTextCol}>
                                    <strong>Отчеты о визитах</strong>
                                    <span>Детальный чек-лист о кормлении, играх и самочувствии хвостика.</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </motion.div>

                {/* МАКЕТ ТЕЛЕФОНА */}
                <motion.div className={style.phoneMockupContainer} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <div className={style.phoneMockup} aria-live="polite">
                        <AnimatePresence mode="wait">

                            {/* ТАБ 0: ЧАТ */}
                            {activeTab === 0 && (
                                <motion.div
                                    key="tab0"
                                    className={style.mockupWrapper}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                >
                                    <div className={style.chatHeader}>Ситтер Анна</div>
                                    <div className={style.chatBody}>
                                        <div className={style.message}>
                                            Доброе утро! Мы проснулись, покушали всю порцию и собираемся на прогулку 🐕
                                            <span className={style.time}>08:15</span>
                                        </div>
                                        <div className={style.message}>
                                            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop" alt="Собака на прогулке, отчет ситтера" loading="lazy" />
                                            Погуляли отлично! Арчи сходил в туалет, встретил друга. Сейчас спит пузом кверху 😊
                                            <span className={style.time}>09:30</span>
                                        </div>
                                        <div className={`${style.message} ${style.me}`}>
                                            Спасибо большое! ❤️ Как камень с души!
                                            <span className={style.time}>09:35</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ТАБ 1: ПРОГУЛКА */}
                            {activeTab === 1 && (
                                <motion.div
                                    key="tab1"
                                    className={style.mockupWrapper}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                >
                                    <div className={style.chatHeader}>Отчет: Прогулка</div>
                                    <div className={style.mockupBody}>
                                        <div className={style.reportMap} aria-hidden="true">
                                            <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="none">
                                                <path d="M0 40 L100 60 L150 20 L300 80" stroke="#CBD5E0" strokeWidth="6" fill="none" />
                                                <path d="M50 160 L80 90 L200 120 L250 160" stroke="#CBD5E0" strokeWidth="6" fill="none" />
                                                <path d="M30 80 C 80 120, 150 40, 250 100" stroke="#3598FE" strokeWidth="4" strokeDasharray="6 6" fill="none" />
                                                <circle cx="30" cy="80" r="6" fill="#3598FE" />
                                                <circle cx="250" cy="100" r="6" fill="#E53E3E" />
                                            </svg>
                                            <div className={style.mapLabel}>GPS Трек</div>
                                        </div>
                                        <div className={style.reportStats}>
                                            <div className={style.statBox}>
                                                <div className={style.statVal}>45 мин</div>
                                                <div className={style.statLbl}>Время</div>
                                            </div>
                                            <div className={style.statBox}>
                                                <div className={style.statVal}>3.2 км</div>
                                                <div className={style.statLbl}>Дистанция</div>
                                            </div>
                                        </div>
                                        <div className={style.reportEvents}>
                                            <div className={style.eventTag}>💦 Пописал (2)</div>
                                            <div className={style.eventTag}>💩 Покакал (1)</div>
                                        </div>
                                        <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=300&h=150&fit=crop" className={style.reportPhoto} alt="Счастливая собака на выгуле" loading="lazy" />
                                    </div>
                                </motion.div>
                            )}

                            {/* ТАБ 2: ВИЗИТ */}
                            {activeTab === 2 && (
                                <motion.div
                                    key="tab2"
                                    className={style.mockupWrapper}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                >
                                    <div className={style.chatHeader}>Отчет: Визит няни</div>
                                    <div className={style.mockupBody}>
                                        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop" className={style.reportPhotoBig} alt="Кот после кормления ситтером" loading="lazy" />
                                        <div className={style.reportChecklist}>
                                            <div className={style.checkItem}><GreenCheckIcon /> Покормил</div>
                                            <div className={style.checkItem}><GreenCheckIcon /> Налил свежую воду</div>
                                            <div className={style.checkItem}><GreenCheckIcon /> Убрал лоток</div>
                                            <div className={style.checkItem}><GreenCheckIcon /> Поиграл</div>
                                        </div>
                                        <div className={style.reportNote}>
                                            "Барсик был очень ласков сегодня, мурчал как трактор и скушал всю порцию! 🥰 Завтра приду в то же время."
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- ЛИПКАЯ КНОПКА ДЛЯ МОБИЛОК ---
export const MobileStickyCTA = ({ onClick }: { onClick: () => void }) => {
    return (
        <div className={style.stickyMobileBar}>
            <button onClick={onClick} className={style.stickyBtn}>
                Найти ситтера
            </button>
        </div>
    );
};