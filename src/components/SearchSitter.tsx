import { useState } from "react";

import { useTranslation } from "react-i18next";
import SearchSitterItem from "./SearchSitterItem";

const SearchSitter = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const tabs = [
    {
      name: `${t("SearchSitter.InptWhere")}`,
      description: `${t("SearchSitter.navsitterBoardingDesc")}`,
    },
    {
      name: `${t("SearchSitter.navsitterDayNanny")}`,
      description: `${t("SearchSitter.navsitterDayNannyDesc")}`,
    },
    {
      name: `${t("SearchSitter.navsitterPaddock")}`,
      description: `${t("SearchSitter.navsitterPaddockDesc")}`,
    },
  ];

  return (
    <div className="search-sitter">
      <ul className="search-sitter__hero">
        {tabs.map((tab, i) => (
          <li
            key={i}
            className={activeIndex === i ? "active" : ""}
            onClick={() => setActiveIndex(i)}
          >
            <h3>{tab.name}</h3>
            <span>{tab.description}</span>
          </li>
        ))}
      </ul>

      <div className="search-sitter__body">
        <div className="content">
          {activeIndex === 0 && (
            <SearchSitterItem title={`${t("SearchSitter.InptWhere")}`} />
          )}
          {activeIndex === 1 && (
            <SearchSitterItem title={`${t("SearchSitter.InptOverexposure")}`} />
          )}
          {activeIndex === 2 && (
            <SearchSitterItem title={`${t("SearchSitter.InptWalking")}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSitter;
