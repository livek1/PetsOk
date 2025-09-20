// src/components/SearchSitter.tsx

import { useState } from "react"; // <-- ИСПРАВЛЕНИЕ: Удален неиспользуемый импорт React
import { useTranslation } from "react-i18next";
import { enabledServicesForSearch, comingSoonServices } from "../config/appConfig";
import SearchSitterItem from "./search/SearchSitterItem";
import style from '../style/components/SearchSitter.module.scss';
import { motion } from 'framer-motion';

const SearchSitter = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const tabs = enabledServicesForSearch.map(service => ({
    id: service.id,
    name: t(service.nameKey),
    description: t(service.descriptionKey, ''),
    itemTitle: t(service.itemTitleKey),
    Icon: service.IconComponent,
  }));

  const hasComingSoonServices = comingSoonServices.length > 0;

  const comingSoonNames = comingSoonServices.map(s => t(s.nameKey)).join(', ');

  if (tabs.length === 0 && !hasComingSoonServices) {
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
              <div className={style.tabContent}>
                <tab.Icon className={style.tabIcon} width={22} height={22} color="currentColor" />
                <div className={style.tabText}>
                  <h3 className={style.tabName}>{tab.name}</h3>
                  <span className={style.tabDescription}>{tab.description}</span>
                </div>
              </div>
            </li>
          ))}

          {hasComingSoonServices && (
            <li className={style.moreServicesTab}>
              <span className={style.moreServicesHeader}>
                {t("searchSitter.addingSoon", "Скоро добавим эти услуги:")}
              </span>
              <span className={style.comingSoonList}>
                {comingSoonNames}
              </span>
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
                  key={tab.id}
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