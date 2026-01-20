import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from '../style/pages/NotFound.module.scss';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={style.container}>
            <div className={style.content}>

                {/* Иллюстрация: Собака-детектив */}
                <div className={style.illustration}>
                    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" className={style.dogSvg}>
                        {/* Тень */}
                        <ellipse cx="100" cy="150" rx="60" ry="10" fill="#E2E8F0" opacity="0.5" />

                        {/* Собака */}
                        <g className={style.dogBody}>
                            {/* Тело */}
                            <path d="M70 110 C 70 80, 130 80, 130 110 L 130 145 C 130 155, 120 155, 120 145 L 120 135 L 80 135 L 80 145 C 80 155, 70 155, 70 145 Z" fill="#FFA726" stroke="#F57C00" strokeWidth="2" />
                            {/* Голова */}
                            <circle cx="100" cy="75" r="35" fill="#FFA726" stroke="#F57C00" strokeWidth="2" />
                            {/* Уши */}
                            <path d="M65 75 Q 50 100, 60 110" fill="#FFA726" stroke="#F57C00" strokeWidth="2" />
                            <path d="M135 75 Q 150 100, 140 110" fill="#FFA726" stroke="#F57C00" strokeWidth="2" />
                            {/* Мордочка */}
                            <ellipse cx="100" cy="85" rx="12" ry="10" fill="#FFFFFF" />
                            <circle cx="100" cy="80" r="4" fill="#333" />
                            {/* Глаза */}
                            <circle cx="88" cy="70" r="3" fill="#333" />
                            <circle cx="112" cy="70" r="3" fill="#333" />
                            {/* Шапка Шерлока */}
                            <path d="M70 60 Q 100 30, 130 60 L 140 65 Q 100 45, 60 65 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                            <rect x="98" y="45" width="4" height="15" fill="#5D4037" />
                        </g>

                        {/* Хвост (анимация) */}
                        <path d="M70 120 Q 50 110, 60 130" fill="none" stroke="#FFA726" strokeWidth="4" strokeLinecap="round" className={style.tail} />

                        {/* Лупа (анимация) */}
                        <g className={style.magnifier}>
                            <circle cx="130" cy="110" r="15" fill="rgba(255,255,255,0.3)" stroke="#607D8B" strokeWidth="3" />
                            <line x1="140" y1="120" x2="155" y2="135" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
                            {/* Блик на лупе */}
                            <path d="M125 105 Q 130 100, 135 105" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                        </g>

                        {/* Следы (404) */}
                        <text x="20" y="40" className={style.pawText} transform="rotate(-15 20,40)">4</text>
                        <text x="160" y="30" className={style.pawText} transform="rotate(15 160,30)">4</text>
                        <circle cx="100" cy="20" r="12" fill="none" stroke="#3598FE" strokeWidth="3" opacity="0.3" /> {/* Ноль как след */}
                    </svg>
                </div>

                <h1 className={style.title}>Мы потеряли след...</h1>
                <p className={style.description}>
                    Страница <strong>{window.location.pathname}</strong> убежала на прогулку и не вернулась.<br />
                    Наши лучшие ищейки уже ищут её, но пока безуспешно.
                </p>

                <div className={style.actions}>
                    <Link to="/" className={style.primaryBtn}>
                        Вернуться домой
                    </Link>
                    <button onClick={() => navigate('/search')} className={style.secondaryBtn}>
                        Найти ситтера
                    </button>
                </div>

                <div className={style.footerNote}>
                    Код ошибки: 404 (Not Found)
                </div>
            </div>
        </div>
    );
};

export default NotFound;