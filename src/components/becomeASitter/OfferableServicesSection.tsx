// --- File: src/components/becomeASitter/OfferableServicesSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import '../../style/components/becomeASitter/OfferableServicesSection.scss';
import { enabledServicesForSitterPage } from '../../config/appConfig';

const OfferableServicesSection: React.FC = () => {
    const { t } = useTranslation();
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    // Фильтрация
    const displayedServices = enabledServicesForSitterPage.filter(service => {
        if (!isConfigLoaded) return true;
        return activeServices.includes(service.id);
    });

    if (displayedServices.length === 0) {
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
            <motion.p className="offerable-services-section__subtitle" variants={itemVariants}>
                {t('offerableServicesSection.sectionSubtitle')}
            </motion.p>

            <div className="offerable-services-section__grid">
                {displayedServices.map((service, index) => (
                    <motion.div
                        key={service.id}
                        className={`service-item-card ${service.highlightKey ? 'highlighted' : ''}`}
                        custom={index}
                        variants={itemVariants}
                    >
                        {/* Бейдж */}
                        {service.highlightKey && (
                            <span className="service-item-card__highlight-badge">{t(service.highlightKey)}</span>
                        )}

                        <div className="service-item-card__icon">
                            {/* 
                                ИСПРАВЛЕНИЕ ЗДЕСЬ: 
                                Добавляем color="currentColor" 
                            */}
                            {service.IconComponent && (
                                <service.IconComponent
                                    width={28}
                                    height={28}
                                    color="currentColor"
                                />
                            )}
                        </div>

                        <h3 className="service-item-card__title">{t(service.nameKey)}</h3>

                        <p className="service-item-card__description">{t(service.descKey)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default OfferableServicesSection;