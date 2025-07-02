// --- File: src/App.tsx ---
import { useEffect, FC, useState, useCallback } from 'react';
import ReactDOM from "react-dom";
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from 'qrcode.react';

import { config } from './config/appConfig';
import Home from './pages/Home';
import BecomeASitterPage from './pages/BecomeASitterPage';
import CookieConsentBanner from './components/layout/CookieConsentBanner';
import { loadUser, logout, clearAuthErrors } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store';
import Header from './components/layout/Header';
import MainLayout from './layouts/MainLayout';
import { supportedLngs } from './i18n';
import LegalPage from './pages/LegalPage';
import AppRedirectPage from './pages/AppRedirectPage';
import { AuthModal } from './components/modals/AuthModal';

// --- Компоненты CabinetPage и ProtectedRoute остаются без изменений ---
const CabinetPage: FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="cabinet-container">
      <div className="cabinet-content">
        <h1>{t('cabinet.title', 'Личный кабинет')}</h1>
        {user && <p>{t('cabinet.welcome', 'Добро пожаловать, {{name}}!', { name: user.name || user.email })}</p>}
        <div className="cabinet-app-promo">
          <div className="promo-icon">🚀</div>
          <h2>{t('cabinet.appPromo.title', 'Перейдите на новый уровень удобства!')}</h2>
          <p>{t('cabinet.appPromo.text', 'Все ключевые функции — от общения с ситтерами и управления заказами до получения фотоотчетов — доступны в нашем мобильном приложении. Установите его, чтобы получить максимум от PetsOk.')}</p>
          <div className="promo-main-area">
            <div className="promo-qr-code">
              <QRCodeCanvas value={config.appUniversalUrl} size={120} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#1A202C" />
              <span className="qr-text">{t('cabinet.appPromo.scan', 'Сканируйте для загрузки')}</span>
            </div>
            <div className="promo-buttons-vertical">
              <a href={config.appStoreUrl} target="_blank" rel="noopener noreferrer" className="promo-button apple"><svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor"><path d="M16.511 11.45a5.204 5.204 0 00-3.32-4.432 5.342 5.342 0 00-4.321.465c-.9.6-1.74 1.83-2.2 3.016-1.739 4.381.583 8.79 2.373 11.605.86.1.413 1.748 2.373 1.748 1.54 0 2.219-.997 3.73-.997s1.49.997 3.078.95c1.64-.047 2.68-1.54 3.518-2.916.9-1.588 1.25-3.266 1.299-3.363a.52.52 0 00-.472-.73c-2.115-.28-3.385-1.587-3.41-3.363zm-2.42-4.997a4.91 4.91 0 011.66-3.116c-.058 0-1.719 1.094-3.167 2.373-1.282 1.14-2.228 2.73-1.928 4.431.149 0 1.858-1.14 3.435-3.688z" /></svg><span>App Store</span></a>
              <a href={config.googlePlayUrl} target="_blank" rel="noopener noreferrer" className="promo-button google"><svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor"><path d="M21.47 12.337l-9.752-5.717a.64.64 0 00-.95.556v11.43a.639.639 0 00.95.556l9.752-5.716a.64.64 0 000-1.112zM4.14 23.361a.63.63 0 01-.63-.63V1.272a.63.63 0 01.63-.63.63.63 0 01.63.63v21.458a.63.63 0 01-.63.631zM6.66 21.459a.63.63 0 01-.63-.63V3.172a.63.63 0 111.26 0v17.657a.63.63 0 01-.63.63z" /></svg><span>Google Play</span></a>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">{t('profile.logout', 'Выйти')}</button>
      </div>
      <style>{`.cabinet-container{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;min-height:calc(100vh - 150px);background-color:#f8f9fa}.cabinet-content{background-color:#fff;padding:30px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,.08);text-align:center;width:100%;max-width:600px}h1{margin-bottom:1rem}p{margin-bottom:2rem;font-size:1.1rem;color:#6c757d}.logout-button{padding:10px 20px;margin-top:20px;cursor:pointer;background-color:#f04040;color:#fff;border:none;border-radius:5px;font-weight:700;transition:background-color .2s}.logout-button:hover{background-color:#d03030}.cabinet-app-promo{border:1px solid #e0e0e0;background-color:#fafcff;border-radius:10px;padding:25px;margin-top:25px}.promo-icon{font-size:2.5rem;margin-bottom:1rem}.cabinet-app-promo h2{font-size:1.5rem;color:#333;margin-bottom:.75rem;font-weight:600}.cabinet-app-promo p{font-size:1rem;color:#555;line-height:1.6;margin-bottom:1.5rem}.promo-main-area{display:flex;align-items:center;justify-content:center;gap:30px;margin-top:20px}.promo-qr-code{display:flex;flex-direction:column;align-items:center;gap:8px}.qr-text{font-size:.8rem;color:#6c757d;font-weight:500}.promo-buttons-vertical{display:flex;flex-direction:column;gap:15px;align-items:stretch}.promo-button{display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;transition:all .2s;justify-content:center}.promo-button.apple{background-color:#000;color:#fff}.promo-button.google{background-color:#fff;color:#333;border:1px solid #ccc}.promo-button:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(0,0,0,.1)}`}</style>
    </div>
  );
};
const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  if (isLoading && token && !isAuthenticated) { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка данных пользователя...</div>; }
  if (!isAuthenticated && !isLoading) { return <Navigate to="/" state={{ from: location }} replace />; }
  return <>{children}</>;
};
const PageMeta: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const canonicalUrl = `${config.siteUrl}${location.pathname}`;
  return (<Helmet><html lang={t('seo.html_lang', 'ru')} /><link rel="canonical" href={canonicalUrl} />{supportedLngs.map(lang => (<link key={lang.code} rel="alternate" hrefLang={lang.code} href={`${config.siteUrl}${location.pathname}?lng=${lang.code}`} />))}<link rel="alternate" hrefLang="x-default" href={`${config.siteUrl}${location.pathname}`} /></Helmet>);
};
export const getReferralCode = (): string | undefined => {
  return Cookies.get(config.referralParamName);
};

interface PageLayoutProps {
  onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

const PageLayout: FC<PageLayoutProps> = ({ onAuthClick }) => {
  return (
    <MainLayout>
      <PageMeta />
      <Header onAuthClick={onAuthClick} />
      <Outlet context={{ onAuthClick }} />
    </MainLayout>
  );
};

const App: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [registrationType, setRegistrationType] = useState<'client' | 'sitter'>('client'); // <-- Состояние для типа
  const modalRoot = document.getElementById('modal-root');

  // --- ИСПРАВЛЕННЫЙ ОБРАБОТЧИК ---
  const handleOpenAuthModal = useCallback((mode: 'login' | 'register', type: 'client' | 'sitter' = 'client') => {
    setAuthModalMode(mode);
    setRegistrationType(type); // Устанавливаем тип ПЕРЕД открытием модалки
    setAuthModalOpen(true);
    dispatch(clearAuthErrors());
  }, [dispatch]);

  const handleCloseAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => {
      const value = urlParams.get(param);
      if (value) { Cookies.set(param, value, { expires: 30, path: '/' }); }
    });
    const refCodeFromUrl = urlParams.get(config.referralParamName);
    if (refCodeFromUrl) {
      const existingRefCode = Cookies.get(config.referralParamName);
      if (!existingRefCode || existingRefCode !== refCodeFromUrl) {
        Cookies.set(config.referralParamName, refCodeFromUrl, { expires: 30, path: '/' });
      }
    }
  }, []);

  useEffect(() => {
    if (token && (!user || !isAuthenticated)) {
      dispatch(loadUser()).unwrap().catch((error) => { console.log('App.tsx: User load failed or token invalid on app start.', error); });
    }
  }, [dispatch, token, user, isAuthenticated]);

  useEffect(() => {
    const handleAuthErrorEvent = () => {
      console.log('AuthError401 event caught in App.tsx, dispatching logout.');
      dispatch(logout());
    };
    window.addEventListener('authError401', handleAuthErrorEvent);
    return () => { window.removeEventListener('authError401', handleAuthErrorEvent); };
  }, [dispatch]);

  const isPreloading = false;

  return (
    <Router>
      <>
        <CookieConsentBanner />
        <Routes>
          <Route path="/app" element={<AppRedirectPage />} />

          <Route element={<PageLayout onAuthClick={handleOpenAuthModal} />}>
            <Route path="/" element={<Home isPreloading={isPreloading} />} />
            <Route path="/become-a-sitter" element={<BecomeASitterPage isPreloading={isPreloading} />} />
            <Route path="/terms" element={<LegalPage contentKey="terms" />} />
            <Route path="/privacy-policy" element={<LegalPage contentKey="privacy" />} />
            <Route path="/cookie-policy" element={<LegalPage contentKey="cookie" />} />
          </Route>

          <Route
            path="/cabinet/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Header onAuthClick={handleOpenAuthModal} /> {/* В кабинете тоже нужна эта функция */}
                  <CabinetPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>

        {modalRoot && authModalOpen && ReactDOM.createPortal(
          <AuthModal
            isOpen={authModalOpen}
            onClose={handleCloseAuthModal}
            initialMode={authModalMode}
            registrationType={registrationType} // <-- Передаем актуальный тип
          />,
          modalRoot
        )}
      </>
    </Router>
  );
};

export default App;