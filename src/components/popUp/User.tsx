import React from "react";
import "../../style/components/popUp/user.scss";
import { useTranslation } from "react-i18next";

interface UserProps {
  hide: boolean;
  handleOpenRegistModal: () => void;
}

const User: React.FC<UserProps> = ({ hide, handleOpenRegistModal }) => {
  const { t } = useTranslation();
  return (
    <div className={`user-pop ${hide ? "hide" : ""}`}>
      <div className="user-pop__wrapper">
        <div>
          <div></div>
          <h3>
            Alex <span>ситтер</span>
          </h3>
        </div>
        <button>{t("profile.profile")}</button>
        <button>{t("profile.settings")}</button>
        <button>{t("profile.profsupportile")}</button>

        <hr />
        <button onClick={handleOpenRegistModal}>{t("profile.logIn")}</button>
        <button>{t("profile.signIn")}</button>
      </div>
    </div>
  );
};

export default User;
