import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";
import Hero from "../components/home/Hero";
import HowItWorksSimple from "../components/home/HowItWorksSimple";
import MobileAppPromoSection from "../components/home/MobileAppSection";
import WhyPetsOkFeatures from "../components/home/WhyPetsOkFeatures";
import { config } from '../config/appConfig';
import heroBgOptimized from '../assets/hero-bg.webp';

// isPreloading больше не нужен в пропах
const Home = ({ isPreloading }: { isPreloading: boolean }) => {
  const { t } = useTranslation();

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

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <link rel="preload" as="image" href={heroBgOptimized} fetchPriority="high" />
        {/* ...другие мета-теги... */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      {/* Передаем isPreloading как false, чтобы анимации сработали */}
      <Hero isPreloading={isPreloading} backgroundImage={heroBgOptimized} />
      <WhyPetsOkFeatures />
      <HowItWorksSimple />
      <MobileAppPromoSection />
    </>
  );
};

export default Home;