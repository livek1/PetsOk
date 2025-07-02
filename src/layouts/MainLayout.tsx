import React, { ReactNode, useEffect, useState } from "react";
import Footer from "../components/layout/Footer";
import { useLocation } from 'react-router-dom';
import style from "./MainLayout.module.scss";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();

  // Эффект для вычисления высоты хедера и добавления отступа для контента
  useEffect(() => {
    // Запрос к DOM лучше делать после монтирования, чтобы гарантировать наличие элемента
    const updateHeight = () => {
      const currentHeader = document.querySelector('.header-js-hook') as HTMLElement;
      if (currentHeader) {
        setHeaderHeight(currentHeader.offsetHeight);
      } else {
        // Fallback, если хедер не найден сразу
        const isMobile = window.innerWidth <= 768;
        setHeaderHeight(isMobile ? 70 : 80);
      }
    };

    // Небольшая задержка, чтобы React успел отрисовать хедер
    const timer = setTimeout(updateHeight, 0);

    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, [location.pathname]); // Пересчитываем, если изменился путь (хедер может быть другим)

  // На главной странице Hero-блок должен быть под хедером, поэтому отступ не нужен
  const isHomePage = location.pathname === '/';

  return (
    <div className={style.mainLayoutContainer}>
      {/* Header теперь рендерится через <Outlet> в App.tsx */}
      <main
        className={style.mainContent}
        // На главной странице отступ не нужен, т.к. Hero-блок имеет свой фон
        // На остальных страницах контент начнется после хедера
        style={{ paddingTop: isHomePage ? '0px' : `${headerHeight}px` }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;