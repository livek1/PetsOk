// --- File: src/components/search/SearchSitterItem.tsx ---
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchAddressSuggestions } from "../../services/api";
import style from '../../style/components/search/SearchSitterItem.module.scss';
import LocationPinIcon from '../icons/LocationPinIcon';
import SearchIcon from '../icons/SearchIcon';

// Иконка навигации (стрелка)
const NavigationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
);

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

// Список популярных городов для быстрого старта
const POPULAR_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Краснодар",
  "Новосибирск",
  "Екатеринбург",
  "Казань"
];

interface SearchSitterItemProp {
  serviceType: string;
}

const SearchSitterItem: React.FC<SearchSitterItemProp> = ({ serviceType }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  // --- ЛОГИКА ДИНАМИЧЕСКОГО ПЛЕЙСХОЛДЕРА ---
  const getPlaceholder = (service: string) => {
    switch (service) {
      case 'boarding': return t('search.placeholders.boarding', 'В каком районе искать ситтера?');
      case 'walking': return t('search.placeholders.walking', 'В каком районе нужен выгул?');
      case 'doggy_day_care': return t('search.placeholders.doggy_day_care', 'Где нужна дневная няня?');
      case 'drop_in_visit': return t('search.placeholders.drop_in_visit', 'Куда должен приехать ситтер?');
      case 'house_sitting': return t('search.placeholders.house_sitting', 'Где требуется присмотр?');
      default: return t('search.location_placeholder', 'Поиск по району или адресу');
    }
  };

  const debouncedFetch = useMemo(() => debounce(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await fetchAddressSuggestions(query);
      setSuggestions(results);
    } catch (e) { setSuggestions([]); }
  }, 400), []);

  // --- ГЛАВНАЯ ЛОГИКА ПОИСКА ---
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Если поле пустое — не переходим, а фокусируем и показываем подсказки
    if (!locationInput.trim()) {
      setIsActive(true);
      inputRef.current?.focus();
      return;
    }

    // 2. Если заполнено — переходим
    const params = new URLSearchParams();
    params.append('address', locationInput);
    params.append('service_key', serviceType);
    navigate(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (s: string) => {
    setLocationInput(s);
    setSuggestions([]);
    setIsActive(false);
    // Сразу переходим при клике на подсказку
    navigate(`/search?address=${s}&service_key=${serviceType}`);
  };

  const handleContainerClick = () => {
    setIsActive(true);
    inputRef.current?.focus();
  };

  // --- ОПРЕДЕЛЕНИЕ ГЕОПОЗИЦИИ ---
  const handleGeoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.geolocation) return alert("Геолокация не поддерживается вашим браузером");

    setIsLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Переходим на поиск по координатам
        navigate(`/search?lat=${latitude}&lon=${longitude}&service_key=${serviceType}`);
        setIsLoadingGeo(false);
      },
      (error) => {
        console.error(error);
        setIsLoadingGeo(false);
        // Если ошибка, просто фокусируем поле, чтобы ввел вручную
        inputRef.current?.focus();
      }
    );
  };

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsActive(false);
        // Не очищаем suggestions, чтобы они появились снова при фокусе
      }
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  // Определяем, что показывать в выпадающем списке
  const showSuggestionsList = isActive;
  const listContent = suggestions.length > 0 ? suggestions : POPULAR_CITIES;
  const isShowingPopular = suggestions.length === 0 && !locationInput;

  return (
    <div className={style.searchContainer} ref={wrapperRef}>
      <form
        className={`${style.searchBar} ${isActive ? style.activeBar : ''}`}
        onSubmit={handleSearch}
        onClick={handleContainerClick}
      >
        <div className={style.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholder(serviceType)}
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              debouncedFetch(e.target.value);
            }}
            onFocus={() => setIsActive(true)}
            className={style.inputTransparent}
            autoComplete="off"
          />
        </div>

        <div className={style.searchBtnWrapper}>
          <button type="submit" className={style.searchBtn} onClick={(e) => {
            // Если пусто, стопаем всплытие, чтобы сработал handleSearch с валидацией
            if (!locationInput) e.stopPropagation();
          }}>
            <SearchIcon width={24} height={24} />
            <span className={style.searchBtnText}>{t('SearchSitterItem.searchButtonText', 'Найти')}</span>
          </button>
        </div>

        {/* --- ВЫПАДАЮЩИЙ СПИСОК --- */}
        {showSuggestionsList && (
          <div className={style.dropdownMenu}>

            {/* 1. Кнопка "Рядом со мной" (Только если нет ввода) */}
            {!locationInput && (
              <div className={style.dropdownItem} onClick={handleGeoClick}>
                <div className={style.iconCircle} style={{ color: '#3598FE', backgroundColor: '#EBF8FF' }}>
                  <NavigationIcon />
                </div>
                <div className={style.itemText}>
                  <span className={style.mainText}>
                    {isLoadingGeo ? 'Определяем...' : 'Искать рядом со мной'}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Заголовок для популярных городов */}
            {isShowingPopular && !isLoadingGeo && (
              <div style={{ padding: '8px 28px 4px', fontSize: '12px', color: '#A0AEC0', fontWeight: 600 }}>
                ПОПУЛЯРНЫЕ ГОРОДА
              </div>
            )}

            {/* 3. Список (Результаты поиска ИЛИ Популярные) */}
            {listContent.map((s, i) => (
              <div key={i} className={style.dropdownItem} onClick={(e) => { e.stopPropagation(); handleSuggestionClick(s); }}>
                <div className={style.iconCircle}>
                  <LocationPinIcon width={20} />
                </div>
                <div className={style.itemText}>
                  <span className={style.mainText}>{s}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchSitterItem;