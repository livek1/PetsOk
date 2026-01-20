// --- File: src/pages/Home.tsx ---
import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";
import { useOutletContext, useNavigate } from 'react-router-dom'; // Импортируем хуки
import Hero from "../components/home/Hero";
import HowItWorksSimple from "../components/home/HowItWorksSimple";
import MobileAppPromoSection from "../components/home/MobileAppSection";
import WhyPetsOkFeatures from "../components/home/WhyPetsOkFeatures";
import { config } from '../config/appConfig';

// Добавляем интерфейс для контекста, чтобы получить функцию открытия модалки
interface PageContextType {
  onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

const Home = ({ isPreloading }: { isPreloading: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Получаем функцию открытия модалки из контекста (Layout)
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

  // Определяем постоянный путь к фоновому изображению в папке /public
  const heroBackgroundImageUrl = '/hero-bg.webp';

  // Функция для обработки клика "Создать заказ"
  const handleCreateOrderClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Если авторизован, идем создавать заказ
      navigate('/cabinet/orders/create');
    } else {
      // Если не авторизован - открываем регистрацию (тип 'client' по умолчанию)
      onAuthClick('register', 'client');
    }
  };

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

      {/* Передаем isPreloading, URL изображения и обработчик клика в компонент Hero */}
      <Hero
        isPreloading={isPreloading}
        backgroundImage={heroBackgroundImageUrl}
        onCreateOrderClick={handleCreateOrderClick}
      />

      <WhyPetsOkFeatures />
      <HowItWorksSimple />
      <MobileAppPromoSection />
    </>
  );
};

export default Home;