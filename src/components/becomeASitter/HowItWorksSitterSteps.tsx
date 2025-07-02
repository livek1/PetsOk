// --- File: components/becomeASitter/HowItWorksSitterSteps.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/HowItWorksSitterSteps.scss';

// Иконки
const IconStep1 = () => <svg viewBox="0 0 24 24"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.26 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" fill="currentColor" /></svg>;
const IconStep2 = () => <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" /></svg>;
const IconStep3 = () => <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-1.1 0-2-.9-2-2V8h18v8c0 1.1-.9 2-2 2zM5 6h14v1H5z" fill="currentColor" /></svg>;

const HowItWorksSitterSteps: React.FC = () => {
    const { t } = useTranslation();

    const steps = [
        { icon: <IconStep1 />, titleKey: "howItWorksSitterSteps.step1.title", descriptionKey: "howItWorksSitterSteps.step1.desc" },
        { icon: <IconStep2 />, titleKey: "howItWorksSitterSteps.step2.title", descriptionKey: "howItWorksSitterSteps.step2.desc" },
        { icon: <IconStep3 />, titleKey: "howItWorksSitterSteps.step3.title", descriptionKey: "howItWorksSitterSteps.step3.desc" },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="how-it-works-sitter-steps wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <motion.h2 variants={itemVariants}>{t('howItWorksSitterSteps.sectionTitle')}</motion.h2>
            <div className="how-it-works-sitter-steps__grid">
                {steps.map((step, index) => (
                    <motion.div key={index} className="step-card" variants={itemVariants}>
                        <div className="step-card__icon">{step.icon}</div>
                        <h3 className="step-card__title">{t(step.titleKey)}</h3>
                        <p className="step-card__description">{t(step.descriptionKey)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default HowItWorksSitterSteps;