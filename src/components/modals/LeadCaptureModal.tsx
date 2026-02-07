// --- File: src/components/modals/LeadCaptureModal.tsx ---
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Cookies from 'js-cookie';
import style from '../../style/components/modals/LeadCaptureModal.module.scss';
import { useTranslation } from 'react-i18next';
import { createLead } from '../../services/api';
import { config as appConfig } from '../../config/appConfig';

// Иконка "Пёс-оператор поддержки" (для первого экрана)
const SupportDogIcon = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#EBF8FF" />
        <g transform="translate(25, 25) scale(0.7)">
            <path d="M15 40C10 40 5 60 10 70C15 80 30 50 30 45" fill="#EDDACC" stroke="#D69E2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M85 40C90 40 95 60 90 70C85 80 70 50 70 45" fill="#EDDACC" stroke="#D69E2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="25" y="20" width="50" height="60" rx="25" fill="#F6E05E" stroke="#D69E2E" strokeWidth="3" />
            <path d="M20 45V35C20 18.4315 33.4315 5 50 5C66.5685 5 80 18.4315 80 35V45" stroke="#2B6CB0" strokeWidth="4" strokeLinecap="round" />
            <rect x="15" y="35" width="10" height="20" rx="5" fill="#3182CE" />
            <rect x="75" y="35" width="10" height="20" rx="5" fill="#3182CE" />
            <path d="M80 50C90 50 95 60 95 70C95 75 90 78 80 75" stroke="#2D3748" strokeWidth="2" fill="none" />
            <circle cx="80" cy="75" r="3" fill="#2D3748" />
            <path d="M35 50C35 48 37 45 40 45C43 45 45 48 45 50" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 50C55 48 57 45 60 45C63 45 65 48 65 50" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="55" r="4" fill="#2D3748" />
            <circle cx="60" cy="55" r="4" fill="#2D3748" />
            <circle cx="41.5" cy="53.5" r="1.5" fill="white" />
            <circle cx="61.5" cy="53.5" r="1.5" fill="white" />
            <ellipse cx="50" cy="68" rx="14" ry="10" fill="#FFF5F5" />
            <path d="M46 64Q50 60 54 64" fill="#2D3748" />
            <path d="M50 68V72M46 72Q50 75 54 72" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
            <path d="M35 80L50 90L65 80" fill="#EBF8FF" stroke="#3182CE" strokeWidth="2" />
            <path d="M50 90L50 100" stroke="#3182CE" strokeWidth="2" />
        </g>
    </svg>
);

// Иконка Успеха (для второго экрана)
const SuccessCheckIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#F0FFF4" />
        <path d="M30 50L45 65L70 35" stroke="#38A169" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Иконка "Ракета" или "Молния" для маркетингового блока
const RocketIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="M12 15l-3-3a22 22 0 0 1 2-12 9.5 9.5 0 0 1 10 10 22 22 0 0 1-12 2z"></path>
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-9c-2.48 0-5.78 1.63-8 5"></path>
        <line x1="12" y1="12" x2="9" y2="15"></line>
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (phone: string) => void; // Вызывает открытие регистрации
    city?: string;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, onSuccess, city }) => {
    const { t, i18n } = useTranslation();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Новое состояние: отправлена ли форма
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root') || document.body;
    const defaultCountry = i18n.language === 'ru' ? 'ru' : 'us';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) return;

        setLoading(true);
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        try {
            const utmPayload: any = {};
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

            utmKeys.forEach(key => {
                const val = Cookies.get(key);
                if (val) utmPayload[key] = val;
            });

            const refCode = Cookies.get(appConfig.referralParamName);
            if (refCode) utmPayload.ref_code = refCode;

            await createLead({
                phone: formattedPhone,
                source: 'search_exit_intent',
                city: city,
                ...utmPayload
            });

            // ВМЕСТО ВЫЗОВА onSuccess МЫ ПЕРЕКЛЮЧАЕМ СОСТОЯНИЕ ВНУТРИ МОДАЛКИ
            setIsSubmitted(true);

        } catch (error) {
            console.error("Lead submission failed:", error);
            // Даже при ошибке переключаем, чтобы не фрустрировать юзера
            setIsSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        // Вызываем коллбек родителя, который закроет эту модалку и откроет AuthModal
        onSuccess(formattedPhone);
    };

    return ReactDOM.createPortal(
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <button className={style.closeBtn} onClick={onClose} aria-label="Закрыть">
                    <CloseIcon />
                </button>

                <div className={style.headerDecoration}></div>

                {/* --- КОНТЕНТ ЗАВИСИТ ОТ СОСТОЯНИЯ --- */}
                {!isSubmitted ? (
                    // --- ШАГ 1: ВВОД ТЕЛЕФОНА ---
                    <div className={style.content}>
                        <div className={style.iconWrapper}>
                            <SupportDogIcon />
                        </div>

                        <h2 className={style.title}>Сложно выбрать{city ? ` в г. ${city}` : ''}?</h2>
                        <p className={style.subtitle}>
                            Оставьте номер — мы бесплатно подберем <strong>проверенного ситтера</strong> под ваши даты за 15 минут.
                        </p>

                        <form onSubmit={handleSubmit} className={style.form}>
                            <div className={style.inputWrapper}>
                                <PhoneInput
                                    country={defaultCountry}
                                    value={phone}
                                    onChange={(phone) => setPhone(phone)}
                                    containerClass={style.phoneContainer}
                                    inputClass={style.phoneInput}
                                    buttonClass={style.phoneButton}
                                    dropdownClass={style.phoneDropdown}
                                    enableSearch={true}
                                    disableSearchIcon={true}
                                    preferredCountries={['ru', 'kz', 'by', 'us']}
                                    placeholder="+7 (999) 000-00-00"
                                    autoFormat={true}
                                />
                            </div>

                            <button type="submit" className={style.submitBtn} disabled={loading}>
                                {loading ? 'Отправка...' : 'Подобрать ситтера'}
                            </button>
                        </form>

                        <div className={style.legalText}>
                            Нажимая кнопку, вы соглашаетесь с{' '}
                            <a href="/terms" target="_blank" rel="noopener noreferrer">Условиями</a> и{' '}
                            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Политикой конфиденциальности</a>.
                        </div>
                    </div>
                ) : (
                    // --- ШАГ 2: УСПЕХ + UPSELL ---
                    <div className={`${style.content} ${style.successContent}`}>
                        <div className={style.successIconWrapper}>
                            <SuccessCheckIcon />
                        </div>

                        <h2 className={style.title}>Заявка принята!</h2>
                        <p className={style.subtitle}>
                            Наш оператор уже получил ваш запрос и скоро свяжется с вами.
                        </p>

                        {/* Маркетинговый блок */}
                        <div className={style.marketingBox}>
                            <div className={style.marketingHeader}>
                                <div className={style.rocketIcon}><RocketIcon /></div>
                                <span>Хотите найти ситтера быстрее?</span>
                            </div>
                            <p className={style.marketingText}>
                                Зарегистрированные пользователи получают <strong>в 3 раза больше откликов</strong>. Создайте заказ самостоятельно — это займет 1 минуту!
                            </p>
                        </div>

                        <button
                            type="button"
                            className={`${style.submitBtn} ${style.primaryActionBtn}`}
                            onClick={handleRegisterClick}
                        >
                            Создать заказ (Бесплатно)
                        </button>

                        <button
                            type="button"
                            className={style.secondaryBtn}
                            onClick={onClose}
                        >
                            Спасибо, я подожду звонка
                        </button>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default LeadCaptureModal;