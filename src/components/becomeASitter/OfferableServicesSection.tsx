// --- File: components/becomeASitter/OfferableServicesSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/OfferableServicesSection.scss';
import { enabledServicesForSitterPage } from '../../config/appConfig'; // <-- ИМПОРТ ДИНАМИЧЕСКИХ ДАННЫХ

// --- Локальные иконки и хелпер getIconByKey удалены, так как компонент иконки теперь передается напрямую в объекте service ---

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
    if (!enabledServicesForSitterPage || enabledServicesForSitterPage.length === 0) {
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
                            {/* 
                              ИСПРАВЛЕНИЕ: 
                              Рендерим компонент иконки напрямую из service.IconComponent,
                              а не ищем его по ключу service.iconKey.
                            */}
                            {service.IconComponent && <service.IconComponent />}
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