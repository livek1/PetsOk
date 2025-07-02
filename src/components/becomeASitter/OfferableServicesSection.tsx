// --- File: components/becomeASitter/OfferableServicesSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/OfferableServicesSection.scss';
import { enabledServicesForSitterPage } from '../../config/appConfig'; // <-- ИМПОРТ ДИНАМИЧЕСКИХ ДАННЫХ

// Иконки
const ServiceBoardingIcon: React.FC = () => <svg viewBox="0 0 24 24"><path d="M19 5H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zm-8 10H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z" fill="currentColor" /></svg>;
const ServiceWalkingIcon: React.FC = () => <svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" fill="currentColor" /></svg>;
const ServiceDayCareIcon: React.FC = () => <svg viewBox="0 0 24 24"><path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zM12 7a1 1 0 00-1 1v3H8a1 1 0 000 2h3v3a1 1 0 002 0v-3h3a1 1 0 000-2h-3V8a1 1 0 00-1-1z" fill="currentColor" /></svg>;
const ServiceHomeVisitsIcon: React.FC = () => <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 13h6V12H9v10z" fill="currentColor" /></svg>;

// --- НОВЫЙ ХЕЛПЕР ДЛЯ ВЫБОРА ИКОНКИ ПО КЛЮЧУ ---
const getIconByKey = (key: string) => {
    switch (key) {
        case 'boarding': return <ServiceBoardingIcon />;
        case 'walking': return <ServiceWalkingIcon />;
        case 'daycare': return <ServiceDayCareIcon />;
        case 'homevisits': return <ServiceHomeVisitsIcon />;
        default: return null;
    }
};

const OfferableServicesSection: React.FC = () => {
    const { t } = useTranslation();

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    // --- Если нет включенных сервисов для этой страницы, не рендерим секцию ---
    if (enabledServicesForSitterPage.length === 0) {
        return null;
    }

    return (
        <motion.section
            className="offerable-services-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={sectionVariants}
        >
            <motion.h2 variants={itemVariants}>{t('offerableServicesSection.sectionTitle')}</motion.h2>
            <motion.p className="offerable-services-section__subtitle" variants={itemVariants}>{t('offerableServicesSection.sectionSubtitle')}</motion.p>

            <div className="offerable-services-section__grid">
                {/* --- РЕНДЕРИМ КАРТОЧКИ НА ОСНОВЕ ДАННЫХ ИЗ КОНФИГА --- */}
                {enabledServicesForSitterPage.map((service, index) => (
                    <motion.div
                        key={service.id}
                        className={`service-item-card ${service.highlightKey ? 'highlighted' : ''}`}
                        custom={index}
                        variants={itemVariants}
                    >
                        <div className="service-item-card__icon">
                            {getIconByKey(service.iconKey)}
                        </div>
                        <h3 className="service-item-card__title">{t(service.nameKey)}</h3>
                        {service.highlightKey && (
                            <span className="service-item-card__highlight-badge">{t(service.highlightKey)}</span>
                        )}
                        <p className="service-item-card__description">{t(service.descKey)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default OfferableServicesSection;