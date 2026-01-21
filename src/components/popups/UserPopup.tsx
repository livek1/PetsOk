// --- File: src/components/popups/UserPopup.tsx ---
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import style from "./UserPopup.module.scss";

interface UserPopupProps {
  hide: boolean;
  handleOpenAuthModal: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
  onClosePopup: () => void;
}

const UserPopup: React.FC<UserPopupProps> = ({ hide, handleOpenAuthModal, onClosePopup }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    onClosePopup();
    navigate('/'); // Навигация без перезагрузки
  };

  if (!hide) {
    return null;
  }

  return (
    <div className={`${style.userPopupContainer} ${hide ? style.visible : ""}`}>
      <div className={style.userPopupWrapper}>
        {isLoading && !user && <p className={style.loadingText}>{t('loading', 'Загрузка...')}</p>}

        {isAuthenticated && user ? (
          <>
            <div className={style.userInfo}>
              {user.avatar?.data?.preview_url ? (
                <img src={user.avatar.data.preview_url} alt={user.name || 'User Avatar'} className={style.userAvatar} />
              ) : (
                <div className={style.avatarPlaceholder}>
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className={style.userDetails}>
                <span className={style.userName}>{user.name || user.email}</span>
                {user.isSitter ? (
                  <span className={style.userRole}>{t('userRoles.sitter', 'Ситтер')}</span>
                ) : (
                  <span className={style.userRole}>{t('cabinet.modeClient', 'Клиент')}</span>
                )}
              </div>
            </div>

            <Link to="/cabinet" className={style.popupLink} onClick={onClosePopup}>
              {t("cabinet.title", "Личный кабинет")}
            </Link>
            <Link to="/help" className={style.popupLink} onClick={onClosePopup}>
              {t("profile.help", "Помощь и поддержка")}
            </Link>

            <hr className={style.separator} />
            <button onClick={handleLogout} className={`${style.popupLink} ${style.logoutButton}`}>
              {t("profile.logout.confirmButton", "Выйти")}
            </button>
          </>
        ) : (
          !isLoading && (
            <>
              <button onClick={() => { handleOpenAuthModal('register', 'client'); onClosePopup(); }} className={style.popupActionStrong}>
                {t("profile.signIn", "Регистрация")}
              </button>
              <button onClick={() => { handleOpenAuthModal('login', 'client'); onClosePopup(); }} className={style.popupAction}>
                {t("profile.logIn", "Войти")}
              </button>
              <hr className={style.separator} />
              <Link to="/become-a-sitter" className={style.popupLink} onClick={onClosePopup}>
                {t("header.becomeSitter", "Стать ситтером")}
              </Link>
              <Link to="/help" className={style.popupLink} onClick={onClosePopup}>
                {t("header.help", "Помощь")}
              </Link>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default UserPopup;