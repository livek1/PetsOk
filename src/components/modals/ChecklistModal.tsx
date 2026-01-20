// --- File: src/components/modals/ChecklistModal.tsx ---
import React from 'react';
import ReactDOM from "react-dom";
import { useTranslation } from 'react-i18next';
import style from '../../style/components/modal/ChecklistModal.module.scss';

// Иконки
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const modalRoot = document.getElementById('modal-root');

const ChecklistModal: React.FC<ChecklistModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen || !modalRoot) return null;

    const items = [
        t('checklist.food', 'Корм и лакомства'),
        t('checklist.leash', 'Ошейник и поводок'),
        t('checklist.bowls', 'Миски (для еды и воды)'),
        t('checklist.toy', 'Любимая игрушка'),
        t('checklist.bed', 'Лежанка или плед'),
        t('checklist.passport', 'Ветпаспорт (если есть)'),
        t('checklist.meds', 'Лекарства (если нужны)'),
    ];

    return ReactDOM.createPortal(
        <div className={style.modalOverlay} onClick={onClose}>
            <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={style.header}>
                    <h3>{t('checklist.title', 'Что взять с собой?')}</h3>
                    <button className={style.closeBtn} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <p className={style.subtitle}>
                    {t('checklist.subtitle', 'Список вещей, которые рекомендуется передать ситтеру вместе с питомцем:')}
                </p>

                <ul className={style.list}>
                    {items.map((item, index) => (
                        <li key={index} className={style.listItem}>
                            <div className={style.checkCircle}>
                                <CheckIcon />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <button className={style.confirmBtn} onClick={onClose}>
                    {t('common.understood', 'Понятно')}
                </button>
            </div>
        </div>,
        modalRoot
    );
};

export default ChecklistModal;