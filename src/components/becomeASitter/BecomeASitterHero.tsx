// --- File: components/becomeASitter/BecomeASitterHero.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/BecomeASitterHero.scss';
import heroBackgroundImage from '../../assets/sitter-hero-bg.jpg';

// --- ИНТЕРФЕЙС ПРОПСОВ ОБНОВЛЕН ---
interface BecomeSitterHeroProps {
    isPreloading: boolean;
    onGetStartedClick: () => void;
}

const BecomeSitterHero: React.FC<BecomeSitterHeroProps> = ({ isPreloading, onGetStartedClick }) => {
    const { t } = useTranslation();

    const heroStyle = {
        backgroundImage: `url(${heroBackgroundImage})`
    };

    return (
        <motion.section
            className="become-sitter-hero"
            style={heroStyle}
            initial={{ opacity: 0 }}
            animate={isPreloading ? {} : { opacity: 1 }}
            transition={{ duration: 0.6, delay: isPreloading ? 0.5 : 0.1 }}
        >
            <div className="become-sitter-hero__overlay"></div>
            <div className="become-sitter-hero__content wrapper">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={isPreloading ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: isPreloading ? 0.7 : 0.3, duration: 0.7, ease: "easeOut" }}
                >
                    {t('sitterHero.title')}
                </motion.h1>
                <motion.p
                    className="become-sitter-hero__subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isPreloading ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: isPreloading ? 0.9 : 0.5, duration: 0.7, ease: "easeOut" }}
                >
                    {t('sitterHero.subtitle')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isPreloading ? {} : { opacity: 1, scale: 1 }}
                    transition={{ delay: isPreloading ? 1.1 : 0.7, duration: 0.6, ease: "backOut" }}
                >
                    {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: <a> заменен на <button> и используется onClick --- */}
                    <button
                        type="button"
                        onClick={onGetStartedClick}
                        className="become-sitter-hero__cta-button"
                    >
                        {t('sitterHero.ctaButton')}
                    </button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default BecomeSitterHero;