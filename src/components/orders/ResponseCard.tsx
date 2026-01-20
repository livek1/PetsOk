// --- File: src/components/orders/ResponseCard.tsx ---
import React from 'react';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/OrderResponses.module.scss';

// Иконки
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;

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
};

const ResponseCard: React.FC<ResponseCardProps> = ({ item, currencySymbol, onSelect, onChat, onProfile }) => {
    const { t } = useTranslation();

    // Определяем, кто "актер" (кого показываем в карточке)
    // Если это оффер от воркера -> показываем воркера (sender)
    // Если это инвайт от клиента -> показываем воркера (recipient)
    const actorProfile = item.request_type === REQUEST_TYPE.WORKER_OFFER ? item.sender.data : item.recipient.data;
    const workerId = actorProfile.id;
    const name = actorProfile.first_name || actorProfile.name;

    // Цена
    const price = item.proposed_price
        ? `${Math.round(item.proposed_price)} ${currencySymbol}`
        : t('responses.card.priceDiscussion');

    // Статус и активность
    const isPending = item.status === 'pending';
    const isAwaiting = item.status === 'awaiting_client_confirmation';

    // Кнопка "Выбрать" доступна, если это оффер (pending) или если инвайт принят воркером (awaiting_client_confirmation)
    const isActionable = (isPending && item.request_type === REQUEST_TYPE.WORKER_OFFER) || isAwaiting;

    // Логика бейджа статуса
    let badgeClass = style.badgeDefault;
    let badgeText = t('responses.card.status.waiting');

    if (item.request_type === REQUEST_TYPE.WORKER_OFFER && isPending) {
        badgeClass = style.badgeNew;
        badgeText = t('responses.card.status.pending'); // Новое предложение
    } else if (item.status === 'declined') {
        badgeClass = style.badgeError;
        badgeText = t('responses.card.status.declined');
    } else if (isAwaiting) {
        badgeClass = style.badgeNew; // Или зеленый, если есть стиль
        badgeText = t('responses.card.status.accepted'); // Воркер принял инвайт
    }

    return (
        <div className={`${style.card} ${!isActionable && !isPending ? style.cardInactive : ''}`}>
            <div className={style.cardHeader}>
                <div className={style.userInfo} onClick={() => onProfile(workerId)}>
                    <img
                        src={actorProfile.avatar?.data?.preview_url || '/placeholder-user.jpg'}
                        alt={name}
                        className={style.avatar}
                    />
                    <div className={style.userText}>
                        <h3 className={style.userName}>{name}</h3>
                        <div className={style.ratingRow}>
                            <StarIcon />
                            <span className={style.ratingVal}>{actorProfile.calculated_rating || '5.0'}</span>
                            <span className={style.reviewsCount}>
                                ({actorProfile.reviews_count || 0} {t('common.reviewsShort', 'отз.')})
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`${style.statusBadge} ${badgeClass}`}>
                    {badgeText}
                </div>
            </div>

            <div className={style.cardBody}>
                {item.message && (
                    <div className={style.messageBubble}>
                        "{item.message}"
                    </div>
                )}

                <div className={style.priceRow}>
                    <span className={style.priceValue}>{price}</span>
                </div>
            </div>

            <div className={style.cardFooter}>
                <button className={style.chatBtn} onClick={() => onChat(workerId, name)}>
                    <ChatIcon /> {t('responses.card.chatBtn')}
                </button>

                {isActionable && (
                    <button className={style.selectBtn} onClick={() => onSelect(item)}>
                        <CheckIcon /> {t('responses.card.selectBtn')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResponseCard;