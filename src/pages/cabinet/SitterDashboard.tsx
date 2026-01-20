import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import style from '../../style/layouts/CabinetLayout.module.scss';

const SitterDashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user?.isSitter) {
        return (
            <div className={style.card} style={{ textAlign: 'center' }}>
                <h2>Станьте частью команды!</h2>
                <p>Вы еще не зарегистрированы как ситтер.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Метрики */}
            <div className={style.statsGrid}>
                <div className={style.statCard}>
                    <div className={`${style.icon} ${style.green}`}>💰</div>
                    <div className={style.info}>
                        <span className={style.label}>Заработано</span>
                        <span className={style.value}>0 ₽</span>
                    </div>
                </div>
                <div className={style.statCard}>
                    <div className={`${style.icon} ${style.blue}`}>📅</div>
                    <div className={style.info}>
                        <span className={style.label}>Предстоящие</span>
                        <span className={style.value}>0</span>
                    </div>
                </div>
                <div className={style.statCard}>
                    <div className={`${style.icon} ${style.orange}`}>⭐</div>
                    <div className={style.info}>
                        <span className={style.label}>Рейтинг</span>
                        <span className={style.value}>5.0</span>
                    </div>
                </div>
            </div>

            <div className={style.card}>
                <h3 style={{ marginBottom: '15px' }}>Активность</h3>
                <p style={{ color: '#666' }}>Новых уведомлений нет.</p>
            </div>
        </div>
    );
};

export default SitterDashboard;