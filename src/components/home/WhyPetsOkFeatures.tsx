// --- File: src/components/WhyPetsOkFeatures.tsx ---
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../../style/components/WhyPetsOkFeatures.scss"; // Стили будут обновлены

// --- Иконки для Услуг (ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ SVG) ---
const BoardingServiceIcon = () => <svg viewBox="0 0 24 24" width="28" height="28"><path d="M19 5H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM5 17V7h14v10H5zM10 11H8v2h2v-2zm0-4H8v2h2V7zm6 0h-2v2h2V7zm0 4h-2v2h2v-2zm-3 4h-2v2h2v-2z" fill="currentColor" /></svg>;
const HouseSittingServiceIcon = () => <svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" opacity="0.4" /><path d="M9 22V12h6v10" fill="currentColor" /></svg>;
const DropInServiceIcon = () => <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor" opacity="0.4" /><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" /></svg>;
const DayNannyServiceIcon = () => <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" fill="currentColor" opacity="0.4" /><path d="M12 7c.551 0 1 .449 1 1v3h3c.551 0 1 .449 1 1s-.449 1-1 1h-3v3c0 .551-.449 1-1 1s-1-.449-1-1v-3H8c-.551 0-1-.449-1-1s.449-1 1-1h3V8c0-.551.449-1 1-1zM12 9c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z" fill="currentColor" /></svg>;
const WalkingServiceIcon = () => <svg viewBox="0 0 24 24" width="28" height="28"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" fill="currentColor" /></svg>;

// --- Иконки для Гарантий/Преимуществ (оставляем как были или ваши новые) ---
const VerifiedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 12 15 22 5"></polyline></svg>;
const PhotoUpdatesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const Support247Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const SecurePaymentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
// --- Конец иконок ---


const WhyPetsOkFeatures: React.FC = () => {
    const { t } = useTranslation();

    // Данные для списка Услуг
    const servicesList = [
        { icon: <BoardingServiceIcon />, titleKey: "ourServices.boarding.title", descriptionKey: "ourServices.boarding.desc" },
        { icon: <HouseSittingServiceIcon />, titleKey: "ourServices.houseSitting.title", descriptionKey: "ourServices.houseSitting.desc" },
        { icon: <DropInServiceIcon />, titleKey: "ourServices.dropIn.title", descriptionKey: "ourServices.dropIn.desc" },
        { icon: <DayNannyServiceIcon />, titleKey: "ourServices.dayNanny.title", descriptionKey: "ourServices.dayNanny.desc" },
        { icon: <WalkingServiceIcon />, titleKey: "ourServices.walking.title", descriptionKey: "ourServices.walking.desc" },
    ];

    // Данные для списка Гарантий/Преимуществ
    const guaranteesList = [
        { icon: <VerifiedIcon />, titleKey: "ourGuarantees.verifiedSitters.title", descriptionKey: "ourGuarantees.verifiedSitters.desc" },
        { icon: <PhotoUpdatesIcon />, titleKey: "ourGuarantees.photoUpdates.title", descriptionKey: "ourGuarantees.photoUpdates.desc" },
        { icon: <Support247Icon />, titleKey: "ourGuarantees.support.title", descriptionKey: "ourGuarantees.support.desc" },
        { icon: <SecurePaymentsIcon />, titleKey: "ourGuarantees.securePayments.title", descriptionKey: "ourGuarantees.securePayments.desc" },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="why-petsok-section wrapper" // Изменен класс для ясности
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={sectionVariants}
        >
            <div className="why-petsok-section__main-title-wrapper">
                <motion.h2 variants={itemVariants}>{t("whyPetsOkNew.sectionTitle")}</motion.h2>
                <motion.p className="subtitle" variants={itemVariants}>
                    {t("whyPetsOkNew.sectionSubtitle")}
                </motion.p>
            </div>

            <div className="why-petsok-section__content">
                {/* Левая колонка - Наши Услуги */}
                <motion.div className="why-petsok-section__column services-column" variants={itemVariants}>
                    <h3>{t("whyPetsOkNew.servicesTitle")}</h3>
                    <ul className="info-list">
                        {servicesList.map((service, index) => (
                            <motion.li
                                key={service.titleKey}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.5 }}
                                variants={itemVariants}
                            >
                                <div className="info-icon">{service.icon}</div>
                                <div className="info-text">
                                    <h4>{t(service.titleKey)}</h4>
                                    <p>{t(service.descriptionKey)}</p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                    {/* Можно добавить кнопку "Все услуги", если есть такая страница */}
                    {/* <motion.a href="/all-services" className="cta-button-outline" variants={itemVariants}>
                        {t("whyPetsOkNew.seeAllServices", "Все наши услуги")}
                    </motion.a> */}
                </motion.div>

                {/* Правая колонка - Наши Гарантии */}
                <motion.div className="why-petsok-section__column guarantees-column" variants={itemVariants}>
                    <h3>{t("whyPetsOkNew.guaranteesTitle")}</h3>
                    <ul className="info-list">
                        {guaranteesList.map((guarantee, index) => (
                            <motion.li
                                key={guarantee.titleKey}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.5 }}
                                variants={itemVariants}
                            >
                                <div className="info-icon">{guarantee.icon}</div>
                                <div className="info-text">
                                    <h4>{t(guarantee.titleKey)}</h4>
                                    <p>{t(guarantee.descriptionKey)}</p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                    <motion.a
                        href="/search" // Основной CTA
                        className="cta-button-main" // Главная кнопка призыва к действию
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(53, 152, 254, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t("header.link2", "Найти ситтера")}
                    </motion.a>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default WhyPetsOkFeatures; // Или новое имя файла, например OurServicesAndGuarantees