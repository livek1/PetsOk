import { useEffect, FC, useState, useCallback } from 'react';
import ReactDOM from "react-dom";
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from "react-i18next";

import { config as defaultConfig } from './config/appConfig';

// Существующие импорты страниц
import Home from './pages/Home';
import BecomeASitterPage from './pages/BecomeASitterPage';
import CookieConsentBanner from './components/layout/CookieConsentBanner';
import { loadUser, logout, clearAuthErrors } from './store/slices/authSlice';
import { loadAppConfig } from './store/slices/configSlice';
import { AppDispatch, RootState } from './store';
import Header from './components/layout/Header';
import MainLayout from './layouts/MainLayout';
import { supportedLngs } from './i18n';
import LegalPage from './pages/LegalPage';
import AppRedirectPage from './pages/AppRedirectPage';
import { AuthModal } from './components/modals/AuthModal';
import SearchResults from './pages/SearchResults';
import SitterPage from './pages/SitterPage';

// --- НОВЫЕ ИМПОРТЫ ДЛЯ КАБИНЕТА ---
import CabinetLayout from './layouts/CabinetLayout';
import CabinetChat from './pages/cabinet/CabinetChat';
import CabinetProfile from './pages/cabinet/CabinetProfile';
import CabinetPets from './pages/cabinet/CabinetPets';
import CabinetOrders from './pages/cabinet/CabinetOrders';
import SitterDashboard from './pages/cabinet/SitterDashboard';
import CabinetPetForm from './pages/cabinet/CabinetPetForm';
import CabinetPetDetails from './pages/cabinet/CabinetPetDetails';
import BecomeSitterWizard from './pages/cabinet/becomeSitter/BecomeSitterWizard';
import OrderDetails from './pages/cabinet/OrderDetails';
import CreateOrder from './pages/cabinet/CreateOrder';
import NotFound from './pages/NotFound';
import HelpPage from './pages/HelpPage';
import CabinetWallet from './pages/cabinet/CabinetWallet';
import CabinetSitterProfile from './pages/cabinet/CabinetSitterProfile';
import OrderResponses from './pages/cabinet/OrderResponses';

// Компонент-редирект для корня кабинета (/cabinet)
const CabinetIndexRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <Navigate to={user?.isSitter ? "/cabinet/sitter-dashboard" : "/cabinet/profile"} replace />;
};

const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isLoading && token && !isAuthenticated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>;
  }
  if (!isAuthenticated && !isLoading && !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const PageMeta: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const canonicalUrl = `${defaultConfig.siteUrl}${location.pathname}`;
  return (<Helmet><html lang={t('seo.html_lang', 'ru')} /><link rel="canonical" href={canonicalUrl} />{supportedLngs.map(lang => (<link key={lang.code} rel="alternate" hrefLang={lang.code} href={`${defaultConfig.siteUrl}${location.pathname}?lng=${lang.code}`} />))}<link rel="alternate" hrefLang="x-default" href={`${defaultConfig.siteUrl}${location.pathname}`} /></Helmet>);
};

export const getReferralCode = (): string | undefined => {
  return Cookies.get(defaultConfig.referralParamName);
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
  const { maintenance } = useSelector((state: RootState) => state.config);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [registrationType, setRegistrationType] = useState<'client' | 'sitter'>('client');
  const modalRoot = document.getElementById('modal-root');

  const handleOpenAuthModal = useCallback((mode: 'login' | 'register', type: 'client' | 'sitter' = 'client') => {
    setAuthModalMode(mode);
    setRegistrationType(type);
    setAuthModalOpen(true);
    dispatch(clearAuthErrors());
  }, [dispatch]);

  const handleCloseAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    dispatch(loadAppConfig());
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => {
      const value = urlParams.get(param);
      if (value) { Cookies.set(param, value, { expires: 30, path: '/' }); }
    });
    const refCodeFromUrl = urlParams.get(defaultConfig.referralParamName);
    if (refCodeFromUrl) {
      const existingRefCode = Cookies.get(defaultConfig.referralParamName);
      if (!existingRefCode || existingRefCode !== refCodeFromUrl) {
        Cookies.set(defaultConfig.referralParamName, refCodeFromUrl, { expires: 30, path: '/' });
      }
    }
  }, [dispatch]);

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

  if (maintenance?.enabled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Технические работы</h1>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>{maintenance.message || 'Сервис временно недоступен. Пожалуйста, зайдите позже.'}</p>
      </div>
    );
  }

  const isPreloading = false;

  return (
    <Router>
      <>
        <CookieConsentBanner />
        <Routes>
          <Route path="/app" element={<AppRedirectPage />} />

          {/* Публичные страницы */}
          <Route element={<PageLayout onAuthClick={handleOpenAuthModal} />}>
            <Route path="/" element={<Home isPreloading={isPreloading} />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/become-a-sitter" element={<BecomeASitterPage isPreloading={isPreloading} />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/sitter/:id" element={<SitterPage />} />
            <Route path="/terms" element={<LegalPage contentKey="terms" />} />
            <Route path="/privacy-policy" element={<LegalPage contentKey="privacy" />} />
            <Route path="/cookie-policy" element={<LegalPage contentKey="cookie" />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* --- ПРИВАТНАЯ ЗОНА: КАБИНЕТ --- */}
          <Route
            path="/cabinet"
            element={
              <ProtectedRoute>
                <CabinetLayout>
                  <Outlet />
                </CabinetLayout>
              </ProtectedRoute>
            }
          >
            {/* Редирект с /cabinet на нужный подраздел */}
            <Route index element={<CabinetIndexRedirect />} />
            <Route path="orders/create" element={<CreateOrder />} />

            {/* ЧАТЫ: Добавлен роут с ID */}
            <Route path="chat" element={<CabinetChat />} />
            <Route path="chat/:id" element={<CabinetChat />} />

            {/* Клиентские маршруты */}
            <Route path="profile" element={<CabinetProfile />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders/:id/responses" element={<OrderResponses />} />

            <Route path="pets" element={<CabinetPets />} />
            <Route path="pets/add" element={<CabinetPetForm mode="create" />} />
            <Route path="pets/:id" element={<CabinetPetDetails />} />
            <Route path="pets/:id/edit" element={<CabinetPetForm mode="edit" />} />
            <Route path="become-sitter" element={<BecomeSitterWizard />} />
            <Route path="orders" element={<CabinetOrders />} />
            <Route path="wallet" element={<CabinetWallet />} />
            <Route path="sitter-settings" element={<CabinetSitterProfile />} />

            {/* Маршруты ситтера */}
            <Route path="sitter-dashboard" element={<SitterDashboard />} />
            <Route path="sitter-jobs" element={<div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Список работ в разработке.</div>} />

            {/* Фолбэк */}
            <Route path="*" element={<CabinetIndexRedirect />} />
          </Route>
        </Routes>

        {modalRoot && authModalOpen && ReactDOM.createPortal(
          <AuthModal
            isOpen={authModalOpen}
            onClose={handleCloseAuthModal}
            initialMode={authModalMode}
            registrationType={registrationType}
          />,
          modalRoot
        )}
      </>
    </Router>
  );
};

export default App;