import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getOrderRequests,
    selectWorkerForOrder,
    clientInitiateChatWithWorker
} from '../../services/api';

import style from '../../style/pages/cabinet/OrderResponses.module.scss';
import ResponseCard from '../../components/orders/ResponseCard';
import SelectionModal from '../../components/modals/SelectionModal';

// Иконки SVG
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const REQUEST_TYPE = {
    WORKER_OFFER: 'worker_offer',
    CLIENT_INVITE: 'client_invite',
    ADMIN_SUGGESTION: 'admin_suggestion',
};

const REQUEST_STATUS = {
    CANCELED: 'canceled',
    DECLINED: 'declined',
    EXPIRED: 'expired',
};

const OrderResponses = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [requests, setRequests] = useState<any[]>([]);
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (id) fetchResponses();
    }, [id]);

    const fetchResponses = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getOrderRequests(id);
            if (res.data) {
                setRequests(res.data);
                if (res.data.length > 0 && res.data[0].order?.data) {
                    setOrderData(res.data[0].order.data);
                }
            }
        } catch (e) {
            console.error("Error fetching responses:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        // Проверяем, не нажимает ли пользователь на отмененный запрос
        if (item.status === REQUEST_STATUS.CANCELED ||
            item.status === REQUEST_STATUS.DECLINED ||
            item.status === REQUEST_STATUS.EXPIRED) {
            console.warn("Attempted to select an invalid request:", item.status);
            return;
        }
        console.log("Selected request for modal:", item);
        setSelectedRequest(item);
    };

    const handleConfirmSelection = async () => {
        console.log("Confirm button clicked"); // Debug log

        // 1. Проверки перед началом
        if (!selectedRequest) {
            alert("Ошибка: Запрос не выбран");
            return;
        }
        if (!id) {
            alert("Ошибка: ID заказа не найден");
            return;
        }
        if (isProcessing) {
            return; // Защита от двойного клика
        }

        setIsProcessing(true);

        try {
            // 2. Безопасное извлечение профиля исполнителя
            // API может возвращать данные внутри .data или напрямую, обрабатываем оба варианта
            let actorProfile = null;

            if (selectedRequest.request_type === REQUEST_TYPE.WORKER_OFFER) {
                actorProfile = selectedRequest.sender?.data || selectedRequest.sender;
            } else {
                actorProfile = selectedRequest.recipient?.data || selectedRequest.recipient;
            }

            if (!actorProfile || !actorProfile.id) {
                console.error("Profile extraction failed. Request obj:", selectedRequest);
                throw new Error("Не удалось определить ID исполнителя. Данные повреждены.");
            }

            const workerId = actorProfile.id;
            const requestId = selectedRequest.id;

            console.log(`Sending selection: Order=${id}, Worker=${workerId}, Request=${requestId}`);

            // 3. Отправка запроса
            await selectWorkerForOrder(id, workerId, requestId);

            // 4. Успех
            alert(t('common.success', 'Исполнитель успешно выбран!'));
            navigate(`/cabinet/orders`);

        } catch (e: any) {
            console.error("Selection error:", e);
            // Показываем реальную ошибку от сервера или заглушку
            const errorMsg = e.response?.data?.message || e.message || 'Произошла ошибка при выборе исполнителя';
            alert(errorMsg);
        } finally {
            setIsProcessing(false);
            setSelectedRequest(null);
        }
    };

    const handleChat = async (workerId: number, name: string) => {
        if (!id) return;
        try {
            const chat = await clientInitiateChatWithWorker(id, workerId);
            if (chat?.id) navigate(`/cabinet/chat/${chat.id}`);
            else navigate('/cabinet/chat');
        } catch (e) {
            console.error(e);
            alert('Не удалось открыть чат');
        }
    };

    const handleProfile = (workerId: number) => {
        navigate(`/sitter/${workerId}`);
    };

    // Подготовка данных для модалки (мемоизация для оптимизации)
    const calculationDetails = useMemo(() => {
        if (!selectedRequest) return null;

        // Повторяем логику безопасного извлечения
        const actorProfile = selectedRequest.request_type === REQUEST_TYPE.WORKER_OFFER
            ? (selectedRequest.sender?.data || selectedRequest.sender)
            : (selectedRequest.recipient?.data || selectedRequest.recipient);

        if (!actorProfile) return null;

        let priceSummary;
        if (selectedRequest.potential_calculation) {
            // Если расчет есть внутри объекта (иногда бывает внутри data)
            priceSummary = selectedRequest.potential_calculation.client_price_summary || selectedRequest.potential_calculation;
        } else {
            // Фоллбэк, если расчета нет
            priceSummary = {
                original_price: selectedRequest.proposed_price || '0',
                final_price: selectedRequest.proposed_price || '0',
                promo_details: null,
                breakdown_text: null
            };
        }

        return {
            workerName: actorProfile.first_name || actorProfile.name || 'Исполнитель',
            priceSummary
        };
    }, [selectedRequest]);

    // Группировка по секциям
    const sections = useMemo(() => {
        const workerOffers = requests.filter(r => r.request_type === REQUEST_TYPE.WORKER_OFFER);
        const adminSuggestions = requests.filter(r => r.request_type === REQUEST_TYPE.ADMIN_SUGGESTION);
        const clientInvites = requests.filter(r => r.request_type === REQUEST_TYPE.CLIENT_INVITE);
        return { admin: adminSuggestions, offers: workerOffers, invites: clientInvites };
    }, [requests]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading', 'Загрузка...')}</div>;
    const currency = orderData?.currency === 'RUB' ? '₽' : (orderData?.currency || '₽');

    return (
        <div className={style.container}>
            <div className={style.header}>
                <button className={style.backBtn} onClick={() => navigate(`/cabinet/orders`)}>
                    <BackIcon /> <span>{t('common.back', 'Назад')}</span>
                </button>
                <h1>{t('orders.responsesAndInvitesTitle', 'Отклики')}</h1>
            </div>

            <div className={style.content}>
                {requests.length === 0 && (
                    <div className={style.emptyState}>
                        <div className={style.emptyIconCircle}><SearchIcon /></div>
                        <h3>{t('listings.noSittersFound', 'Откликов пока нет')}</h3>
                        <p>{t('responses.noResponsesSub', 'Как только исполнители ответят, они появятся здесь.')}</p>
                    </div>
                )}

                {sections.admin.length > 0 && (
                    <div className={style.section}>
                        <div className={style.sectionHeader}>
                            РЕКОМЕНДАЦИИ СЕРВИСА <span>({sections.admin.length})</span>
                        </div>
                        {sections.admin.map(item => <ResponseCard key={item.id} item={item} currencySymbol={currency} onSelect={handleSelect} onChat={handleChat} onProfile={handleProfile} />)}
                    </div>
                )}

                {sections.offers.length > 0 && (
                    <div className={style.section}>
                        <div className={style.sectionHeader}>
                            ПРЕДЛОЖЕНИЯ ИСПОЛНИТЕЛЕЙ <span>({sections.offers.length})</span>
                        </div>
                        {sections.offers.map(item => <ResponseCard key={item.id} item={item} currencySymbol={currency} onSelect={handleSelect} onChat={handleChat} onProfile={handleProfile} />)}
                    </div>
                )}

                {sections.invites.length > 0 && (
                    <div className={style.section}>
                        <div className={style.sectionHeader}>
                            ВАШИ ПРИГЛАШЕНИЯ <span>({sections.invites.length})</span>
                        </div>
                        {sections.invites.map(item => <ResponseCard key={item.id} item={item} currencySymbol={currency} onSelect={handleSelect} onChat={handleChat} onProfile={handleProfile} />)}
                    </div>
                )}
            </div>

            <SelectionModal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onConfirm={handleConfirmSelection}
                calculation={calculationDetails}
                currencySymbol={currency}
            />
        </div>
    );
};

export default OrderResponses;