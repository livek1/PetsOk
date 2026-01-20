// --- File: src/layouts/MainLayout.tsx ---
import React, { ReactNode, useEffect, useState } from "react";
import Footer from "../components/layout/Footer";
import { useLocation } from 'react-router-dom';
import style from "./MainLayout.module.scss";

interface MainLayoutProps {
  children: ReactNode;
}

// --- СПИСОК СТРАНИЦ С ПРОЗРАЧНЫМ ХЕДЕРОМ (ДОЛЖЕН СОВПАДАТЬ С HEADER.TSX) ---
const PAGES_WITH_TRANSPARENT_HEADER = ['/', '/become-a-sitter'];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Получаем высоту хедера
    const updateHeight = () => {
      // Ищем хедер по тегу или классу
      const currentHeader = document.querySelector('header');
      if (currentHeader) {
        setHeaderHeight(currentHeader.offsetHeight);
      } else {
        // Fallback
        const isMobile = window.innerWidth <= 768;
        setHeaderHeight(isMobile ? 70 : 90);
      }
    };

    // Небольшая задержка
    const timer = setTimeout(updateHeight, 50);
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, [location.pathname]);

  // Проверяем, нужна ли прозрачность
  const isTransparentHeaderPage = PAGES_WITH_TRANSPARENT_HEADER.includes(location.pathname);

  return (
    <div className={style.mainLayoutContainer}>
      <main
        className={style.mainContent}
        style={{
          // Если страница с прозрачным хедером, паддинг 0, чтобы фон залез под хедер.
          // Иначе - отступ на высоту хедера.
          paddingTop: isTransparentHeaderPage ? '0px' : `${headerHeight}px`
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;