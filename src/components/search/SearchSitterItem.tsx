// --- File: src/components/search/SearchSitterItem.tsx ---
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchAddressSuggestions } from "../../services/api";
import style from '../../style/components/search/SearchSitterItem.module.scss';
import LocationPinIcon from '../icons/LocationPinIcon';
import SearchIcon from '../icons/SearchIcon';
import { useDispatch } from "react-redux";

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

interface SearchSitterItemProp {
  serviceType: string;
}

const SearchSitterItem: React.FC<SearchSitterItemProp> = ({ serviceType }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // 1. Создаем реф для инпута

  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  // --- ЛОГИКА ДИНАМИЧЕСКОГО ПЛЕЙСХОЛДЕРА ---
  const getPlaceholder = (service: string) => {
    switch (service) {
      case 'boarding':
        return t('search.placeholders.boarding', 'В каком районе искать ситтера?');
      case 'walking':
        return t('search.placeholders.walking', 'В каком районе нужен выгул?');
      case 'doggy_day_care':
        return t('search.placeholders.doggy_day_care', 'Где нужна дневная няня?');
      case 'drop_in_visit':
        return t('search.placeholders.drop_in_visit', 'Куда должен приехать ситтер?');
      case 'house_sitting':
        return t('search.placeholders.house_sitting', 'Где требуется присмотр?');
      default:
        return t('search.location_placeholder', 'Поиск по району или адресу');
    }
  };

  const debouncedFetch = useMemo(() => debounce(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const results = await fetchAddressSuggestions(query);
      setSuggestions(results);
    } catch (e) { setSuggestions([]); }
  }, 400), []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (locationInput) params.append('address', locationInput);
    params.append('service_key', serviceType);

    navigate(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (s: string) => {
    setLocationInput(s);
    setSuggestions([]);
    setIsActive(false);
  };

  // 2. Функция для клика по контейнеру
  const handleContainerClick = () => {
    setIsActive(true);
    // Принудительно ставим фокус в инпут
    inputRef.current?.focus();
  };

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsActive(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  return (
    <div className={style.searchContainer} ref={wrapperRef}>
      {/* 3. Вешаем обработчик на форму/контейнер */}
      <form
        className={`${style.searchBar} ${isActive ? style.activeBar : ''}`}
        onSubmit={handleSearch}
        onClick={handleContainerClick}
      >
        <div className={style.inputWrapper}>
          <input
            ref={inputRef} // 4. Привязываем реф к инпуту
            type="text"
            placeholder={getPlaceholder(serviceType)}
            value={locationInput}
            onChange={(e) => { setLocationInput(e.target.value); debouncedFetch(e.target.value); }}
            className={style.inputTransparent}
          />
        </div>

        <div className={style.searchBtnWrapper}>
          <button type="submit" className={style.searchBtn} onClick={(e) => e.stopPropagation()}>
            <SearchIcon width={24} height={24} />
            <span className={style.searchBtnText}>{t('SearchSitterItem.searchButtonText', 'Найти')}</span>
          </button>
        </div>

        {isActive && suggestions.length > 0 && (
          <div className={style.dropdownMenu}>
            {suggestions.map((s, i) => (
              <div key={i} className={style.dropdownItem} onClick={(e) => { e.stopPropagation(); handleSuggestionClick(s); }}>
                <LocationPinIcon width={20} /> <span className={style.mainText}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchSitterItem;