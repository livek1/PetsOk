// --- File: components/becomeASitter/SupportAndSafetySection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/SupportAndSafetySection.scss';
// Предположим, у вас есть изображение
import sitterSafetyImage from '../../assets/sitter_safety.jpg';

const Icon247Support: React.FC = () => <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor" /></svg>;
const IconSecurePlatform: React.FC = () => <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" opacity="0.4" /><path d="M7 11V7a5 5 0 0110 0v4" fill="currentColor" /></svg>;
const IconCommunity: React.FC = () => <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" /></svg>;

const SupportAndSafetySection: React.FC = () => {
    const { t } = useTranslation();

    const points = [
        { id: 'support', icon: <Icon247Support />, titleKey: 'supportSafety.support.title', descriptionKey: 'supportSafety.support.desc' },
        { id: 'platform', icon: <IconSecurePlatform />, titleKey: 'supportSafety.platform.title', descriptionKey: 'supportSafety.platform.desc' },
        { id: 'community', icon: <IconCommunity />, titleKey: 'supportSafety.community.title', descriptionKey: 'supportSafety.community.desc' },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };
    const imageVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
    };

    return (
        <motion.section
            className="support-safety-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <motion.div className="support-safety-section__image-block" variants={imageVariants}>
                <img src={sitterSafetyImage} alt={t('supportSafety.imageAlt')} />
            </motion.div>
            <div className="support-safety-section__content-block">
                <motion.h2 className="support-safety-section__title" variants={itemVariants}>
                    {t('supportSafety.sectionTitle')}
                </motion.h2>
                <motion.p className="support-safety-section__subtitle" variants={itemVariants}>
                    {t('supportSafety.sectionSubtitle')}
                </motion.p>
                <ul className="support-safety-section__points-list">
                    {points.map((point, index) => (
                        <motion.li key={point.id} className="point-item" custom={index} variants={itemVariants}>
                            <div className="point-item__icon">{point.icon}</div>
                            <div className="point-item__text">
                                <h4>{t(point.titleKey)}</h4>
                                <p>{t(point.descriptionKey)}</p>
                            </div>
                        </motion.li>
                    ))}
                </ul>
                <motion.blockquote className="support-safety-section__testimonial" variants={itemVariants}>
                    <p>"{t('supportSafety.testimonial.quote')}"</p>
                    <footer>— {t('supportSafety.testimonial.author')}</footer>
                </motion.blockquote>
            </div>
        </motion.section>
    );
};

export default SupportAndSafetySection;