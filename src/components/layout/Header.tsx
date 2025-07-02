// --- File: components/layout/Header.tsx ---
import { FC, useCallback, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import style from "../../style/layouts/Header.module.scss";
import UserPopup from "../popups/UserPopup";
import Language from "../modals/LanguageModal";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { enabledServicesForHeader } from "../../config/appConfig";

// --- ИЗМЕНЕНИЕ: Тип для onAuthClick расширен ---
interface HeaderProps {
  onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

// Иконки... (код иконок остается без изменений)
const IconChevronDown: FC<{ className?: string }> = ({ className }) => (<svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z" fill="currentColor" /></svg>);
const IconGlobe: FC<{ className?: string }> = ({ className }) => (<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 12H22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 2C14.5013 4.46682 15.9105 8.16734 16 12C15.9105 15.8327 14.5013 19.5332 12 22C9.49872 19.5332 8.08951 15.8327 8 12C8.08951 8.16734 9.49872 4.46682 12 2V2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconMenu: FC<{ className?: string }> = ({ className }) => (<svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconClose: FC<{ className?: string }> = ({ className }) => (<svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconUserPlaceholder: FC<{ className?: string }> = ({ className }) => (<svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z" fill="currentColor" opacity="0.2" /><path d="M12 14.75C14.0711 14.75 15.75 13.0711 15.75 11C15.75 8.92893 14.0711 7.25 12 7.25C9.92893 7.25 8.25 8.92893 8.25 11C8.25 13.0711 9.92893 14.75 12 14.75Z" fill="currentColor" opacity="0.5" /><path d="M5.14734 18.807C5.92469 17.2956 7.17134 16.049 8.68277 15.2716C10.1942 14.4942 11.9008 14.2458 13.5662 14.5604C15.2316 14.875 16.7832 15.7367 17.9971 16.9993C19.211 18.2619 19.9994 19.862 20.2491 21.5501" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" /></svg>);

interface DropdownPosition { top: number; left?: number; right?: number; minWidth?: number; }
const pagesRequireLightHeader = ['/become-a-sitter', '/contact-us', '/help', '/terms', '/cabinet'];

const Header: FC<HeaderProps> = ({ onAuthClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [userPopUpOpen, setUserPopUpOpen] = useState<boolean>(false);
  const [langModalOpen, setLangModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState<boolean>(false);
  const [useLightHeaderStyle, setUseLightHeaderStyle] = useState<boolean>(false);
  const [servicesDropdownPos, setServicesDropdownPos] = useState<DropdownPosition | null>(null);
  const [userPopUpPos, setUserPopUpPos] = useState<DropdownPosition | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const servicesDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isLightHeaderPage = pagesRequireLightHeader.some(path => location.pathname.startsWith(path));
  const isCabinetPage = location.pathname.startsWith('/cabinet');
  const serviceLinks = enabledServicesForHeader;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 30;
      setUseLightHeaderStyle(isLightHeaderPage || scrolled);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, isLightHeaderPage]);

  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>, align: 'left' | 'right' = 'left', minWidth?: number): DropdownPosition | null => {
    if (buttonRef.current && headerRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      const topPosition = headerBottom + 8;
      const pos: DropdownPosition = { top: topPosition, minWidth: minWidth || buttonRect.width };
      if (align === 'left') pos.left = buttonRect.left;
      else pos.right = window.innerWidth - buttonRect.right;
      return pos;
    }
    return null;
  };

  const toggleUserPopUp = useCallback(() => {
    setUserPopUpOpen(prev => {
      if (!prev) {
        setIsServicesDropdownOpen(false);
        const pos = calculateDropdownPosition(userMenuButtonRef, 'right', 260);
        setUserPopUpPos(pos);
      }
      return !prev;
    });
  }, []);

  const toggleServicesDropdown = useCallback(() => {
    setIsServicesDropdownOpen(prev => {
      if (!prev) {
        setUserPopUpOpen(false);
        if (servicesDropdownButtonRef.current && !mobileMenuOpen) {
          const pos = calculateDropdownPosition(servicesDropdownButtonRef, 'left', 250);
          setServicesDropdownPos(pos);
        }
      }
      return !prev;
    });
  }, [mobileMenuOpen]);

  const closeMobileMenuFully = useCallback(() => {
    setMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => {
      const newState = !prev;
      if (!newState) setIsServicesDropdownOpen(false);
      return newState;
    });
  }, []);

  const closeLangModal = useCallback(() => setLangModalOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const servicesDropdownMenuDesktop = document.getElementById("services-submenu-desktop");
      if (isServicesDropdownOpen && !mobileMenuOpen && servicesDropdownButtonRef.current && !servicesDropdownButtonRef.current.contains(target) && servicesDropdownMenuDesktop && !servicesDropdownMenuDesktop.contains(target)) {
        setIsServicesDropdownOpen(false);
      }
      const userPopupMenu = document.getElementById("user-popup-menu");
      if (userPopUpOpen && userMenuButtonRef.current && !userMenuButtonRef.current.contains(target) && userPopupMenu && !userPopupMenu.contains(target)) {
        setUserPopUpOpen(false);
      }
      if (mobileMenuOpen && mobileMenuPanelRef.current && !mobileMenuPanelRef.current.contains(target) && mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(target)) {
        closeMobileMenuFully();
      }
    };
    if (isServicesDropdownOpen || userPopUpOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isServicesDropdownOpen, userPopUpOpen, mobileMenuOpen, closeMobileMenuFully]);

  useEffect(() => {
    if (mobileMenuOpen || langModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, langModalOpen]);

  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  const dropdownRoot = typeof document !== 'undefined' ? document.getElementById('dropdown-root') : null;

  const renderUserAvatar = () => {
    if (isAuthenticated && user?.avatar?.data?.preview_url) {
      return <img src={user.avatar.data.preview_url} alt={user.name || 'User Avatar'} className={style.userAvatarImage} />;
    }
    return <IconUserPlaceholder className={style.userAvatarIcon} />;
  };

  return (
    <header
      ref={headerRef}
      className={`${style.headerContainer} header-js-hook ${useLightHeaderStyle || isCabinetPage ? style.lightBackground : ''}`}
    >
      <div className={`${style.headerWrapper} ${style.container}`}>
        <div className={style.logo}>
          <Link to="/" aria-label={t('header.logoAriaLabel', 'PetsOk на Главную')}>PetsOk</Link>
        </div>

        {!isCabinetPage && (
          <nav className={style.desktopNav}>
            <ul>
              {serviceLinks.length > 0 && (
                <li className={`${style.navItem} ${style.dropdown} ${isServicesDropdownOpen && !mobileMenuOpen ? style.open : ''}`}>
                  <button ref={servicesDropdownButtonRef} type="button" onClick={toggleServicesDropdown} aria-expanded={isServicesDropdownOpen && !mobileMenuOpen} aria-controls="services-submenu-desktop">
                    {t("header.findService", "Найти услугу")}
                    <IconChevronDown className={style.chevronIcon} />
                  </button>
                  {isServicesDropdownOpen && !mobileMenuOpen && dropdownRoot && servicesDropdownPos && ReactDOM.createPortal(
                    <ul id="services-submenu-desktop" className={`${style.dropdownMenuPortalClass} ${isServicesDropdownOpen ? style.open : ''}`} style={{ top: `${servicesDropdownPos.top}px`, left: servicesDropdownPos.left !== undefined ? `${servicesDropdownPos.left}px` : 'auto', right: servicesDropdownPos.right !== undefined ? `${servicesDropdownPos.right}px` : 'auto', minWidth: `${servicesDropdownPos.minWidth}px` }}>
                      {serviceLinks.map(link => (<li key={link.key}><Link to={`/services/${link.key}`} onClick={() => setIsServicesDropdownOpen(false)}>{t(link.labelKey, link.defaultLabel)}</Link></li>))}
                    </ul>,
                    dropdownRoot
                  )}
                </li>
              )}
              <li className={style.navItem}><Link to="/help">{t("header.help", "Помощь")}</Link></li>
              <li className={style.navItem}><Link to="/become-a-sitter">{t("header.becomeSitter", "Стать ситтером")}</Link></li>
            </ul>
          </nav>
        )}

        <div className={style.headerActionsDesktop}>
          <button onClick={() => setLangModalOpen(true)} aria-label={t('header.changeLanguageAriaLabel', 'Сменить язык')} className={style.langButton}>
            <IconGlobe /> <span>{i18n.language.toUpperCase()}</span>
          </button>
          <div className={style.userMenuContainer}>
            <button ref={userMenuButtonRef} aria-label={t('header.userMenuAriaLabel', 'Меню пользователя')} onClick={toggleUserPopUp} aria-expanded={userPopUpOpen} className={`${style.userMenuButtonDesktop} ${userPopUpOpen ? style.active : ''}`}>
              <IconMenu className={style.burgerIcon} />
            </button>
            {userPopUpOpen && dropdownRoot && userPopUpPos && ReactDOM.createPortal(
              <div id="user-popup-menu" className={`${style.userPopupPortalClass} ${userPopUpOpen ? style.open : ''}`} style={{ top: `${userPopUpPos.top}px`, left: userPopUpPos.left !== undefined ? `${userPopUpPos.left}px` : 'auto', right: userPopUpPos.right !== undefined ? `${userPopUpPos.right}px` : 'auto', minWidth: `${userPopUpPos.minWidth}px` }}>
                <UserPopup
                  hide={userPopUpOpen}
                  handleOpenAuthModal={onAuthClick}
                  onClosePopup={() => setUserPopUpOpen(false)}
                />
              </div>,
              dropdownRoot
            )}
          </div>
        </div>

        <div className={style.mobileMenuTrigger}>
          <button ref={mobileMenuButtonRef} aria-label={mobileMenuOpen ? t('header.closeMenuAriaLabel', 'Закрыть меню') : t('header.openMenuAriaLabel', 'Открыть меню')} aria-expanded={mobileMenuOpen} aria-controls="mobile-nav-panel" onClick={toggleMobileMenu} className={style.mobileMenuButton}>
            {mobileMenuOpen ? <IconClose /> : (isAuthenticated ? renderUserAvatar() : <IconMenu />)}
          </button>
        </div>
      </div>

      <div id="mobile-nav-panel" ref={mobileMenuPanelRef} className={`${style.mobileNavPanel} ${mobileMenuOpen ? style.open : ''}`} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-heading">
        <h2 id="mobile-menu-heading" className={style.visuallyHidden}>{t('header.mobileMenuHeading', 'Мобильное меню')}</h2>
        {!isCabinetPage && (
          <nav className={style.mobileNavLinks}>
            <ul>
              {serviceLinks.length > 0 && (
                <li className={`${style.mobileNavItem} ${style.mobileDropdown} ${isServicesDropdownOpen && mobileMenuOpen ? style.open : ''}`}>
                  <button type="button" onClick={toggleServicesDropdown} aria-expanded={isServicesDropdownOpen && mobileMenuOpen} aria-controls="services-submenu-mobile">
                    {t("header.findService", "Найти услугу")}
                    <IconChevronDown className={`${style.chevronIcon} ${isServicesDropdownOpen && mobileMenuOpen ? style.open : ''}`} />
                  </button>
                  {isServicesDropdownOpen && mobileMenuOpen && (
                    <ul id="services-submenu-mobile" className={`${style.mobileSubmenu} ${style.open}`}>
                      {serviceLinks.map(link => (<li key={link.key}><Link to={`/services/${link.key}`} onClick={closeMobileMenuFully}>{t(link.labelKey, link.defaultLabel)}</Link></li>))}
                    </ul>
                  )}
                </li>
              )}
              <li className={style.mobileNavItem}><Link to="/help" onClick={closeMobileMenuFully}>{t("header.help", "Помощь")}</Link></li>
              <li className={style.mobileNavItem}><Link to="/become-a-sitter" onClick={closeMobileMenuFully}>{t("header.becomeSitter", "Стать ситтером")}</Link></li>
            </ul>
          </nav>
        )}
        <div className={style.mobileUserSection}>
          <button onClick={() => { setLangModalOpen(true); closeMobileMenuFully(); }} className={style.mobileLangButton}>
            <IconGlobe /> <span>{t('header.language', 'Язык')}: {i18n.language.toUpperCase()}</span>
          </button>
          {isAuthenticated && user ? (
            <>
              <p className={style.mobileWelcomeUser}>
                {t('header.welcomeUserShort', 'Привет, {{name}}!', { name: user.first_name || user.name || user.email })}
              </p>
              <button onClick={() => { dispatch(logout()); closeMobileMenuFully(); }} className={style.authButtonSecondary}>
                {t('profile.logout', 'Выйти')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onAuthClick('register')} className={style.authButton}>
                {t('header.register', 'Регистрация')}
              </button>
              <button onClick={() => onAuthClick('login')} className={style.authButtonSecondary}>
                {t('header.login', 'Войти')}
              </button>
            </>
          )}
        </div>
      </div>

      {modalRoot && langModalOpen && ReactDOM.createPortal(
        <Language open={langModalOpen} closeLangModal={closeLangModal} />,
        modalRoot
      )}
    </header>
  );
};

export default Header;