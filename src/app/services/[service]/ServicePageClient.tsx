// --- File: src/app/services/[service]/ServicePageClient.tsx ---
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import style from '@/style/pages/ServiceLanding.module.scss';

// --- ИКОНКИ ---
import BoardingIcon from '@/components/icons/BoardingIcon';
import DogWalkingIcon from '@/components/icons/DogWalkingIcon';
import DropInVisitsIcon from '@/components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '@/components/icons/DoggyDayCareIcon';
import Image from 'next/image';

const HeartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const ShieldIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const MapIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const CameraIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ChevronIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const StarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const MobileIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;

// --- МАППИНГ ИКОНОК ---
const HeroIconMap: Record<string, React.FC<any>> = {
    'boarding': BoardingIcon,
    'walking': DogWalkingIcon,
    'daycare': DoggyDayCareIcon,
    'dropin': DropInVisitsIcon,
};

const BenefitIconMap: Record<string, React.FC<any>> = {
    'home': HomeIcon,
    'heart': HeartIcon,
    'camera': CameraIcon,
    'shield': ShieldIcon,
    'map': MapIcon,
};

const AuthModal = dynamic(
    () => import('@/components/modals/AuthModal').then(mod => mod.AuthModal),
    { ssr: false }
);

export default function ServicePageClient({ data }: { data: any }) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const handleCreateOrderClick = () => {
        setAuthModalOpen(true);
    };

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const HeroIcon = HeroIconMap[data.hero.iconName] || BoardingIcon;

    return (
        <div className={style.pageWrapper} style={{ '--theme-color': data.hero.color, '--theme-light': data.hero.colorLight } as React.CSSProperties}>
            <Header onAuthClick={() => setAuthModalOpen(true)} />

            {/* --- HERO СЕКЦИЯ --- */}
            <section className={style.hero}>
                <div className={style.glowBlob1}></div>
                <div className={style.glowBlob2}></div>

                <div className={style.container}>
                    <div className={style.heroContent}>
                        <motion.div
                            className={style.textContent}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        >
                            <div className={style.ratingBadge}>
                                <StarIcon />
                                <span><strong>5.0</strong> средняя оценка ситтеров</span>
                            </div>

                            <h1>{data.hero.title}</h1>
                            <p>{data.hero.subtitle}</p>

                            <button className={style.ctaBtn} onClick={handleCreateOrderClick} style={{ backgroundColor: data.hero.color }}>
                                Найти специалиста
                            </button>
                        </motion.div>

                        <motion.div
                            className={style.visualContent}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {/* НОВЫЙ КОД С ФОТОГРАФИЕЙ: */}
                            <div className={style.heroImageWrapper}>
                                <Image
                                    src={data.hero.heroImage}
                                    alt={data.hero.title}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID: ЧТО ВХОДИТ + ПРЕИМУЩЕСТВА --- */}
            <section className={style.bentoSection}>
                <div className={style.container}>
                    <div className={style.sectionHeader}>
                        <h2>Продумано до мелочей</h2>
                        <p>Всё для комфорта питомца и вашего спокойствия.</p>
                    </div>

                    <div className={style.bentoGrid}>

                        {/* 1. БОЛЬШАЯ КАРТОЧКА НА ВСЮ ШИРИНУ (Что входит) */}
                        <motion.div
                            className={`${style.bentoCard} ${style.bentoLarge}`}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        >
                            <div className={style.bentoLargeText}>
                                <h3>Что входит в стоимость?</h3>
                                <p className={style.bentoSub}>Фиксированная цена без скрытых доплат. В базовую услугу уже включено:</p>
                            </div>
                            <div className={style.bentoLargeList}>
                                <ul className={style.checkList}>
                                    {data.included.map((item: string, i: number) => (
                                        <li key={i}>
                                            <CheckCircleIcon />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* 2. ТРИ МАЛЕНЬКИЕ КАРТОЧКИ В РЯД (Преимущества) */}
                        {data.benefits.map((b: any, i: number) => {
                            const BIcon = BenefitIconMap[b.iconName] || HeartIcon;
                            return (
                                <motion.div
                                    key={i} className={style.bentoCard}
                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * (i + 1) }}
                                >
                                    <div className={style.bIcon} style={{ color: data.hero.color, backgroundColor: data.hero.colorLight }}>
                                        <BIcon />
                                    </div>
                                    <h4>{b.title}</h4>
                                    <p>{b.desc}</p>
                                </motion.div>
                            )
                        })}

                    </div>
                </div>
            </section>

            {/* --- ГЛОБАЛЬНЫЕ ГАРАНТИИ --- */}
            <section className={style.guaranteesSection}>
                <div className={style.container}>
                    <div className={style.guaranteesBox}>
                        <div className={style.gItem}>
                            <ShieldIcon />
                            <div>
                                <h4>Только проверенные люди</h4>
                                <p>Ситтеры проходят тест на знание зоопсихологии и строгую проверку паспорта.</p>
                            </div>
                        </div>
                        <div className={style.gItem}>
                            <HeartIcon />
                            <div>
                                <h4>Ветеринар на связи</h4>
                                <p>В каждый заказ включена бесплатная онлайн-поддержка ветеринарного врача.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- КАК ЭТО РАБОТАЕТ --- */}
            <section className={style.howItWorksSection}>
                <div className={style.container}>
                    <div className={style.sectionHeader}>
                        <h2>Как это работает</h2>
                    </div>
                    <div className={style.stepsLine}>
                        <div className={style.stepBox}>
                            <div className={style.stepNum}>1</div>
                            <h4>Оставьте заявку</h4>
                            <p>Укажите даты, город и особенности питомца. Это быстро и абсолютно бесплатно.</p>
                        </div>
                        <div className={style.connector}></div>
                        <div className={style.stepBox}>
                            <div className={style.stepNum}>2</div>
                            <h4>Выберите ситтера</h4>
                            <p>Изучите отклики, почитайте реальные отзывы и задайте вопросы во встроенном чате.</p>
                        </div>
                        <div className={style.connector}></div>
                        <div className={style.stepBox}>
                            <div className={style.stepNum}>3</div>
                            <h4>Отдыхайте и получайте отчеты</h4>
                            <p>Во время услуги ситтер будет присылать чек-листы, GPS-треки и милые фото прямо в приложение.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section className={style.faqSection}>
                <div className={style.container}>
                    <div className={style.sectionHeader}>
                        <h2>Частые вопросы</h2>
                    </div>
                    <div className={style.faqList}>
                        {data.faq.map((item: any, i: number) => (
                            <div key={i} className={`${style.faqItem} ${openFaqIndex === i ? style.open : ''}`}>
                                <div className={style.faqHeader} onClick={() => toggleFaq(i)}>
                                    <h3>{item.q}</h3>
                                    <ChevronIcon className={style.chevron} />
                                </div>
                                <AnimatePresence>
                                    {openFaqIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            className={style.faqBody}
                                        >
                                            <div className={style.faqContent}>{item.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- APP CTA --- */}
            <section className={style.appCtaSection}>
                <div className={style.container}>
                    <div className={style.appCtaBox}>
                        <div className={style.appText}>
                            <h2>Всё под контролем в приложении</h2>
                            <p>Управляйте заказами, общайтесь с ситтерами и получайте детализированные отчеты прямо в смартфоне.</p>
                            <button className={style.primaryBtn} onClick={handleCreateOrderClick} style={{ backgroundColor: data.hero.color }}>
                                Создать заявку онлайн
                            </button>
                        </div>
                        <div className={style.appIcon} style={{ color: data.hero.color }}>
                            <MobileIcon />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="register" />

            {/* Sticky Mobile Button */}
            <div className={style.stickyMobileBar}>
                <button onClick={handleCreateOrderClick} className={style.stickyBtn} style={{ backgroundColor: data.hero.color }}>
                    Создать заявку
                </button>
            </div>
        </div>
    );
}