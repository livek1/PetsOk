// --- File: src/components/layout/Footer.tsx ---
import React from "react";
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { FRONTEND_CITY_SLUGS, CITY_SLUGS } from "@/config/seoConfig";
import style from "@/style/layouts/Footer.module.scss";

const IconTelegram = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.665 3.333L3.333 10.665L7.999 12.665L18.666 5.999L10.666 13.999L10.665 18.665L14.665 14.665L18.665 17.999L20.665 3.333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconYouTube = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IconTikTok = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className={style.footerContainer}>
      <div className={style.footerWrapper}>

        {/* --- 1. ЛЕВАЯ КОЛОНКА --- */}
        <div className={style.leftColumn}>
          <Link href="/" className={style.logo}>PetsOk</Link>
          <p className={style.copyrightText}>
            © {new Date().getFullYear()} PetsOk.<br />
            {t('footer.copyright', 'Все права защищены.')}
          </p>
        </div>

        {/* --- НОВАЯ КОЛОНКА: УСЛУГИ (ДЛЯ SEO) --- */}
        <div className={style.centerColumn}>
          <h4 className={style.columnTitle}>Наши услуги</h4>
          <ul className={style.popularCitiesList} style={{ gridTemplateColumns: '1fr' }}>
            <li><Link href="/services/pet-boarding">Передержка</Link></li>
            <li><Link href="/services/dog-walking">Выгул собак</Link></li>
            <li><Link href="/services/day-care">Дневная няня</Link></li>
            <li><Link href="/services/home-visits">Визиты на дом</Link></li>
          </ul>
        </div>

        {/* --- 2. ЦЕНТРАЛЬНАЯ КОЛОНКА (Города - SEO Ссылки) --- */}
        <div className={style.centerColumn}>
          <h4 className={style.columnTitle}>Передержка по городам</h4>
          <ul className={style.popularCitiesList}>
            {FRONTEND_CITY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/${slug}/pet-boarding`}>{CITY_SLUGS[slug]}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- 3. ПРАВАЯ КОЛОНКА --- */}
        <div className={style.rightColumn}>
          <nav className={style.legalNav}>
            <ul>
              <li><Link href="/terms">{t('footer.legal.terms', 'Условия использования')}</Link></li>
              <li><Link href="/privacy-policy">{t('footer.legal.privacy', 'Политика конфиденциальности')}</Link></li>
              <li><Link href="/cookie-policy">{t('footer.legal.cookies', 'Политика Куки (Cookie)')}</Link></li>
            </ul>
          </nav>

          <div className={style.socialsWrapper}>
            <a href="https://t.me/petsokru" target="_blank" rel="noreferrer" aria-label="Telegram">
              <IconTelegram />
            </a>
            <a href="https://www.youtube.com/@petsokru" target="_blank" rel="noreferrer" aria-label="YouTube">
              <IconYouTube />
            </a>
            <a href="https://www.tiktok.com/@petsok.app" target="_blank" rel="noreferrer" aria-label="TikTok">
              <IconTikTok />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;