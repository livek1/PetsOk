// --- File: src/pages/Home.tsx ---
import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";
import { useOutletContext, useNavigate } from 'react-router-dom';
import Hero from "../components/home/Hero";
import HowItWorksSimple from "../components/home/HowItWorksSimple";
import MobileAppPromoSection from "../components/home/MobileAppSection";
import WhyPetsOkFeatures from "../components/home/WhyPetsOkFeatures";
import TestimonialsSection from "../components/home/TestimonialsSection";
import { config } from '../config/appConfig';

interface PageContextType {
  onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter', returnUrl?: string) => void;
}

const Home = ({ isPreloading }: { isPreloading: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onAuthClick } = useOutletContext<PageContextType>();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PetsOk",
    "url": config.siteUrl,
    "logo": `${config.siteUrl}/logo512.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-XXX-XXX-XX-XX",
      "contactType": "Customer Service"
    }
  };

  const heroBackgroundImageUrl = '/hero-bg.webp';

  const handleCreateOrderClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/cabinet/orders/create');
    } else {
      // --- ИЗМЕНЕНИЕ: Передаем returnUrl ---
      onAuthClick('register', 'client', '/cabinet/orders/create');
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <link rel="preload" as="image" href={heroBackgroundImageUrl} fetchPriority="high" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <Hero
        isPreloading={isPreloading}
        backgroundImage={heroBackgroundImageUrl}
        onCreateOrderClick={handleCreateOrderClick}
      />

      <WhyPetsOkFeatures onCreateOrderClick={handleCreateOrderClick} />
      <TestimonialsSection />

      <HowItWorksSimple />


      <MobileAppPromoSection />
    </>
  );
};

export default Home;