import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../../style/components/HowItWorksSimple.scss";
import Imagestep1 from '../../assets/step1.png';
import Imagestep2 from '../../assets/step2.png';
import Imagestep3 from '../../assets/step3.png';

const HowItWorksSimple: React.FC = () => {
    const { t } = useTranslation();

    const steps = [
        { id: "step1", imageUrl: Imagestep1, titleKey: "howItWorksSimple.step1.title", descriptionKey: "howItWorksSimple.step1.desc" },
        { id: "step2", imageUrl: Imagestep2, titleKey: "howItWorksSimple.step2.title", descriptionKey: "howItWorksSimple.step2.desc" },
        { id: "step3", imageUrl: Imagestep3, titleKey: "howItWorksSimple.step3.title", descriptionKey: "howItWorksSimple.step3.desc" },
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
        <section className="how-it-works-simple"> {/* Убрали wrapper */}
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
                                    variants={window.innerWidth > 768 ? connectorVariants : connectorVariantsVertical}
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