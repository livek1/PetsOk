// --- File: src/pages/Home.tsx ---

import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";
import Hero from "../components/home/Hero";
import HowItWorksSimple from "../components/home/HowItWorksSimple";
import MobileAppPromoSection from "../components/home/MobileAppSection";
import WhyPetsOkFeatures from "../components/home/WhyPetsOkFeatures";
import { config } from '../config/appConfig';

// Удаляем импорт изображения из assets, так как теперь оно будет в папке /public
// import heroBgOptimized from '../assets/hero-bg.webp';

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

  // Определяем постоянный путь к фоновому изображению в папке /public
  const heroBackgroundImageUrl = '/hero-bg.webp';

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />

        {/* Предзагрузка фонового изображения по статичному пути. */}
        <link rel="preload" as="image" href={heroBackgroundImageUrl} fetchPriority="high" />

        {/* Предзагрузка самого важного шрифта (Bold для заголовков). Путь статичный, т.к. файл в /public. */}
        <link rel="preload" href="/fonts/raleway-v37-cyrillic_latin-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* Микроразметка для SEO */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      {/* Передаем isPreloading и прямой URL изображения в компонент Hero */}
      <Hero isPreloading={isPreloading} backgroundImage={heroBackgroundImageUrl} />

      <WhyPetsOkFeatures />
      <HowItWorksSimple />
      <MobileAppPromoSection />
    </>
  );
};

export default Home;