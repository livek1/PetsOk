// --- File: src/components/becomeASitter/FinalSitterCTA.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import '@/style/components/becomeASitter/FinalSitterCTA.scss';

interface FinalSitterCTAProps {
    onGetStartedClick: () => void;
}

const FinalSitterCTA: React.FC<FinalSitterCTAProps> = ({ onGetStartedClick }) => {
    return (
        <motion.section className="final-sitter-cta" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
            <div className="final-sitter-cta__content">
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                    Готовы начать работать с PetsOk?
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    Сотни владельцев питомцев прямо сейчас ищут надежного человека. Пройдите регистрацию и получите первые заказы.
                </motion.p>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ width: '100%', maxWidth: '400px' }}>
                    <button type="button" onClick={onGetStartedClick} className="final-sitter-cta__button">
                        Создать анкету специалиста
                    </button>
                    <span className="final-sitter-cta__guarantee">Бесплатно • Ни к чему не обязывает</span>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default FinalSitterCTA;