import React from "react";
import "../../style/components/modal/Language.scss";
import { useTranslation } from "react-i18next";

interface LanguageProp {
  open: boolean;
  closeLangModal: () => void;
}

const Language: React.FC<LanguageProp> = ({ open, closeLangModal }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    closeLangModal();
  };

  return (
    <div className={`language ${open ? "hide" : ""}`}>
      <div className="language__wrapper">
        <div className="language__head">
          <button onClick={() => closeLangModal()}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.75696 16.243L16.243 7.757M16.243 16.243L7.75696 7.757"
                stroke="black"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="language__body">
          <div>
            <h2>Рекомендуемые языки и регионы</h2>
            <ul>
              <li onClick={() => changeLanguage("ru")}>
                <span>Русский</span>
                <small>United States</small>
              </li>
              <li onClick={() => changeLanguage("en")}>
                <span>English</span>
                <small>United States</small>
              </li>
              <li onClick={() => changeLanguage("kk")}>
                <span>Қазақша</span>
                <small>United States</small>
              </li>
            </ul>
          </div>
          <div>
            <h2>Выбрать язык и регион</h2>
            <ul>
              <li className="active">
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
              <li>
                <span>English</span>
                <small>United States</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Language;
