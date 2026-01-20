import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import style from '../../style/layouts/CabinetLayout.module.scss';
import { User } from '../../services/api';

// Иконки
const Icons = {
    Home: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    User: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Pets: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    List: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Wallet: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Briefcase: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Settings: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Chat: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    LogOut: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    BecomeSitter: () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            {/* Маленький плюсик внутри или рядом, чтобы показать действие "Добавить" */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4m-2-2h4" />
        </svg>
    ),
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user) as User | null;

    const isSitter = user?.isSitter;

    // Меню для Клиента
    const clientLinks = [
        { to: '/cabinet/profile', label: t('cabinet.profile', 'Мой профиль'), icon: Icons.User },
        { to: '/cabinet/pets', label: t('cabinet.pets', 'Мои питомцы'), icon: Icons.Pets },
        { to: '/cabinet/orders', label: t('cabinet.orders', 'Мои заказы'), icon: Icons.List },
        { to: '/cabinet/wallet', label: t('cabinet.wallet', 'Финансы'), icon: Icons.Wallet },
        { to: '/cabinet/chat', label: t('cabinet.chat', 'Сообщения'), icon: Icons.Chat },
    ];

    // Меню для Ситтера
    const sitterLinks = [
        { to: '/cabinet/sitter-dashboard', label: t('cabinet.sitterDashboard', 'Панель ситтера'), icon: Icons.Home },
        { to: '/cabinet/sitter-jobs', label: t('cabinet.sitterJobs', 'Мои работы'), icon: Icons.Briefcase },
        // НОВЫЙ ПУНКТ:
        { to: '/cabinet/sitter-settings', label: t('sitterSettings.title', 'Настройки исполнителя'), icon: Icons.Settings },
    ];

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/';
    };

    return (
        <>
            <aside className={`${style.sidebar} ${isOpen ? style.open : ''}`}>
                <div className={style.sidebarHeader}>
                    <NavLink to="/" className={style.logo}>PetsOk</NavLink>
                </div>

                <nav className={style.navLinks}>
                    {isSitter && (
                        <>
                            <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '12px', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>
                                {t('cabinet.modeSitter', 'Исполнитель')}
                            </div>
                            {sitterLinks.map(link => (
                                <NavLink key={link.to} to={link.to} className={({ isActive }) => `${style.navItem} ${isActive ? style.active : ''}`} onClick={onClose}>
                                    <link.icon />
                                    {link.label}
                                </NavLink>
                            ))}
                            <div style={{ height: '1px', background: '#eee', margin: '16px 0' }}></div>
                        </>
                    )}

                    <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '12px', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('cabinet.modeClient', 'Клиент')}
                    </div>
                    {clientLinks.map(link => (
                        <NavLink key={link.to} to={link.to} className={({ isActive }) => `${style.navItem} ${isActive ? style.active : ''}`} onClick={onClose}>
                            <link.icon />
                            {link.label}
                        </NavLink>
                    ))}

                    {/* 
                       ВАЖНО: Если пользователь не ситтер, показываем ссылку на Визард (внутренний роут),
                       а не на лендинг.
                    */}
                    {!isSitter && (
                        <NavLink
                            to="/cabinet/become-sitter"
                            className={style.navItem}
                            style={{ marginTop: 'auto', color: '#3598FE', fontWeight: 600 }}
                            onClick={onClose}
                        >
                            <Icons.BecomeSitter />
                            {t('header.becomeSitter', 'Стать ситтером')}
                        </NavLink>
                    )}
                </nav>

                <div className={style.userProfileSnippet}>
                    {user?.avatar?.data?.preview_url ? (
                        <img src={user.avatar.data.preview_url} alt="User" />
                    ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.name?.[0] || 'U'}
                        </div>
                    )}
                    <div className={style.userInfo}>
                        <h4>{user?.name || user?.email}</h4>
                        <span>{isSitter ? t('userRoles.sitter', 'Ситтер') : 'Клиент'}</span>
                    </div>
                    <div className={style.logoutBtn} onClick={handleLogout} title={t('profile.logout', 'Выйти')}>
                        <Icons.LogOut />
                    </div>
                </div>
            </aside>

            {/* Overlay для мобильных */}
            <div className={`${style.overlay} ${isOpen ? style.visible : ''}`} onClick={onClose}></div>
        </>
    );
};

export default Sidebar;