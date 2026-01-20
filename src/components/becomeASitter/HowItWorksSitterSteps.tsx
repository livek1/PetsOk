import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/HowItWorksSitterSteps.scss';

// Иконки (оставляем как есть)
const IconProfile = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#3598FE"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const IconVerify = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#3598FE"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>;
const IconWork = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#3598FE"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>;

const HowItWorksSitterSteps: React.FC = () => {
    const { t } = useTranslation();

    const steps = [
        { icon: <IconProfile />, titleKey: "becomeSitter.step1Title", descriptionKey: "becomeSitter.step1Desc" },
        { icon: <IconVerify />, titleKey: "becomeSitter.step2Title", descriptionKey: "becomeSitter.step2Desc" },
        { icon: <IconWork />, titleKey: "becomeSitter.step3Title", descriptionKey: "becomeSitter.step3Desc" },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="how-it-works-sitter-steps" // УБРАЛИ wrapper отсюда
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            {/* Добавили внутренний контейнер */}
            <div className="wrapper">
                <motion.h2 variants={itemVariants}>{t('becomeSitter.stepsTitle')}</motion.h2>
                <div className="how-it-works-sitter-steps__grid">
                    {steps.map((step, index) => (
                        <motion.div key={index} className="step-card" variants={itemVariants}>
                            <div className="step-card__top">
                                <span className="step-card__number">0{index + 1}</span>
                                <div className="step-card__icon">{step.icon}</div>
                            </div>
                            <h3 className="step-card__title">{t(step.titleKey)}</h3>
                            <p className="step-card__description">{t(step.descriptionKey)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default HowItWorksSitterSteps;