// --- File: src/components/becomeASitter/OfferableServicesSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import '@/style/components/becomeASitter/OfferableServicesSection.scss';
import { enabledServicesForSitterPage } from '../../config/appConfig';

const OfferableServicesSection: React.FC = () => {
    const { t } = useTranslation();
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const sectionVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants: import("framer-motion").Variants = {
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

    // Кастомная функция для бейджей, чтобы подчеркнуть выгоду
    const getMarketingBadge = (serviceId: string) => {
        if (serviceId === 'boarding') return { text: 'Максимальный доход', type: 'gold' };
        if (serviceId === 'walking' || serviceId === 'drop_in_visit') return { text: 'Идеально в приложении', type: 'blue' };
        return null;
    };

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
                {displayedServices.map((service, index) => {
                    const badge = getMarketingBadge(service.id);
                    return (
                        <motion.div
                            key={service.id}
                            className={`service-item-card ${badge ? `highlighted-${badge.type}` : ''}`}
                            custom={index}
                            variants={itemVariants}
                        >
                            {/* Маркетинговый бейдж */}
                            {badge && (
                                <span className={`service-item-card__highlight-badge badge-${badge.type}`}>
                                    {badge.text}
                                </span>
                            )}

                            <div className="service-item-card__icon">
                                {service.IconComponent && (
                                    <service.IconComponent
                                        width={32}
                                        height={32}
                                        color="currentColor"
                                    />
                                )}
                            </div>

                            <h3 className="service-item-card__title">{t(service.nameKey)}</h3>
                            <p className="service-item-card__description">{t(service.descKey)}</p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
};

export default OfferableServicesSection;