// --- File: src/components/becomeASitter/HowItWorksSitterSteps.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import '@/style/components/becomeASitter/HowItWorksSitterSteps.scss';

// Иконки
const IconVerify = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconStudy = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconProfile = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconWork = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#3598FE" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

const HowItWorksSitterSteps: React.FC = () => {
    const steps = [
        { icon: <IconVerify />, title: "Проверка документов", desc: "Пройдите быструю проверку паспорта для обеспечения безопасности платформы." },
        { icon: <IconStudy />, title: "Обучение и тест", desc: "Изучите наши материалы по уходу за животными и пройдите небольшое тестирование." },
        { icon: <IconProfile />, title: "Создание анкеты", desc: "Расскажите о себе, своем опыте и установите собственные цены на услуги." },
        { icon: <IconWork />, title: "Получение заказов", desc: "Принимайте заявки от владельцев, проводите время с питомцами и получайте доход." },
    ];

    const sectionVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="how-it-works-sitter-steps"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="wrapper">
                <motion.h2 variants={itemVariants}>Как начать работу?</motion.h2>
                <div className="how-it-works-sitter-steps__grid">
                    {steps.map((step, index) => (
                        <motion.div key={index} className="step-card" variants={itemVariants}>
                            <div className="step-card__top">
                                <span className="step-card__number">0{index + 1}</span>
                                <div className="step-card__icon">{step.icon}</div>
                            </div>
                            <h3 className="step-card__title">{step.title}</h3>
                            <p className="step-card__description">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default HowItWorksSitterSteps;