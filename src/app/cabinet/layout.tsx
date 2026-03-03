'use client';

import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Sidebar from "@/components/cabinet/Sidebar";
import style from "@/style/layouts/CabinetLayout.module.scss";

// Создаем контекст (замена useOutletContext) для передачи функции открытия мобильного меню
interface CabinetContextType {
    openMobileMenu: () => void;
}
export const CabinetContext = createContext<CabinetContextType>({ openMobileMenu: () => { } });
export const useCabinetContext = () => useContext(CabinetContext);

// Маппинг заголовков
const pageTitles: Record<string, string> = {
    '/cabinet': 'Обзор',
    '/cabinet/profile': 'Мой профиль',
    '/cabinet/pets': 'Мои питомцы',
    '/cabinet/orders': 'Мои заказы',
    '/cabinet/orders/create': 'Бронирование',
    '/cabinet/chat': 'Сообщения',
    '/cabinet/sitter-dashboard': 'Панель управления',
    '/cabinet/wallet': 'Финансы',
    '/cabinet/sitter-settings': 'Настройки исполнителя'
};

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);


    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Защита роута
    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated && !token) {
            router.replace('/');
        }
    }, [isAuthenticated, isLoading, token, router, mounted]);

    // Определяем заголовок текущей страницы
    let title = pageTitles[pathname || ''];
    if (!title && pathname) {
        if (pathname.startsWith('/cabinet/chat')) title = 'Сообщения';
        else if (pathname.startsWith('/cabinet/pets')) title = 'Мои питомцы';
        else if (pathname.startsWith('/cabinet/orders/create')) title = 'Бронирование';
        else if (pathname.startsWith('/cabinet/orders')) title = 'Заказ';
        else title = 'Личный кабинет';
    }

    const openMobileMenu = () => setSidebarOpen(true);

    if (!mounted) {
        return null;
    }

    if (isLoading && token && !isAuthenticated) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className={style.layoutContainer}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={style.mainArea}>
                <header className={style.topBar}>
                    <button className={style.mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1>{title}</h1>
                </header>

                <div className={style.contentWrapper}>
                    <CabinetContext.Provider value={{ openMobileMenu }}>
                        {children}
                    </CabinetContext.Provider>
                </div>
            </div>
        </div>
    );
}