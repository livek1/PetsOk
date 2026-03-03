// --- File: src/components/becomeASitter/BecomeASitterHero.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import '@/style/components/becomeASitter/BecomeASitterHero.scss';

const PawIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8.5c-1.5 0-2.7-1.2-2.7-2.7S10.5 3.1 12 3.1s2.7 1.2 2.7 2.7-1.2 2.7-2.7 2.7zm-5.4 1.2c-1.3 0-2.3-1-2.3-2.3S5.3 5.1 6.6 5.1s2.3 1 2.3 2.3-1 2.3-2.3 2.3zm10.8 0c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM12 21c-4.2 0-7.4-3.1-7.4-6.8 0-1.9 1-3.6 2.6-4.7.7-.5 1.5-.7 2.4-.7 1.4 0 2.7.7 3.5 1.8.4.5 1.1.5 1.5 0 .8-1.1 2.1-1.8 3.5-1.8.9 0 1.7.2 2.4.7 1.6 1.1 2.6 2.8 2.6 4.7C19.4 17.9 16.2 21 12 21z" />
    </svg>
);
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const RubleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 11h8a4 4 0 0 0 0-8H9v18" /><path d="M6 15h8" /></svg>;

interface BecomeSitterHeroProps {
    isPreloading: boolean;
    onGetStartedClick: () => void;
}

const BecomeSitterHero: React.FC<BecomeSitterHeroProps> = ({ isPreloading, onGetStartedClick }) => {
    return (
        <section className="become-sitter-hero">
            <div className="become-sitter-hero__bg-container">
                <Image
                    src="/images/sitter-hero-bg.jpg"
                    alt="Работа догситтером PetsOk"
                    fill
                    priority
                    sizes="100vw"
                    quality={90}
                    className="become-sitter-hero__bg-image"
                />
                <div className="become-sitter-hero__overlay"></div>
            </div>

            <div className="become-sitter-hero__content wrapper">
                {/* Левая часть: Текст */}
                <div className="become-sitter-hero__text-col">
                    <motion.div className="become-sitter-hero__badge" initial={{ opacity: 0, y: 20 }} animate={isPreloading ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <PawIcon />
                        <span>Работа для любителей животных</span>
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={isPreloading ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
                        Зарабатывайте,<br /> занимаясь любимым делом
                    </motion.h1>

                    <motion.p className="become-sitter-hero__subtitle" initial={{ opacity: 0, y: 20 }} animate={isPreloading ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
                        Превратите любовь к животным в стабильный доход. Ваш график, ваши цены и уникальная возможность работать <strong>абсолютно без комиссии сервиса</strong>.
                    </motion.p>

                    <motion.div className="become-sitter-hero__action-group" initial={{ opacity: 0, scale: 0.9 }} animate={isPreloading ? {} : { opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.4 }}>
                        <button type="button" onClick={onGetStartedClick} className="become-sitter-hero__cta-button">
                            Стать специалистом
                        </button>
                        <div className="become-sitter-hero__micro-copy">
                            <CheckIcon /> Понятный процесс проверки и обучения
                        </div>
                    </motion.div>
                </div>

                {/* Правая часть: Карточка */}
                <motion.div className="become-sitter-hero__visual-col" initial={{ opacity: 0, x: 50 }} animate={isPreloading ? {} : { opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
                    <div className="income-card">
                        <div className="income-card__header">
                            <div className="icon-box"><RubleIcon /></div>
                            <span>Потенциальный доход</span>
                        </div>
                        <div className="income-card__amount">
                            40 000 ₽ <small>и выше</small>
                        </div>
                        <div className="income-card__divider"></div>
                        <div className="income-card__footer">
                            <CheckIcon />
                            <span>Выплаты в день начала заказа или по понедельникам на карту</span>
                        </div>

                        <div className="zero-commission-sticker">
                            <span className="percent">0%</span>
                            <span className="text">Комиссия</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BecomeSitterHero;