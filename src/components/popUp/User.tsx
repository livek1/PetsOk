import React from "react";
import "../../style/components/popUp/user.scss";

interface UserProps {
  hide: boolean;
  handleOpenRegistModal: () => void;
}

const User: React.FC<UserProps> = ({ hide, handleOpenRegistModal }) => {
  return (
    <div className={`user-pop ${hide ? "hide" : ""}`}>
      <div className="user-pop__wrapper">
        <div>
          <div></div>
          <h3>
            Alex <span>ситтер</span>
          </h3>
        </div>
        <button>Профиль</button>
        <button>Настройки</button>
        <button>Помощь</button>
        <hr />
        <button onClick={handleOpenRegistModal}>Зарегистрироваться</button>
        <button>Войти</button>
      </div>
    </div>
  );
};

export default User;
