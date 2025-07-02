// --- File: src/components/becomeASitter/SafetyFirstSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/SafetyFirstSection.scss';

// Иконки
const IconGuarantee: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor" /></svg>;
const IconSecurePayments: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" opacity="0.6" /><path d="M7 11V7a5 5 0 0110 0v4" fill="currentColor" /></svg>;
const IconBackgroundCheck: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-.53 14l-4.7-4.7 1.4-1.4 3.3 3.3 7.3-7.3 1.4 1.4-8.7 8.7z" fill="currentColor" /></svg>;
const IconSupportTeam: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor" /></svg>;
const IconEducation: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" /></svg>;

const SafetyFirstSection: React.FC = () => {
    const { t } = useTranslation();

    const safetyPoints = [
        { icon: <IconGuarantee />, textKey: "sitterSafety.guarantee", defaultText: "Каждая услуга, которую вы предлагаете на PetsOk, поддерживается Гарантией PetsOk." },
        { icon: <IconSecurePayments />, textKey: "sitterSafety.payments", defaultText: "Безопасные и удобные онлайн-платежи." },
        { icon: <IconBackgroundCheck />, textKey: "sitterSafety.checks", defaultText: "Возможность прохождения общей проверки биографии для каждого ситтера." },
        { icon: <IconSupportTeam />, textKey: "sitterSafety.supportTeamUpdated", defaultText: "Наша команда поддержки всегда готова помочь вам 24/7." }, // Убрано "vet assistance"
        { icon: <IconEducation />, textKey: "sitterSafety.education", defaultText: "Постоянное обучение и ресурсы по уходу за питомцами для ситтеров." },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
    };

    const textContentVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 30, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="safety-first-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="safety-first-section__text-content">
                <motion.h2 variants={textContentVariants}>
                    {t('sitterSafety.title', 'Безопасность превыше всего. Всегда.')}
                </motion.h2>
                <motion.p className="safety-first-section__subtitle" variants={textContentVariants}>
                    {t('sitterSafety.subtitle', 'Мы неустанно работаем, чтобы хвосты продолжали вилять, а владельцы питомцев были спокойны.')}
                </motion.p>
                <ul className="safety-first-section__points-list">
                    {safetyPoints.map((point, index) => (
                        <motion.li key={index} className="safety-point-item" variants={listItemVariants} custom={index}>
                            <span className="safety-point-item__icon">{point.icon}</span>
                            <span>{t(point.textKey, point.defaultText)}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>
            <motion.div className="safety-first-section__image-wrapper" variants={imageVariants}>
            </motion.div>
        </motion.section>
    );
};

export default SafetyFirstSection;