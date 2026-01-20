import React from 'react';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/OrderResponses.module.scss';

// Icons
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB822"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="10" r="1" /><circle cx="12" cy="10" r="1" /><circle cx="16" cy="10" r="1" /></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const TimeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const CheckCircleIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

interface ResponseCardProps {
    item: any;
    currencySymbol: string;
    onSelect: (item: any) => void;
    onChat: (workerId: number, name: string) => void;
    onProfile: (workerId: number) => void;
}

const REQUEST_TYPE = {
    WORKER_OFFER: 'worker_offer',
    CLIENT_INVITE: 'client_invite',
    ADMIN_SUGGESTION: 'admin_suggestion',
};

const REQUEST_STATUS = {
    PENDING: 'pending',
    AWAITING_CLIENT_CONFIRMATION: 'awaiting_client_confirmation',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
};

const ResponseCard: React.FC<ResponseCardProps> = ({ item, currencySymbol, onSelect, onChat, onProfile }) => {
    const { t } = useTranslation();

    const actorProfile = item.request_type === REQUEST_TYPE.WORKER_OFFER ? item.sender.data : item.recipient.data;
    const workerId = actorProfile.id;
    const actorName = actorProfile.first_name || actorProfile.name || 'Sitter';
    const hasRating = actorProfile.calculated_rating > 0;
    const ratingDisplay = hasRating ? parseFloat(actorProfile.calculated_rating).toFixed(1) : 'Новый';
    const reviewsCount = actorProfile.reviews_count || 0;

    // Display Status Logic
    const getDisplayStatus = () => {
        const { status, request_type } = item;
        if (status === REQUEST_STATUS.DECLINED) return { text: 'Отклонено', color: '#E53E3E', Icon: CloseIcon, bgColor: '#FFF5F5', isInactive: true };
        if (status === REQUEST_STATUS.CANCELED) return { text: 'Отозвано', color: '#718096', Icon: CloseIcon, bgColor: '#EDF2F7', isInactive: true };
        if (status === REQUEST_STATUS.EXPIRED) return { text: 'Истек срок', color: '#718096', Icon: TimeIcon, bgColor: '#EDF2F7', isInactive: true };

        if (request_type === REQUEST_TYPE.WORKER_OFFER) {
            if (status === REQUEST_STATUS.PENDING) return { text: 'Новое предложение', color: '#3182CE', Icon: MailIcon, bgColor: '#E3F2FD' };
        } else if (request_type === REQUEST_TYPE.CLIENT_INVITE) {
            if (status === REQUEST_STATUS.PENDING) return { text: 'Ожидаем ответ', color: '#DD6B20', Icon: TimeIcon, bgColor: '#FFF8E1' };
            if (status === REQUEST_STATUS.AWAITING_CLIENT_CONFIRMATION) return { text: 'Исполнитель согласен!', color: '#38A169', Icon: CheckIcon, bgColor: '#E8F5E9' };
        } else if (request_type === REQUEST_TYPE.ADMIN_SUGGESTION) {
            if (status === REQUEST_STATUS.AWAITING_CLIENT_CONFIRMATION) return { text: 'Рекомендация сервиса', color: '#805AD5', Icon: CheckIcon, bgColor: '#F3E5F5' };
        }
        return { text: status, color: '#718096', Icon: TimeIcon, bgColor: '#F7FAFC' };
    };

    const displayStatus = getDisplayStatus();
    const isActionable = (item.status === REQUEST_STATUS.PENDING && item.request_type === REQUEST_TYPE.WORKER_OFFER) || (item.status === REQUEST_STATUS.AWAITING_CLIENT_CONFIRMATION);
    const isInactive = displayStatus.isInactive;

    // Price
    const priceDisplay = item.proposed_price ? `${Math.round(item.proposed_price)} ${currencySymbol}` : 'Цена обсуждается';
    const unitLabel = item.potential_calculation?.rate_unit_label || 'услуга';

    const handleSelect = () => {
        if (!isInactive) onSelect(item);
    };

    return (
        <div className={`${style.card} ${isInactive ? style.cardInactive : ''}`} onClick={handleSelect}>
            <div className={style.statusBadge} style={{ backgroundColor: displayStatus.bgColor, color: displayStatus.color }}>
                <div style={{ marginRight: 6, display: 'flex' }}><displayStatus.Icon /></div>
                <span>{displayStatus.text}</span>
            </div>

            <div className={style.cardMainRow}>
                <div onClick={(e) => { e.stopPropagation(); onProfile(workerId); }}>
                    <img
                        src={actorProfile.avatar?.data?.preview_url || '/placeholder-user.jpg'}
                        alt={actorName}
                        className={style.avatar}
                    />
                </div>

                <div className={style.workerInfo}>
                    <div className={style.workerName} onClick={(e) => { e.stopPropagation(); onProfile(workerId); }}>
                        {actorName}
                    </div>
                    <div className={style.ratingRow}>
                        <StarIcon />
                        <span className={style.ratingText}>{ratingDisplay}</span>
                        {reviewsCount > 0 && <span className={style.reviewsText}> • {reviewsCount} отз.</span>}
                    </div>
                    <div className={style.priceText}>
                        {priceDisplay} <span className={style.priceUnit}>/ {unitLabel}</span>
                    </div>
                </div>

                <button className={style.chatBtn} onClick={(e) => { e.stopPropagation(); onChat(workerId, actorName); }}>
                    <ChatIcon />
                </button>
            </div>

            {item.message && (
                <div className={style.messageBubble}>
                    "{item.message}"
                </div>
            )}

            {isActionable && (
                <button className={style.selectBtn} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
                    Выбрать исполнителя
                </button>
            )}
        </div>
    );
};

export default ResponseCard;