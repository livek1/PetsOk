// --- File: src/app/page.tsx ---
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setAuthRedirectPath } from '../store/slices/authSlice';

import Hero from "../components/home/Hero";
import HowItWorksSimple from "../components/home/HowItWorksSimple";
import MobileAppPromoSection from "../components/home/MobileAppSection";
import WhyPetsOkFeatures from "../components/home/WhyPetsOkFeatures";
import TestimonialsSection from "../components/home/TestimonialsSection";
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AnimatedCounter from '../components/common/AnimatedCounter';

import {
  ComparisonSection,
  ExpertsSection,
  ChatPreviewSection,
  MobileStickyCTA
} from '../components/home/LandingAddons';

import dynamic from 'next/dynamic';

// Ленивая загрузка модалки. Код скачается только когда isOpen станет true.
const AuthModal = dynamic(
  () => import('../components/modals/AuthModal').then(mod => mod.AuthModal),
  { ssr: false } // Модалки никогда не нужны для SEO-индексации
);

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const handleCreateOrderClick = () => {
    if (isAuthenticated) {
      router.push('/cabinet/orders/create');
    } else {
      // Сохраняем путь для редиректа после успешной регистрации/входа
      dispatch(setAuthRedirectPath('/cabinet/orders/create'));
      setAuthMode('register');
      setAuthModalOpen(true);
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    // Очищаем редирект, чтобы сработал дефолтный переход в кабинет
    dispatch(setAuthRedirectPath(null));
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleMobileStickyClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ДОБАВЛЕНО: Базовая микроразметка компании для Google/Yandex
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PetsOk",
    "url": "https://petsok.ru",
    "logo": "https://petsok.ru/apple-touch-icon.png",
    "description": "Надежный сервис передержки и выгула собак",
    "sameAs": [
      "https://t.me/petsokru" // Добавьте сюда ссылки на ваши соцсети
    ]
  };

  // ДОБАВЛЕНО: Микроразметка сайта (позволяет Google выводить строку поиска по вашему сайту прямо в выдаче)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PetsOk",
    "url": "https://petsok.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://petsok.ru/search?address={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* Невидимые скрипты для поисковых ботов */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      <Header onAuthClick={handleAuthClick} />

      {/* 1. Эмоциональный старт + социальное доказательство */}
      <Hero
        isPreloading={false}
        backgroundImage="/hero-bg.webp"
        onCreateOrderClick={handleCreateOrderClick}
      />

      {/* Статистика, сфокусированная на качестве и безопасности */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">
              <AnimatedCounter isPreloading={false} to={100} />%
            </div>
            <span>Ситтеров с проверенными документами</span>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              <AnimatedCounter isPreloading={false} to={100} />%
            </div>
            <span>Сделок защищены договором</span>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              <AnimatedCounter isPreloading={false} to={14} />
            </div>
            <span>Городов в РФ и СНГ</span>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              <AnimatedCounter isPreloading={false} to={24} />/7
            </div>
            <span>Служба заботы на связи</span>
          </div>
        </div>
      </section>

      {/* 2. Бьем в боль: сравнение с клетками зоогостиниц */}
      <ComparisonSection />

      {/* 3. Демонстрация главной фичи: Чат и ежедневные отчеты */}
      <ChatPreviewSection />

      {/* 4. Экспертность: Кинологи и ветеринары в команде */}
      <ExpertsSection />

      {/* 5. Безопасность и гарантии платформы */}
      <WhyPetsOkFeatures onCreateOrderClick={handleCreateOrderClick} />

      {/* 6. Отзывы реальных пользователей */}
      <TestimonialsSection />

      {/* 7. Как это работает (3 простых шага) */}
      <HowItWorksSimple />

      {/* 8. Загрузка мобильного приложения */}
      <MobileAppPromoSection />

      {/* SEO-текст (Передержка, выгул, няня) */}
      <section className="seo-section">
        <div className="seo-container">
          <h2>Надежный уход за питомцами в России и Казахстане</h2>
          <p>
            Сервис <strong>PetsOk</strong> позволяет быстро найти проверенного специалиста для вашего любимца. Мы предоставляем полный спектр услуг: домашняя передержка, активный выгул собак, дневная няня и визиты на дом (чтобы покормить котика или убрать лоток).
          </p>
          <p>
            Мы убеждены, что домашняя передержка переносится животными с минимальным стрессом. Никаких вольеров и лая соседних собак — только уютная квартира, любимый диван и 100% внимания ситтера.
            Каждый заказ защищен электронным договором, а в случае непредвиденных ситуаций мы предоставляем <strong>бесплатную онлайн-консультацию ветеринара</strong>. Путешествуйте спокойно, зная, что ваш питомец в надежных руках!
          </p>
        </div>
      </section>

      <Footer />

      <MobileStickyCTA onClick={handleMobileStickyClick} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}