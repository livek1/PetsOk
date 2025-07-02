// --- File: components/becomeASitter/WhyBecomeSitterSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/WhyBecomeSitterSection.scss';

// Иконки
const IconFlexibleSchedule: React.FC = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>;
const IconEarnMore: React.FC = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.26 12.01c-.48-.2-1.02-.2-1.5-.2V15h2.75l.01-.01c.42-.19.8-.49.99-.99H15v-1h-1.5c.01-.34.02-.68.02-1.02H15V10h-2.26c-.48-.2-1.02-.2-1.5-.2V9h-2v1.01c-.48.2-.95.42-1.34.66L6 9v2l2 1v1l-2 1v2l1.9-1.16c.39.24.86.44 1.34.66V17h2v-1.01c.48-.2.95-.42 1.34-.66L18 17v-2l-2-1v-1l2-1V9l-1.9 1.16c-.39-.24-.86-.44-1.34-.66V8h-2v1.01z" /></svg>;
const IconLoveAnimals: React.FC = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
const IconFullSupport: React.FC = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>;

const WhyBecomeSitterSection: React.FC = () => {
    const { t } = useTranslation();

    const benefits = [
        { id: 'earnMore', icon: <IconEarnMore />, titleKey: 'whyBecomeSitter.earnMore.title', descriptionKey: 'whyBecomeSitter.earnMore.desc' },
        { id: 'flexible', icon: <IconFlexibleSchedule />, titleKey: 'whyBecomeSitter.flexible.title', descriptionKey: 'whyBecomeSitter.flexible.desc' },
        { id: 'love', icon: <IconLoveAnimals />, titleKey: 'whyBecomeSitter.love.title', descriptionKey: 'whyBecomeSitter.love.desc' },
        { id: 'support', icon: <IconFullSupport />, titleKey: 'whyBecomeSitter.support.title', descriptionKey: 'whyBecomeSitter.support.desc' },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="why-become-sitter wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <motion.h2 className="why-become-sitter__title" variants={itemVariants}>
                {t('whyBecomeSitter.sectionTitle')}
            </motion.h2>
            <motion.p className="why-become-sitter__subtitle" variants={itemVariants}>
                {t('whyBecomeSitter.sectionSubtitle')}
            </motion.p>
            <div className="why-become-sitter__benefits-grid">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={benefit.id}
                        className="benefit-card"
                        custom={index}
                        variants={itemVariants}
                    >
                        <div className="benefit-card__icon-wrapper">{benefit.icon}</div>
                        <h3 className="benefit-card__title">{t(benefit.titleKey)}</h3>
                        <p className="benefit-card__description">{t(benefit.descriptionKey)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default WhyBecomeSitterSection;