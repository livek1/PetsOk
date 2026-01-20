// --- File: src/components/SearchSitter.tsx ---
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { enabledServicesForSearch } from "../config/appConfig"; // Убрали comingSoonServices из импорта
import SearchSitterItem from "./search/SearchSitterItem";
import style from '../style/components/SearchSitter.module.scss';

const SearchSitter = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  // Получаем список активных сервисов из Redux
  const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

  // Фильтруем статический конфиг на основе данных с сервера
  const tabs = enabledServicesForSearch
    .filter(service => {
      // Если конфиг еще не загружен, показываем все или базовые.
      if (!isConfigLoaded) return true;
      return activeServices.includes(service.id);
    })
    .map(service => ({
      id: service.id,
      name: t(service.nameKey),
      description: t(service.descriptionKey, ''),
      itemTitle: t(service.itemTitleKey),
      Icon: service.IconComponent,
    }));

  // --- УДАЛЕНО: Логика формирования списка "Скоро" ---

  if (tabs.length === 0) return null; // Убрали проверку на hasComingSoonServices

  // Безопасно получаем activeServiceId
  const activeServiceId = tabs[activeIndex]?.id || (tabs.length > 0 ? tabs[0].id : 'boarding');

  return (
    <div className={style.searchSitterWrapper}>
      <div className={style.searchSitter}>
        {/* --- Верхние табы (выбор услуги) --- */}
        <ul className={style.tabs}>
          {tabs.map((tab, i) => (
            <li
              key={tab.id}
              className={`${style.tabItem} ${tabs[activeIndex]?.id === tab.id ? style.active : ""}`}
              onClick={() => setActiveIndex(i)}
              role="tab"
              aria-selected={tabs[activeIndex]?.id === tab.id}
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

          {/* --- УДАЛЕНО: Блок рендеринга <li> с текстом "Скоро:" --- */}
        </ul>

        {/* --- Тело формы --- */}
        <div className={style.body}>
          <SearchSitterItem serviceType={activeServiceId} />
        </div>
      </div>
    </div>
  );
};

export default SearchSitter;