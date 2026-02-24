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
          </div>


        </div>

      </div>
    </footer>
  );
};

export default Footer;