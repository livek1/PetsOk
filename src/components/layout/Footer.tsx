import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import style from "../../style/layouts/Footer.module.scss";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  // --- НОВАЯ СТРУКТУРА ---
  return (
    <footer className={style.footerContainer}>
      <div className={style.footerWrapper}>

        {/* --- ЛЕВАЯ КОЛОНКА: ЛОГО И КОПИРАЙТ --- */}
        <div className={style.leftColumn}>
          <Link to="/" className={style.logo}>PetsOk</Link>
          <p className={style.copyrightText}>
            © {new Date().getFullYear()} PetsOk. {t('footer.copyright', 'Все права защищены.')}
          </p>
        </div>

        {/* --- ПРАВАЯ КОЛОНКА: ССЫЛКИ И СОЦСЕТИ --- */}
        <div className={style.rightColumn}>
          <nav className={style.navSection}>
            <ul>
              <li><Link to="/terms">{t('footer.legal.terms', 'Условия использования')}</Link></li>
              <li><Link to="/privacy-policy">{t('footer.legal.privacy', 'Политика конфиденциальности')}</Link></li>
              <li><Link to="/cookie-policy">{t('footer.legal.cookies', 'Политика Cookie')}</Link></li>
            </ul>
          </nav>


        </div>
      </div>
    </footer>
  );
};

export default Footer;