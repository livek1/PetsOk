// --- File: src/components/layout/Footer.tsx ---
import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import style from "../../style/layouts/Footer.module.scss";

// Иконки соцсетей
const IconTelegram = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.665 3.333L3.333 10.665L7.999 12.665L18.666 5.999L10.666 13.999L10.665 18.665L14.665 14.665L18.665 17.999L20.665 3.333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInstagram = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7616 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.521 8.13212 14.342 8.56708 14.972 9.24075C15.602 9.91442 16.0076 10.7915 16.12 11.68L16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Актуальный список городов
const POPULAR_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Омск",
  "Нижний Новгород",
  "Челябинск",
  "Красноярск",
  "Самара",
  "Уфа"
];

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className={style.footerContainer}>
      <div className={style.footerWrapper}>

        {/* --- 1. ЛЕВАЯ КОЛОНКА (Бренд) --- */}
        <div className={style.leftColumn}>
          <Link to="/" className={style.logo}>PetsOk</Link>
          <p className={style.copyrightText}>
            © {new Date().getFullYear()} PetsOk.<br />
            {t('footer.copyright', 'Все права защищены.')}
          </p>
        </div>

        {/* --- 2. ЦЕНТРАЛЬНАЯ КОЛОНКА (Города) --- */}
        <div className={style.centerColumn}>
          <h4 className={style.columnTitle}>Популярные города</h4>
          <ul className={style.popularCitiesList}>
            {POPULAR_CITIES.map((city) => (
              <li key={city}>
                {/* Ссылка вида /search?address=Москва */}
                <Link to={`/search?address=${city}`}>{city}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- 3. ПРАВАЯ КОЛОНКА (Документы + Соцсети) --- */}
        <div className={style.rightColumn}>
          {/* Меню документов */}
          <nav className={style.legalNav}>
            <ul>
              <li><Link to="/terms">{t('footer.legal.terms', 'Условия использования')}</Link></li>
              <li><Link to="/privacy-policy">{t('footer.legal.privacy', 'Политика конфиденциальности')}</Link></li>
              <li><Link to="/cookie-policy">{t('footer.legal.cookies', 'Политика Cookie')}</Link></li>
            </ul>
          </nav>

          {/* Соцсети */}
          <div className={style.socialsWrapper}>
            <a href="https://t.me/petsokru" target="_blank" rel="noreferrer" aria-label="Telegram">
              <IconTelegram />
            </a>
            <a href="https://instagram.com/petsok.ru" target="_blank" rel="noreferrer" aria-label="Instagram">
              <IconInstagram />
            </a>
          </div>

          {/* Дисклеймер (обязательно для РФ) */}
          <p className={style.disclaimer}>
            * Деятельность Meta Platforms Inc. (Facebook, Instagram) запрещена на территории РФ как экстремистская.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;