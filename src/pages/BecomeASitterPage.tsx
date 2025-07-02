// --- File: pages/BecomeASitterPage.tsx ---
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import BecomeSitterHero from '../components/becomeASitter/BecomeASitterHero';
import WhyBecomeSitterSection from '../components/becomeASitter/WhyBecomeSitterSection';
import HowItWorksSitterSteps from '../components/becomeASitter/HowItWorksSitterSteps';
import OfferableServicesSection from '../components/becomeASitter/OfferableServicesSection';
import SupportAndSafetySection from '../components/becomeASitter/SupportAndSafetySection';
import FinalSitterCTA from '../components/becomeASitter/FinalSitterCTA';

import { config } from '../config/appConfig';

interface BecomeASitterPageProps {
    isPreloading?: boolean;
}

// Контекст, который мы получаем от PageLayout
interface PageContextType {
    onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

const BecomeASitterPage: React.FC<BecomeASitterPageProps> = ({ isPreloading = false }) => {
    const { t } = useTranslation();

    // Получаем функцию из контекста родительского роута
    const { onAuthClick } = useOutletContext<PageContextType>();

    // Обработчик для всех кнопок "Начать" на этой странице
    const handleGetStarted = () => {
        // Вызываем функцию с типом 'sitter'
        if (onAuthClick) {
            onAuthClick('register', 'sitter');
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Работа для ситтеров",
        "provider": { "@type": "Organization", "name": "PetsOk" },
        "description": t('seo.becomeASitter.description'),
        "name": t('seo.becomeASitter.title')
    };

    return (
        <>
            <Helmet>
                <title>{t('seo.becomeASitter.title')}</title>
                <meta name="description" content={t('seo.becomeASitter.description')} />
                <meta property="og:title" content={t('seo.becomeASitter.title')} />
                <meta property="og:description" content={t('seo.becomeASitter.description')} />
                <meta property="og:url" content={`${config.siteUrl}/become-a-sitter`} />
                <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
            </Helmet>

            <BecomeSitterHero isPreloading={isPreloading} onGetStartedClick={handleGetStarted} />
            <WhyBecomeSitterSection />
            <HowItWorksSitterSteps />
            <OfferableServicesSection />
            <SupportAndSafetySection />
            <FinalSitterCTA onGetStartedClick={handleGetStarted} />
        </>
    );
};

export default BecomeASitterPage;