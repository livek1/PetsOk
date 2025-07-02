// --- File: components/becomeASitter/FinalSitterCTA.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/FinalSitterCTA.scss';

// --- ИНТЕРФЕЙС ДЛЯ ПРОПСОВ ---
interface FinalSitterCTAProps {
    onGetStartedClick: () => void;
}

const FinalSitterCTA: React.FC<FinalSitterCTAProps> = ({ onGetStartedClick }) => {
    const { t } = useTranslation();

    return (
        <motion.section
            className="final-sitter-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            <div className="final-sitter-cta__content">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                >
                    {t('finalCtaSitter.title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                >
                    {t('finalCtaSitter.subtitle')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "backOut", delay: 0.4 }}
                >
                    {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: <a> заменен на <button> и используется onClick --- */}
                    <button
                        type="button"
                        onClick={onGetStartedClick}
                        className="final-sitter-cta__button"
                    >
                        {t('finalCtaSitter.cta')}
                    </button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default FinalSitterCTA;