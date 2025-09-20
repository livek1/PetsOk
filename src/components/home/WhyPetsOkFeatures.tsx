// --- File: src/components/WhyPetsOkFeatures.tsx ---
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../../style/components/WhyPetsOkFeatures.scss"; // Стили будут обновлены

import BoardingIcon from "../icons/BoardingIcon";
import HouseSittingIcon from "../icons/HouseSittingIcon";
import DogWalkingIcon from "../icons/DogWalkingIcon";
import DoggyDayCareIcon from "../icons/DoggyDayCareIcon";
import DropInVisitsIcon from "../icons/DropInVisitsIcon";

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
        { icon: <BoardingIcon />, titleKey: "ourServices.boarding.title", descriptionKey: "ourServices.boarding.desc" },
        { icon: <HouseSittingIcon />, titleKey: "ourServices.houseSitting.title", descriptionKey: "ourServices.houseSitting.desc" },
        { icon: <DropInVisitsIcon />, titleKey: "ourServices.dropIn.title", descriptionKey: "ourServices.dropIn.desc" },
        { icon: <DoggyDayCareIcon />, titleKey: "ourServices.dayNanny.title", descriptionKey: "ourServices.dayNanny.desc" },
        { icon: <DogWalkingIcon />, titleKey: "ourServices.walking.title", descriptionKey: "ourServices.walking.desc" },
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