// --- File: src/components/home/HowItWorksSimple.tsx ---
'use client'; // Обязательно для использования useState и useEffect

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/style/components/HowItWorksSimple.scss";

const HowItWorksSimple: React.FC = () => {
    const { t } = useTranslation();

    // Состояние для определения мобильного экрана
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Эта функция выполнится только в браузере
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Устанавливаем начальное значение
        checkMobile();

        // Слушаем изменение размера окна
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const steps = [
        { id: "step1", imageUrl: "/images/step1.png", titleKey: "howItWorksSimple.step1.title", descriptionKey: "howItWorksSimple.step1.desc" },
        { id: "step2", imageUrl: "/images/step2.png", titleKey: "howItWorksSimple.step2.title", descriptionKey: "howItWorksSimple.step2.desc" },
        { id: "step3", imageUrl: "/images/step3.png", titleKey: "howItWorksSimple.step3.title", descriptionKey: "howItWorksSimple.step3.desc" },
    ];

    const stepVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.55, ease: "easeOut" } }),
    };

    const connectorVariants = {
        hidden: { scaleX: 0, opacity: 0, originX: 0 },
        visible: { scaleX: 1, opacity: 1, transition: { duration: 0.4, ease: "circOut" } },
    };

    const connectorVariantsVertical = {
        hidden: { scaleY: 0, opacity: 0, originY: 0 },
        visible: { scaleY: 1, opacity: 1, transition: { duration: 0.4, ease: "circOut" } },
    };

    return (
        <section className="how-it-works-simple">
            <div className="wrapper">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {t("howItWorksSimple.sectionTitle", "Как это работает? Всего 3 шага!")}
                </motion.h2>
                <div className="steps-container">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <motion.div
                                className="step"
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={stepVariants}
                            >
                                <img src={step.imageUrl} alt={t(step.titleKey)} className="step-image" />
                                <h3>{t(step.titleKey)}</h3>
                                <p>{t(step.descriptionKey)}</p>
                            </motion.div>
                            {index < steps.length - 1 && (
                                <motion.div
                                    className="step-connector"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ delay: index * 0.2 + 0.25, duration: 0.5, ease: "easeOut" }}
                                    // Теперь используем стейт isMobile вместо прямого обращения к window
                                    variants={isMobile ? connectorVariantsVertical : connectorVariants}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSimple;