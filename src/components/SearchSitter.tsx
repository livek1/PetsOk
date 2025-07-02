import { useState } from "react";
import { useTranslation } from "react-i18next";
import { enabledServicesForSearch } from "../config/appConfig";
import SearchSitterItem from "./search/SearchSitterItem";
import style from '../style/components/SearchSitter.module.scss';
import { motion } from 'framer-motion';

const SearchSitter = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const tabs = enabledServicesForSearch.map(service => ({
    id: service.id,
    name: t(service.nameKey),
    description: t(service.descriptionKey),
    itemTitle: t(service.itemTitleKey),
  }));

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={style.searchSitterWrapper}>
      <div className={style.searchSitter}>
        <ul className={style.tabs}>
          {tabs.map((tab, i) => (
            <li
              key={tab.id}
              className={`${style.tabItem} ${activeIndex === i ? style.active : ""}`}
              onClick={() => setActiveIndex(i)}
              role="tab"
              aria-selected={activeIndex === i}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveIndex(i); }}
            >
              <h3 className={style.tabName}>{tab.name}</h3>
              <span className={style.tabDescription}>{tab.description}</span>
            </li>
          ))}

          {/* --- НОВАЯ ЛОГИКА ЗДЕСЬ --- */}
          {/* Показываем подсказку, если всего одна услуга */}
          {tabs.length === 1 && (
            <li className={style.moreServicesHint}>
              <span>{t("searchSitter.moreServicesSoon", "Скоро добавим новые услуги!")}</span>
            </li>
          )}
        </ul>

        <div className={style.body}>
          {tabs.map((tab, i) => (
            <div
              key={`tabpanel-content-${tab.id}`}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={tab.name}
              className={`${style.contentPanel} ${activeIndex === i ? style.active : ""}`}
            >
              {activeIndex === i && (
                <motion.div
                  key={tab.id} // Важно для переключения анимации
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SearchSitterItem
                    key={tab.id + "-item"}
                    title={tab.itemTitle}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSitter;