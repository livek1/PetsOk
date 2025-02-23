import { useState } from "react";
import SearchSitterItem from "./searchSitterItem";

const tabs = [
  { name: "Передержка", description: "Дома у догситтера" },
  { name: "Дневная няня", description: "У вас дома" },
  { name: "Выгул", description: "В вашем районе" },
];

const SearchSitter = () => {
  const [activeIndex, setActiveIndex] = useState(0);

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
          {activeIndex === 0 && <SearchSitterItem title={"Даты передержки"} />}
          {activeIndex === 1 && <SearchSitterItem title={"Дата"} />}
          {activeIndex === 2 && <SearchSitterItem title={"Даты выгула"} />}
        </div>
      </div>
    </div>
  );
};

export default SearchSitter;
