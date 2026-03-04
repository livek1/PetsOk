// --- File: src/components/home/WhyPetsOkFeatures.tsx ---
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { enabledServicesForSearch } from "@/config/appConfig";
import "@/style/components/WhyPetsOkFeatures.scss";

// SVG для стрелки в CTA карточке
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Fallback иконки (если картинки не прогрузятся)
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;

const SERVICE_TEXT_MAP: Record<string, { title: string; desc: string }> = {
    'boarding': { title: "ourServices.boarding.title", desc: "ourServices.boarding.desc" },
    'walking': { title: "ourServices.walking.title", desc: "ourServices.walking.desc" },
    'drop_in_visit': { title: "ourServices.dropIn.title", desc: "ourServices.dropIn.desc" },
    'doggy_day_care': { title: "ourServices.dayNanny.title", desc: "ourServices.dayNanny.desc" },
    'house_sitting': { title: "ourServices.houseSitting.title", desc: "ourServices.houseSitting.desc" },
};

interface WhyPetsOkFeaturesProps {
    onCreateOrderClick: () => void;
}

const WhyPetsOkFeatures: React.FC<WhyPetsOkFeaturesProps> = ({ onCreateOrderClick }) => {
    const { t } = useTranslation();
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const servicesList = useMemo(() => {
        return enabledServicesForSearch
            .filter(service => {
                if (!isConfigLoaded) return true;
                return activeServices.includes(service.id);
            })
            .map(service => {
                const texts = SERVICE_TEXT_MAP[service.id];
                return {
                    id: service.id,
                    icon: <service.IconComponent width={32} height={32} />,
                    titleKey: texts?.title || service.nameKey,
                    descriptionKey: texts?.desc || service.descriptionKey
                };
            });
    }, [activeServices, isConfigLoaded]);

    // ОБНОВЛЕННЫЕ ГАРАНТИИ (Идеи из маркетинга Dogsy)
    const guaranteesList = [
        {
            id: 'verified',
            imgSrc: '/images/icons/shield.png',
            fallbackIcon: <ShieldIcon />,
            titleKey: "Строгий отбор ситтеров",
            descriptionKey: "Одобряем только 15% кандидатов. Мы проверяем паспорт, соцсети и проводим тестирование на знание зоопсихологии.",
            color: '#3B82F6',
            bgColor: '#EFF6FF'
        },
        {
            id: 'vet',
            imgSrc: '/images/icons/vet.png',
            fallbackIcon: <ShieldIcon />,
            titleKey: "БЕСПЛАТНЫЙ ветеринар онлайн",
            descriptionKey: "В каждую передержку включена бесплатная онлайн-консультация. Если что-то пойдет не так, мы оперативно организуем помощь врача.",
            color: '#EF4444',
            bgColor: '#FEF2F2'
        },
        {
            id: 'meet',
            imgSrc: '/images/icons/handshake.png',
            fallbackIcon: <ShieldIcon />,
            titleKey: "Бесплатная предварительная встреча",
            descriptionKey: "Вы можете встретиться с ситтером до оплаты заказа. Познакомьте питомца и убедитесь, что вам комфортно.",
            color: '#10B981',
            bgColor: '#ECFDF5'
        },
        {
            id: 'contract',
            imgSrc: '/images/icons/contract.png',
            fallbackIcon: <ShieldIcon />,
            titleKey: "Официальный договор",
            descriptionKey: "При бронировании автоматически заключается юридический договор, защищающий права владельца и питомца.",
            color: '#8B5CF6',
            bgColor: '#F5F3FF'
        },
        {
            id: 'support',
            imgSrc: '/images/icons/support.png',
            fallbackIcon: <ShieldIcon />,
            titleKey: "Менеджеры на связи 24/7",
            descriptionKey: "Мы контролируем каждый заказ и всегда на связи, даже ночью. Поддержим в любой нестандартной ситуации.",
            color: '#F59E0B',
            bgColor: '#FFFBEB'
        }
    ];

    const containerVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.section
            className="why-petsok-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
        >
            <div className="wrapper">

                {/* ЗАГОЛОВОК */}
                <div className="why-petsok-section__header">
                    <motion.h2 variants={itemVariants}>
                        {t("whyPetsOkNew.sectionTitle", "PetsOk — это больше, чем просто передержка")}
                    </motion.h2>
                    <motion.p className="subtitle" variants={itemVariants}>
                        {t("whyPetsOkNew.sectionSubtitle", "Мы дарим душевное спокойствие благодаря любящему уходу за вашим питомцем и непревзойденной поддержке для вас.")}
                    </motion.p>
                </div>

                {/* 1. СЕТКА УСЛУГ (Горизонтальная) */}
                {servicesList.length > 0 && (
                    <motion.div
                        className="why-petsok-section__services-grid"
                        variants={containerVariants}
                    >
                        {servicesList.map((service) => (
                            <motion.div key={service.id} className="service-mini-card" variants={itemVariants}>
                                <div className="icon-circle">
                                    {service.icon}
                                </div>
                                <h3>{t(service.titleKey)}</h3>
                                <p>{t(service.descriptionKey)}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ЗАГОЛОВОК ДЛЯ ГАРАНТИЙ */}
                <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 40 }}>
                    <h3 style={{ fontSize: 32, fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' }}>
                        {t("whyPetsOkNew.guaranteesTitle", "Почему это абсолютно безопасно?")}
                    </h3>
                </div>

                {/* 2. СЕТКА ГАРАНТИЙ (Крупные карточки) */}
                <motion.div
                    className="why-petsok-section__guarantees-grid"
                    variants={containerVariants}
                >
                    {guaranteesList.map((item) => (
                        <motion.div
                            key={item.id}
                            className="guarantee-card"
                            variants={itemVariants}
                            // @ts-ignore
                            style={{
                                '--accent-color': item.color,
                                '--bg-color': item.bgColor
                            } as React.CSSProperties}
                        >
                            {/* Верхняя часть: Визуал (60%) */}
                            <div className="guarantee-card__image-area">
                                <img
                                    src={item.imgSrc}
                                    alt={t(item.titleKey)}
                                    loading="lazy"
                                />
                            </div>

                            {/* Нижняя часть: Текст (40%) */}
                            <div className="guarantee-card__content-area">
                                <h3>{t(item.titleKey, item.titleKey)}</h3>
                                <p>{t(item.descriptionKey, item.descriptionKey)}</p>
                            </div>
                        </motion.div>
                    ))}

                    {/* 6-я КАРТОЧКА - CTA (Целиком кликабельная, без кнопки) */}
                    <motion.div
                        className="cta-card-full"
                        variants={itemVariants}
                        onClick={onCreateOrderClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <h3>Хотите попробовать?</h3>
                        <p>Организуйте бесплатную встречу-знакомство с ситтером. Это ни к чему вас не обязывает.</p>

                        <div className="cta-arrow">
                            <ArrowRightIcon />
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </motion.section>
    );
};

export default WhyPetsOkFeatures;