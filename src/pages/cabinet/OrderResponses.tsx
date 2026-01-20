// --- File: src/pages/cabinet/OrderResponses.tsx ---
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

// Иконки
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;

const REQUEST_TYPE = {
    WORKER_OFFER: 'worker_offer',
    CLIENT_INVITE: 'client_invite',
    ADMIN_SUGGESTION: 'admin_suggestion',
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
        setLoading(true);
        try {
            const res = await getOrderRequests(id!);
            if (res.data) {
                setRequests(res.data);
                // Пытаемся достать данные заказа из первого отклика
                // В API response.data[0].order.data
                if (res.data.length > 0 && res.data[0].order?.data) {
                    setOrderData(res.data[0].order.data);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Группировка
    const sections = useMemo(() => {
        const workerOffers = requests.filter(r => r.request_type === REQUEST_TYPE.WORKER_OFFER);
        const adminSuggestions = requests.filter(r => r.request_type === REQUEST_TYPE.ADMIN_SUGGESTION);
        const clientInvites = requests.filter(r => r.request_type === REQUEST_TYPE.CLIENT_INVITE);

        return {
            admin: adminSuggestions,
            offers: workerOffers,
            invites: clientInvites
        };
    }, [requests]);

    const handleChat = async (workerId: number, name: string) => {
        try {
            const chat = await clientInitiateChatWithWorker(id!, workerId);
            if (chat?.id) navigate(`/cabinet/chat/${chat.id}`);
            else navigate('/cabinet/chat');
        } catch (e) {
            alert('Не удалось открыть чат');
        }
    };

    const handleProfile = (workerId: number) => {
        navigate(`/sitter/${workerId}`);
    };

    const handleSelect = (item: any) => {
        setSelectedRequest(item);
    };

    const handleConfirmSelection = async () => {
        if (!selectedRequest || !id || isProcessing) return;
        setIsProcessing(true);

        const actorProfile = selectedRequest.request_type === REQUEST_TYPE.WORKER_OFFER ? selectedRequest.sender.data : selectedRequest.recipient.data;
        const workerId = actorProfile.id;

        try {
            await selectWorkerForOrder(id, workerId, selectedRequest.id);
            alert(t('common.success'));
            // Редирект обратно к заказу (там уже должен обновиться статус)
            navigate(`/cabinet/orders/${id}`);
        } catch (e: any) {
            alert(e.message || 'Ошибка выбора');
        } finally {
            setIsProcessing(false);
            setSelectedRequest(null);
        }
    };

    // Подготовка данных для модалки из `potential_calculation`
    const calculationDetails = useMemo(() => {
        if (!selectedRequest) return null;

        const actorProfile = selectedRequest.request_type === REQUEST_TYPE.WORKER_OFFER ? selectedRequest.sender.data : selectedRequest.recipient.data;

        let priceSummary;
        if (selectedRequest.potential_calculation) {
            priceSummary = selectedRequest.potential_calculation.client_price_summary;
        } else {
            // Фолбек
            priceSummary = {
                original_price: selectedRequest.proposed_price || '0',
                final_price: selectedRequest.proposed_price || '0',
                promo_details: null
            };
        }

        return {
            workerName: actorProfile.first_name || actorProfile.name,
            priceSummary
        };
    }, [selectedRequest]);


    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading')}</div>;

    const currency = orderData?.currency === 'RUB' ? '₽' : (orderData?.currency || '₽');

    return (
        <div className={style.container}>
            <div className={style.header}>
                <button className={style.backBtn} onClick={() => navigate(`/cabinet/orders/${id}`)}>
                    <BackIcon /> <span>{t('common.back')}</span>
                </button>
                <h1>{t('responses.title')}</h1>
            </div>

            <div className={style.content}>
                {requests.length === 0 && (
                    <div className={style.emptyState}>
                        <h3>{t('responses.noResponses')}</h3>
                        <p>{t('responses.noResponsesSub')}</p>
                    </div>
                )}

                {/* 1. Рекомендации */}
                {sections.admin.length > 0 && (
                    <div className={style.section}>
                        <h2>{t('responses.adminSuggestions')}</h2>
                        <div className={style.list}>
                            {sections.admin.map(item => (
                                <ResponseCard
                                    key={item.id}
                                    item={item}
                                    currencySymbol={currency}
                                    onSelect={handleSelect}
                                    onChat={handleChat}
                                    onProfile={handleProfile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Предложения (Воркеры) */}
                {sections.offers.length > 0 && (
                    <div className={style.section}>
                        <h2>{t('responses.workerOffers')}</h2>
                        <div className={style.list}>
                            {sections.offers.map(item => (
                                <ResponseCard
                                    key={item.id}
                                    item={item}
                                    currencySymbol={currency}
                                    onSelect={handleSelect}
                                    onChat={handleChat}
                                    onProfile={handleProfile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Приглашения (от клиента) */}
                {sections.invites.length > 0 && (
                    <div className={style.section}>
                        <h2>{t('responses.clientInvites')}</h2>
                        <div className={style.list}>
                            {sections.invites.map(item => (
                                <ResponseCard
                                    key={item.id}
                                    item={item}
                                    currencySymbol={currency}
                                    onSelect={handleSelect}
                                    onChat={handleChat}
                                    onProfile={handleProfile}
                                />
                            ))}
                        </div>
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