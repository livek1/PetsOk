import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchAddressSuggestions } from "../../services/api";
import style from '../../style/components/search/SearchSitterItem.module.scss';

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
            <svg className={style.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
            </svg>
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
            <svg className={style.buttonIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      {searchError && <p className={style.searchError}>{searchError}</p>}
    </form>
  );
};

export default SearchSitterItem;