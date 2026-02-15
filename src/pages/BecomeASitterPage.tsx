// --- File: src/pages/BecomeASitterPage.tsx ---
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import BecomeSitterHero from '../components/becomeASitter/BecomeASitterHero';
import WhyBecomeSitterSection from '../components/becomeASitter/WhyBecomeSitterSection';
import HowItWorksSitterSteps from '../components/becomeASitter/HowItWorksSitterSteps';
import FinalSitterCTA from '../components/becomeASitter/FinalSitterCTA';
import OfferableServicesSection from '../components/becomeASitter/OfferableServicesSection';
import SitterAppPreviewSection from '../components/becomeASitter/SitterAppPreviewSection';

interface BecomeASitterPageProps {
    isPreloading?: boolean;
}

interface PageContextType {
    // Обновляем сигнатуру
    onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter', returnUrl?: string) => void;
}

const BecomeASitterPage: React.FC<BecomeASitterPageProps> = ({ isPreloading = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { onAuthClick } = useOutletContext<PageContextType>();

    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/cabinet/become-sitter');
        } else {
            // --- ИЗМЕНЕНИЕ: Передаем путь возврата ---
            if (onAuthClick) {
                onAuthClick('register', 'sitter', '/cabinet/become-sitter');
            }
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Pet Sitting Job",
        "provider": { "@type": "Organization", "name": "PetsOk" },
        "description": t('seo.becomeASitter.description'),
        "name": t('seo.becomeASitter.title')
    };

    return (
        <>
            <Helmet>
                <title>{t('seo.becomeASitter.title')}</title>
                <meta name="description" content={t('seo.becomeASitter.description')} />
                <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
            </Helmet>

            <BecomeSitterHero isPreloading={isPreloading} onGetStartedClick={handleGetStarted} />
            <WhyBecomeSitterSection />
            <HowItWorksSitterSteps />
            <SitterAppPreviewSection />
            <OfferableServicesSection />
            <FinalSitterCTA onGetStartedClick={handleGetStarted} />

            <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '14px', backgroundColor: '#F8F9FB' }}>
                {t('becomeSitter.trustFooter')}
            </div>
        </>
    );
};

export default BecomeASitterPage;