// --- File: src/components/becomeASitter/WhyBecomeSitterSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import '@/style/components/becomeASitter/WhyBecomeSitterSection.scss';

const IconMoney = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconFreedom = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClients = () => <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

const WhyBecomeSitterSection: React.FC = () => {
    return (
        <motion.section className="why-become-sitter" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="wrapper">
                <motion.h2 className="why-become-sitter__title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                    Почему специалисты выбирают PetsOk?
                </motion.h2>

                <div className="why-become-sitter__grid">
                    {/* Карточка 1 */}
                    <motion.div className="feature-card feature-card--highlight" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="feature-card__icon"><IconMoney /></div>
                        <h3>100% дохода — ваши</h3>
                        <p>Мы ценим ваш труд. Вы сами устанавливаете прайс на свои услуги и имеете возможность работать <strong>без комиссии сервиса</strong>. Вы получаете ровно ту сумму, которую указали.</p>
                    </motion.div>

                    {/* Карточка 2 */}
                    <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="feature-card__icon text-blue"><IconFreedom /></div>
                        <h3>Абсолютная свобода</h3>
                        <p>Вы сами решаете, какие услуги оказывать, с какими животными работать и какую цену устанавливать. Полный контроль над вашим графиком и доходом.</p>
                    </motion.div>

                    {/* Карточка 3 (Изменена) */}
                    <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="feature-card__icon text-orange"><IconClients /></div>
                        <h3>Мы сами находим клиентов</h3>
                        <p>Забудьте о самостоятельном поиске заказов и расходах на рекламу. Мы берем всё продвижение на себя и приводим владельцев питомцев прямо к вам в профиль.</p>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default WhyBecomeSitterSection;