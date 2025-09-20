// src/components/search/SearchSitterItem.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchAddressSuggestions } from "../../services/api";
import style from '../../style/components/search/SearchSitterItem.module.scss';

// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
// Путь '../' верен, если папка 'icons' лежит внутри 'components'
import LocationPinIcon from '../icons/LocationPinIcon';
import SearchIcon from '../icons/SearchIcon';

interface SearchSitterItemProp {
  title: string;
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

const SearchSitterItem: React.FC<SearchSitterItemProp> = ({ title }) => {
  const { t } = useTranslation();
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        return;
      }
      setIsLoadingSuggestions(true);
      setShowSuggestions(true);
      try {
        const results = await fetchAddressSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 700),
    []
  );

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocationInput(newValue);
    setSearchError(null);

    if (newValue.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    } else {
      debouncedFetchSuggestions(newValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocationInput(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);

    if (!locationInput.trim()) {
      setSearchError("Пожалуйста, укажите местоположение.");
      return;
    }
    console.log("Инициирован поиск ситтеров для:", locationInput);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${style.inputWrapper}`) && !target.closest(`.${style.addressSuggestions}`)) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const areInputsEmpty = !locationInput.trim();

  return (
    <form className={style.searchItemForm} onSubmit={handleSearchSubmit}>
      <h3 className={style.searchItemFormTitle}>{title}</h3>
      <div className={style.inputGroup}>
        <div className={style.inputField}>
          <div className={style.inputWrapper}>
            <LocationPinIcon className={style.inputIcon} />
            <input
              id={`search-location-${title.replace(/\s+/g, '-')}`}
              type="text"
              className={style.input}
              placeholder={t("SearchSitterItem.locationPlaceholder", "Например, Москва или м. Арбатская")}
              value={locationInput}
              onChange={handleLocationChange}
              onFocus={() => { if (locationInput.length >= 2 && (suggestions.length > 0 || isLoadingSuggestions)) setShowSuggestions(true); }}
              autoComplete="off"
            />
            {showSuggestions && (locationInput.length >= 2) && (
              <ul className={style.addressSuggestions}>
                {isLoadingSuggestions ? (
                  <li className={`${style.suggestionItem} ${style.loading}`}>{t("loading", "Загрузка...")}</li>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <li key={index} className={style.suggestionItem} onClick={() => handleSuggestionClick(suggestion)} onMouseDown={(e) => e.preventDefault()}>
                      {suggestion}
                    </li>
                  ))
                ) : (
                  !isLoadingSuggestions && <li className={`${style.suggestionItem} ${style.noResults}`}>{t("SearchSitterItem.noSuggestions", "Нет совпадений")}</li>
                )}
              </ul>
            )}
          </div>
        </div>
        <div className={`${style.buttonContainer} ${areInputsEmpty ? style.buttonIconOnly : style.buttonWithText}`}>
          <button type="submit" className={style.button} disabled={isLoadingSuggestions}>
            <span className={style.buttonText}>{t("SearchSitterItem.searchButtonText", "Найти")}</span>
            <SearchIcon className={style.buttonIcon} />
          </button>
        </div>
      </div>
      {searchError && <p className={style.searchError}>{searchError}</p>}
    </form>
  );
};

export default SearchSitterItem;