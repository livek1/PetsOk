// --- File: components/becomeASitter/HowItWorksForSittersSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/HowItWorksForSittersSection.scss';

// Иконки
const IconStep1: React.FC = () => <svg viewBox="0 0 24 24" width="36" height="36"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.26 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" fill="currentColor" /></svg>;
const IconStep2: React.FC = () => <svg viewBox="0 0 24 24" width="36" height="36"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" /></svg>;
const IconStep3: React.FC = () => <svg viewBox="0 0 24 24" width="36" height="36"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" /></svg>;
const IconStep4: React.FC = () => <svg viewBox="0 0 24 24" width="36" height="36"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor" /></svg>;

const HowItWorksForSittersSection: React.FC = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <IconStep1 />,
            titleKey: "sitterHowItWorks.step1.title",
            descriptionKey: "sitterHowItWorks.step1.desc",
        },
        {
            icon: <IconStep2 />,
            titleKey: "sitterHowItWorks.step2.title",
            descriptionKey: "sitterHowItWorks.step2.desc",
        },
        {
            icon: <IconStep3 />,
            titleKey: "sitterHowItWorks.step3.title",
            descriptionKey: "sitterHowItWorks.step3.desc",
        },
        {
            icon: <IconStep4 />,
            titleKey: "sitterHowItWorks.step4.title",
            descriptionKey: "sitterHowItWorks.step4.desc",
        },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const stepVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
        }),
    };

    return (
        <motion.section
            className="how-it-works-sitter-steps wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <motion.h2 variants={stepVariants} custom={0}>
                {t('sitterHowItWorks.sectionTitle')}
            </motion.h2>
            <div className="how-it-works-sitter-steps__grid">
                {steps.map((step, index) => (
                    <motion.div key={index} className="step-card" variants={stepVariants} custom={index + 1}>
                        <div className="step-card__number-icon-wrapper">
                            <span className="step-card__number">0{index + 1}</span>
                            <div className="step-card__icon">{step.icon}</div>
                        </div>
                        <h3 className="step-card__title">{t(step.titleKey)}</h3>
                        <p className="step-card__description">{t(step.descriptionKey)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default HowItWorksForSittersSection;