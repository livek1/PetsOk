import { FC, useCallback, useState } from "react";
import style from "../style/layouts/Header.module.scss";
import User from "./popUp/User";
import { Registration } from "./modals/Registration";

const Header: FC = () => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [registrModalOpen, setRegistrModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const handleOpenRegistModal = useCallback(() => {
    setRegistrModalOpen(true);
  }, []);
  const handleCloseRegistModal = useCallback(() => {
    setRegistrModalOpen(false);
  }, []);

  const handleOpenUserModal = useCallback(() => {
    setUserModalOpen((prev) => !prev);
  }, []);

  return (
    <header>
      <div className={style.headerWrapper}>
        <div className={style.logo}>PetsOk</div>
        <nav>
          <ul>
            <li>
              Our Services{" "}
              <svg
                width="13"
                height="12"
                viewBox="0 0 13 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.15408 4.37518C3.25277 4.27724 3.3866 4.22222 3.52614 4.22222C3.66569 4.22222 3.79952 4.27724 3.89821 4.37518L6.50318 6.96119L9.10815 4.37518C9.2074 4.28002 9.34033 4.22736 9.47832 4.22855C9.6163 4.22974 9.74829 4.28468 9.84586 4.38154C9.94344 4.47841 9.99878 4.60944 9.99998 4.74642C10.0012 4.8834 9.94814 5.01536 9.85227 5.11389L6.87524 8.06926C6.77655 8.1672 6.64272 8.22222 6.50318 8.22222C6.36363 8.22222 6.2298 8.1672 6.13111 8.06926L3.15408 5.11389C3.05542 5.01592 3 4.88307 3 4.74454C3 4.60601 3.05542 4.47315 3.15408 4.37518Z"
                  fill="#B9BAC7"
                />
              </svg>
            </li>
            <li>Search Sitters</li>
          </ul>
        </nav>
      </div>
      <Registration
        handleCloseRegistModal={handleCloseRegistModal}
        registrModalOpen={registrModalOpen}
      />

      <div className={style.btns}>
        <a href="">Стать ситтером</a>
        <button
          onClick={() => setLangModalOpen((prev) => !prev)}
          aria-label="Change language"
          className={style.laug}
        >
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.25 13.5C2.25 19.7134 7.28663 24.75 13.5 24.75C19.7134 24.75 24.75 19.7134 24.75 13.5C24.75 7.28663 19.7134 2.25 13.5 2.25C7.28663 2.25 2.25 7.28663 2.25 13.5Z"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.625 2.30625C14.625 2.30625 18 6.75 18 13.5C18 20.25 14.625 24.6938 14.625 24.6938M12.375 24.6938C12.375 24.6938 8.99999 20.25 8.99999 13.5C8.99999 6.75 12.375 2.30625 12.375 2.30625M2.95874 17.4375H24.0412M2.95874 9.5625H24.0412"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          EN
          <div
            className={`${style.Launguage} ${langModalOpen ? style.hide : ""}`}
          >
            <ul>
              <li>EN</li>
              <li>EN</li>
              <li>EN</li>
            </ul>
          </div>
        </button>
        <button
          aria-label="User menu"
          onClick={handleOpenUserModal}
          className={style.user}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.125 4.75H16.0312M2.96875 9.5H16.0312M2.96875 14.25H16.0312M2.96875 6.53125L4.75 4.75L2.96875 2.96875"
              stroke="black"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="35" height="35" rx="17.5" fill="#F2F2F2" />
            <path
              d="M25.1938 20.5C25.9392 20.5007 26.654 20.7973 27.1809 21.3246C27.7078 21.852 28.0038 22.567 28.0038 23.3125V24.46C28.0037 25.1762 27.78 25.8746 27.3638 26.4575C25.4313 29.1625 22.2763 30.5012 18.0013 30.5012C13.7238 30.5012 10.57 29.1612 8.6425 26.4562C8.22766 25.8737 8.00482 25.1764 8.00501 24.4612V23.3112C8.00534 22.5658 8.30163 21.8509 8.82877 21.3238C9.35591 20.7966 10.0708 20.5003 10.8163 20.5H25.1938ZM18 5.50625C18.8208 5.50625 19.6335 5.66791 20.3918 5.982C21.1501 6.29609 21.8391 6.75646 22.4194 7.33683C22.9998 7.9172 23.4602 8.60619 23.7743 9.36448C24.0883 10.1228 24.25 10.9355 24.25 11.7562C24.25 12.577 24.0883 13.3897 23.7743 14.148C23.4602 14.9063 22.9998 15.5953 22.4194 16.1757C21.8391 16.756 21.1501 17.2164 20.3918 17.5305C19.6335 17.8446 18.8208 18.0062 18 18.0062C16.3424 18.0062 14.7527 17.3478 13.5806 16.1757C12.4085 15.0036 11.75 13.4139 11.75 11.7562C11.75 10.0986 12.4085 8.50893 13.5806 7.33683C14.7527 6.16473 16.3424 5.50625 18 5.50625Z"
              fill="black"
            />
          </svg>
        </button>
        <User
          hide={userModalOpen}
          handleOpenRegistModal={handleOpenRegistModal}
        />
      </div>
    </header>
  );
};

export default Header;
