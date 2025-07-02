// --- File: Language.tsx ---
import React from "react";
import ReactDOM from "react-dom"; // <--- ИМПОРТ ДЛЯ ПОРТАЛА
import "../../style/components/modal/Language.scss";
import { useTranslation } from "react-i18next";
import { supportedLngs } from "../../i18n";

interface LanguageProp {
  open: boolean;
  closeLangModal: () => void;
}

// Получаем корневой элемент для модальных окон
const modalRoot = document.getElementById('modal-root');

const Language: React.FC<LanguageProp> = ({ open, closeLangModal }) => {
  const { i18n, t } = useTranslation();

  // ... (остальная логика changeLanguage, currentLangCode, recommendedLanguages, otherLanguages) ...
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    closeLangModal();
  };

  const currentLangCode = i18n.language;
  const recommendedCodes = ['ru', 'en', 'kk'];
  const recommendedLanguages = supportedLngs.filter(lang =>
    lang && typeof lang.code === 'string' && recommendedCodes.includes(lang.code)
  );
  const otherLanguages = supportedLngs.filter(lang =>
    lang && typeof lang.code === 'string' && !recommendedCodes.includes(lang.code)
  );


  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Если модальное окно не открыто ИЛИ нет корневого элемента для портала, не рендерим
  if (!open || !modalRoot) {
    return null;
  }

  // Рендерим модальное окно с помощью портала
  return ReactDOM.createPortal(
    <div className={`language ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="language-modal-title">
      <div className="language__overlay" onClick={closeLangModal} tabIndex={-1}></div>
      <div className="language__wrapper">
        <div className="language__head">
          <h3 id="language-modal-title">{t("languageModal.selectLanguage", "Выберите язык")}</h3>
          <button
            onClick={closeLangModal}
            aria-label={t('languageModal.close', 'Закрыть')}
            className="language__close-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="language__body">
          {recommendedLanguages.length > 0 && (
            <div className="language__section">
              <h2>{t("recomLang")}</h2>
              <ul className="language__list">
                {recommendedLanguages.map((lang) => (
                  <li
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={currentLangCode.startsWith(lang.code) ? "active" : ""}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') changeLanguage(lang.code); }}
                    aria-pressed={currentLangCode.startsWith(lang.code)}
                  >
                    <span>{lang.name}</span>
                    {lang.region && <small>{lang.region}</small>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otherLanguages.length > 0 && (
            <div className="language__section">
              <h2>{t("languageModal.allLanguages", "Все языки и регионы")}</h2>
              <ul className="language__list">
                {otherLanguages.map((lang) => (
                  <li
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={currentLangCode.startsWith(lang.code) ? "active" : ""}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') changeLanguage(lang.code); }}
                    aria-pressed={currentLangCode.startsWith(lang.code)}
                  >
                    <span>{lang.name}</span>
                    {lang.region && <small>{lang.region}</small>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(supportedLngs) && supportedLngs.length === 0 && (
            <p>{t("languageModal.noLanguages", "Список языков пуст.")}</p>
          )}
        </div>
      </div>
    </div>,
    modalRoot // <--- Указываем, куда рендерить портал
  );
};

export default Language;