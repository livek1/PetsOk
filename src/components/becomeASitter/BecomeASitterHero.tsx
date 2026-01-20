// --- File: src/components/becomeASitter/BecomeASitterHero.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/BecomeASitterHero.scss';
// Используем красивое фото (человек с собакой, счастливые)
// Убедись, что файл существует или замени путь
import heroBackgroundImage from '../../assets/sitter-hero-bg.jpg';

// Иконки
const PawIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const RubleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 11h8a4 4 0 0 0 0-8H9v18" /><path d="M6 15h8" /></svg>;

interface BecomeSitterHeroProps {
    isPreloading: boolean;
    onGetStartedClick: () => void;
}

const BecomeSitterHero: React.FC<BecomeSitterHeroProps> = ({ isPreloading, onGetStartedClick }) => {
    const { t } = useTranslation();

    return (
        <section className="become-sitter-hero">
            <div className="become-sitter-hero__bg-container">
                <div className="become-sitter-hero__bg-image" style={{ backgroundImage: `url(${heroBackgroundImage})` }} />
                <div className="become-sitter-hero__overlay"></div>
            </div>

            <div className="become-sitter-hero__content wrapper">
                {/* Левая часть: Текст */}
                <div className="become-sitter-hero__text-col">
                    <motion.div
                        className="become-sitter-hero__badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isPreloading ? {} : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <PawIcon />
                        <span>{t('becomeSitter.heroBadge')}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={isPreloading ? {} : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                    >
                        {t('becomeSitter.heroTitle')}
                    </motion.h1>

                    <motion.p
                        className="become-sitter-hero__subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isPreloading ? {} : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                    >
                        {t('becomeSitter.heroSubtitle')}
                    </motion.p>

                    <motion.button
                        type="button"
                        onClick={onGetStartedClick}
                        className="become-sitter-hero__cta-button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isPreloading ? {} : { opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t('becomeSitter.ctaButton')}
                    </motion.button>
                </div>

                {/* Правая часть: Карточка с доходом (Агрессивная) */}
                <motion.div
                    className="become-sitter-hero__visual-col"
                    initial={{ opacity: 0, x: 50 }}
                    animate={isPreloading ? {} : { opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <div className="income-card">
                        <div className="income-card__header">
                            <div className="icon-box"><RubleIcon /></div>
                            <span>{t('becomeSitter.earningsLabel')}</span>
                        </div>
                        <div className="income-card__amount">
                            {t('becomeSitter.earningsAmount')}
                            <small>/ {t('common.month')}</small>
                        </div>
                        <div className="income-card__divider"></div>
                        <div className="income-card__footer">
                            <CheckIcon />
                            <span>{t('becomeSitter.earningsNote')}</span>
                        </div>

                        {/* Плашка 0% комиссии - как стикер поверх */}
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