import React, { useEffect, useState } from 'react';
import ReactDOM from "react-dom";
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/OrderResponses.module.scss';

// Иконки
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    calculation: any;
    currencySymbol: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, onConfirm, calculation, currencySymbol }) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    // Логика безопасного поиска или создания root для портала
    useEffect(() => {
        setMounted(true);
        // Проверяем, существует ли root элемент
        let root = document.getElementById('modal-root');
        if (!root) {
            // Если нет - создаем его динамически
            root = document.createElement('div');
            root.id = 'modal-root';
            document.body.appendChild(root);
        }
    }, []);

    // Если компонент не смонтирован, закрыт или нет данных - не рендерим
    if (!mounted || !isOpen || !calculation) {
        // Полезно для отладки: раскомментируйте, если окно не открывается
        // console.log("Modal not rendering. isOpen:", isOpen, "calculation:", calculation); 
        return null;
    }

    const modalRoot = document.getElementById('modal-root') || document.body;

    const { workerName, priceSummary } = calculation;

    // Безопасное извлечение цен
    const finalPrice = Math.round(priceSummary?.final_price || 0);
    const originalPrice = Math.round(priceSummary?.original_price || 0);
    const promo = priceSummary?.promo_details;

    return ReactDOM.createPortal(
        <div className={style.modalOverlay} onClick={onClose}>
            <div className={style.modalContent} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h3>{t('responses.selectionModal.title', 'Подтверждение')}</h3>
                    <button className={style.closeBtn} onClick={onClose}><CloseIcon /></button>
                </div>

                <div className={style.modalBody}>
                    <p className={style.workerName}>
                        Исполнитель: <strong>{workerName}</strong>
                    </p>

                    <div className={style.receiptBox}>
                        <div className={style.receiptRow}>
                            <span>{t('responses.selectionModal.serviceCost', 'Стоимость услуг')}</span>
                            <span>{originalPrice} {currencySymbol}</span>
                        </div>

                        {promo && (
                            <div className={`${style.receiptRow} ${style.promoRow}`}>
                                <span>{t('responses.selectionModal.promoCode', { code: promo.code, defaultValue: `Промокод ${promo.code}` })}</span>
                                <span>- {Math.round(promo.discount_amount || 0)} {currencySymbol}</span>
                            </div>
                        )}

                        <div className={style.divider} />

                        <div className={`${style.receiptRow} ${style.totalRow}`}>
                            <span>{t('responses.selectionModal.total', 'Итого')}</span>
                            <span className={style.totalValue}>{finalPrice} {currencySymbol}</span>
                        </div>
                    </div>

                    <div className={style.infoBox}>
                        <CardIcon />
                        <div>
                            <h4>{t('responses.selectionModal.paymentNoteTitle', 'Платить сейчас не нужно')}</h4>
                            <p>{t('responses.selectionModal.paymentNote', 'Это только выбор исполнителя. Оплата производится на следующем этапе.')}</p>
                        </div>
                    </div>

                    <button className={style.confirmBtn} onClick={onConfirm}>
                        {t('responses.selectionModal.confirmBtn', 'Выбрать исполнителя')}
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default SelectionModal;