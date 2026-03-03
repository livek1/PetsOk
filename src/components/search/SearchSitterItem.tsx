// --- File: src/components/search/SearchSitterItem.tsx ---
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { fetchAddressSuggestions } from "@/services/api";
import { getCitySlugFromName, SERVICE_KEYS_TO_SLUGS } from "@/config/seoConfig";
import style from '@/style/components/search/SearchSitterItem.module.scss';
import LocationPinIcon from '../icons/LocationPinIcon';
import SearchIcon from '../icons/SearchIcon';

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

const POPULAR_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Краснодар",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Алматы" // Добавили Алматы для примера
];

interface SearchSitterItemProp {
  serviceType: string; // 'boarding', 'walking' и т.д.
}

const SearchSitterItem: React.FC<SearchSitterItemProp> = ({ serviceType }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  const getPlaceholder = (service: string) => {
    switch (service) {
      case 'boarding': return t('search.placeholders.boarding', 'В каком городе искать ситтера?');
      case 'walking': return t('search.placeholders.walking', 'В каком городе нужен выгул?');
      case 'doggy_day_care': return t('search.placeholders.doggy_day_care', 'Где нужна дневная няня?');
      case 'drop_in_visit': return t('search.placeholders.drop_in_visit', 'Куда должен приехать ситтер?');
      case 'house_sitting': return t('search.placeholders.house_sitting', 'Где требуется присмотр?');
      default: return t('search.location_placeholder', 'Поиск по городу или адресу');
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

  // УМНЫЙ РОУТИНГ
  const navigateToSearch = (addressQuery: string) => {
    const citySlug = getCitySlugFromName(addressQuery);
    const serviceSlug = SERVICE_KEYS_TO_SLUGS[serviceType];

    if (citySlug && serviceSlug) {
      // Если это базовый город из нашего SEO-конфига -> Идем на красивый URL
      router.push(`/${citySlug}/${serviceSlug}`);
    } else {
      // Если это точный адрес (ул. Ленина 10) -> Идем на стандартный поиск
      const params = new URLSearchParams();
      params.append('address', addressQuery);
      params.append('service_key', serviceType);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!locationInput.trim()) {
      setIsActive(true);
      inputRef.current?.focus();
      return;
    }
    navigateToSearch(locationInput);
  };

  const handleSuggestionClick = (s: string) => {
    setLocationInput(s);
    setSuggestions([]);
    setIsActive(false);
    navigateToSearch(s);
  };

  const handleContainerClick = () => {
    setIsActive(true);
    inputRef.current?.focus();
  };

  const handleGeoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.geolocation) return alert("Геолокация не поддерживается вашим браузером");

    setIsLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/search?lat=${latitude}&lon=${longitude}&service_key=${serviceType}`);
        setIsLoadingGeo(false);
      },
      (error) => {
        console.error(error);
        setIsLoadingGeo(false);
        inputRef.current?.focus();
      }
    );
  };

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

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
            if (!locationInput) e.stopPropagation();
          }}>
            <SearchIcon width={24} height={24} />
            <span className={style.searchBtnText}>{t('SearchSitterItem.searchButtonText', 'Найти')}</span>
          </button>
        </div>

        {showSuggestionsList && (
          <div className={style.dropdownMenu}>
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

            {isShowingPopular && !isLoadingGeo && (
              <div style={{ padding: '8px 28px 4px', fontSize: '12px', color: '#A0AEC0', fontWeight: 600 }}>
                ПОПУЛЯРНЫЕ ГОРОДА
              </div>
            )}

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