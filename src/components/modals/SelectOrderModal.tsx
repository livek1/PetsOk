// --- File: src/components/modals/SelectOrderModal.tsx ---
import React, { useEffect } from 'react';
import ReactDOM from "react-dom";
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ru';
import style from '../../style/components/modals/SelectOrderModal.module.scss';

// Иконки
import BoardingIcon from '../icons/BoardingIcon';
import DogWalkingIcon from '../icons/DogWalkingIcon';
import DropInVisitsIcon from '../icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../icons/DoggyDayCareIcon';
import HouseSittingIcon from '../icons/HouseSittingIcon';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const PawIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path></svg>;

const SERVICE_ICONS: Record<string, React.FC<any>> = {
    boarding: BoardingIcon,
    walking: DogWalkingIcon,
    drop_in_visit: DropInVisitsIcon,
    doggy_day_care: DoggyDayCareIcon,
    house_sitting: HouseSittingIcon,
};

interface SelectOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: any[];
    loading: boolean;
    onSelectOrder: (orderId: number) => void;
    onCreateNew: () => void;
}

const SelectOrderModal: React.FC<SelectOrderModalProps> = ({
    isOpen, onClose, orders, loading, onSelectOrder, onCreateNew
}) => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        moment.locale(i18n.language);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, i18n.language]);

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.header}>
                    <h3>{t('orders.selectOrderTitle', 'Выберите заказ')}</h3>
                    <button className={style.closeBtn} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className={style.content}>
                    <p className={style.subTitle}>
                        {t('orders.selectOrderSubtitle', 'Выберите существующую заявку или создайте новую:')}
                    </p>

                    {loading ? (
                        <div className={style.loaderContainer}>Загрузка...</div>
                    ) : orders.length === 0 ? (
                        <div className={style.emptyState}>
                            {t('orders.noActiveRequests', 'Нет активных заявок для приглашения.')}
                        </div>
                    ) : (
                        <div className={style.ordersList}>
                            {orders.map(order => {
                                const Icon = SERVICE_ICONS[order.service_type] || PawIcon;
                                // --- ИСПРАВЛЕНИЕ: Добавлено 'as string' для совместимости типов TS ---
                                const serviceName = t(`header.services.${order.service_type}`, order.service_type) as string;
                                const dateStr = order.start_date_local
                                    ? `${moment(order.start_date_local).format('D MMM')}${order.end_date_local ? ` - ${moment(order.end_date_local).format('D MMM')}` : ''}`
                                    : t('common.dateNotSet');

                                // Формируем строку питомцев (из массива pets или summary)
                                const petsSummary = order.pets?.data
                                    ? order.pets.data.map((p: any) => p.name).join(', ')
                                    : (order.pets_summary || t('common.pets'));

                                return (
                                    <div key={order.id} className={style.orderCard} onClick={() => onSelectOrder(order.id)}>
                                        <div className={style.serviceIcon}>
                                            <Icon width={24} height={24} />
                                        </div>
                                        <div className={style.orderInfo}>
                                            <h4>{serviceName}</h4>
                                            <div className={style.dates}>{dateStr}</div>
                                            <div className={style.pets}>{petsSummary}</div>
                                        </div>
                                        <div className={style.chevron}>
                                            <ChevronRight />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={style.footer}>
                    <button className={style.createNewBtn} onClick={onCreateNew}>
                        <PlusIcon /> {t('orders.createOrder', 'Создать новый заказ')}
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default SelectOrderModal;