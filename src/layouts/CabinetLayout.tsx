import React, { ReactNode, useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "../components/cabinet/Sidebar";
import style from "../style/layouts/CabinetLayout.module.scss";

// SVG для бургера
const MenuIcon = () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

interface CabinetLayoutProps {
    children?: ReactNode;
}

// Маппинг заголовков для хедера
const pageTitles: Record<string, string> = {
    '/cabinet': 'Обзор',
    '/cabinet/profile': 'Мой профиль',
    '/cabinet/pets': 'Мои питомцы',
    '/cabinet/orders': 'Заказы',
    '/cabinet/chat': 'Сообщения',
    '/cabinet/sitter-dashboard': 'Панель управления',
};

const CabinetLayout: React.FC<CabinetLayoutProps> = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const currentPath = location.pathname;
    // Определяем заголовок: если есть точное совпадение, берем его, иначе проверяем начало пути (для чатов с ID)
    let title = pageTitles[currentPath];
    if (!title) {
        if (currentPath.startsWith('/cabinet/chat')) title = 'Сообщения';
        else if (currentPath.startsWith('/cabinet/pets')) title = 'Мои питомцы';
        else title = 'Личный кабинет';
    }

    // Функция для открытия меню из дочерних компонентов (например, из ChatSidebar)
    const openMobileMenu = () => setSidebarOpen(true);

    return (
        <div className={style.layoutContainer}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={style.mainArea}>
                <header className={style.topBar}>
                    <button className={style.mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
                        <MenuIcon />
                    </button>
                    <h1>{title}</h1>
                </header>

                <div className={style.contentWrapper}>
                    {/* 
                       ИСПРАВЛЕНО: Оставляем ТОЛЬКО Outlet. 
                       Убрали {children}, чтобы контент не дублировался.
                    */}
                    <Outlet context={{ openMobileMenu }} />
                </div>
            </div>
        </div>
    );
};

export default CabinetLayout;