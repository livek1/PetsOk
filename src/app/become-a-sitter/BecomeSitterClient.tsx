// --- File: src/app/become-a-sitter/BecomeSitterClient.tsx ---
'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setAuthRedirectPath } from '../../store/slices/authSlice';
import dynamic from 'next/dynamic';

// Компоненты Layout
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Секции лендинга
import BecomeSitterHero from '../../components/becomeASitter/BecomeASitterHero';
import WhyBecomeSitterSection from '../../components/becomeASitter/WhyBecomeSitterSection';
import HowItWorksSitterSteps from '../../components/becomeASitter/HowItWorksSitterSteps';
import FinalSitterCTA from '../../components/becomeASitter/FinalSitterCTA';
import OfferableServicesSection from '../../components/becomeASitter/OfferableServicesSection';
import SitterAppPreviewSection from '../../components/becomeASitter/SitterAppPreviewSection';

// Ленивая загрузка модалки
const AuthModal = dynamic(
    () => import('../../components/modals/AuthModal').then(mod => mod.AuthModal),
    { ssr: false }
);

export default function BecomeSitterClient() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Получаем статус авторизации из Redux
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Стейты для управления модалкой
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

    // Обработчик клика по кнопкам "Войти / Регистрация" в Хедере
    const handleAuthClick = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    // Главный экшен страницы — "Стать ситтером"
    const handleGetStarted = () => {
        if (isAuthenticated) {
            router.push('/cabinet/become-sitter');
        } else {
            // Запоминаем куда вернуть пользователя после успешной авторизации
            dispatch(setAuthRedirectPath('/cabinet/become-sitter'));
            setAuthMode('register');
            setAuthModalOpen(true);
        }
    };

    return (
        // ИСПРАВЛЕНО: Фон заменен с серого #FAFAFC на белый #FFFFFF
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header onAuthClick={handleAuthClick} />

            <main style={{ flexGrow: 1 }}>
                <BecomeSitterHero isPreloading={false} onGetStartedClick={handleGetStarted} />
                <WhyBecomeSitterSection />
                <HowItWorksSitterSteps />
                <SitterAppPreviewSection />
                <OfferableServicesSection />
                <FinalSitterCTA onGetStartedClick={handleGetStarted} />

                {/* Футер доверия (тоже сделан на белом фоне) */}
                <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '14px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                    {t('becomeSitter.trustFooter', 'Ваши данные в безопасности. Мы не передаем личную информацию третьим лицам.')}
                </div>
            </main>

            <Footer />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
                registrationType="sitter" // Явно передаем, что это регистрация ситтера
            />
        </div>
    );
}