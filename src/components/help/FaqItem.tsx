import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import style from '../../style/pages/HelpPage.module.scss';

// Иконка стрелочки
const ChevronIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

interface FaqItemProps {
    question: string;
    answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${style.faqItem} ${isOpen ? style.open : ''}`}>
            <div className={style.faqHeader} onClick={() => setIsOpen(!isOpen)}>
                <h3>{question}</h3>
                <ChevronIcon className={`${style.chevron} ${isOpen ? style.rotated : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={style.faqBody}
                    >
                        <div
                            className={style.faqContent}
                            // Используем dangerouslySetInnerHTML для поддержки HTML тегов в ответах с бэка
                            dangerouslySetInnerHTML={{ __html: answer }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FaqItem;