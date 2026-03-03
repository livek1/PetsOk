'use client'; // Обязательно в обоих файлах!

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store';
import { WEBSOCKET_CONNECT } from '@/store/middleware/websocketMiddleware';
import { fetchDialogues, setCurrentChatGroupId, clearCurrentChatGroupId } from '@/store/slices/dialoguesSlice';
import style from '@/style/pages/cabinet/Chat.module.scss';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useCabinetContext } from '../layout';

// Интерфейс для контекста, который мы передаем из Layout
interface CabinetChatContext {
    openMobileMenu: () => void;
}

const CabinetChat = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { openMobileMenu } = useCabinetContext();

    const { user } = useSelector((state: RootState) => state.auth);
    const { currentChatGroupId } = useSelector((state: RootState) => state.dialogues);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Подключение к WebSocket при входе
    useEffect(() => {
        dispatch(fetchDialogues());
        if (user?.id) {
            dispatch({ type: WEBSOCKET_CONNECT, payload: { userId: user.id } });
        }
        return () => {
            dispatch(clearCurrentChatGroupId());
        };
    }, [dispatch, user]);

    // Синхронизация URL -> State
    useEffect(() => {
        if (id) {
            setSelectedGroupId(id);
            dispatch(setCurrentChatGroupId(id));
        } else {
            setSelectedGroupId(null);
            dispatch(clearCurrentChatGroupId());
        }
    }, [id, dispatch]);

    // Обработчик выбора чата в сайдбаре
    const handleSelectChat = (groupId: string) => {
        // Просто меняем URL, эффект выше обновит стейт
        router.push(`/cabinet/chat/${groupId}`);
    };

    // Обработчик "Назад" в мобильной версии
    const handleBackToList = () => {
        router.push('/cabinet/chat'); // Сбрасываем ID в URL
    };

    return (
        <div className={style.chatContainer}>
            <ChatSidebar
                onSelect={handleSelectChat}
                activeGroupId={selectedGroupId}
                // Если выбран чат, на мобильном скрываем список
                className={selectedGroupId ? style.hiddenOnMobile : ''}
                onOpenMenu={openMobileMenu} // Передаем функцию открытия меню
            />

            {selectedGroupId ? (
                <ChatWindow
                    groupId={selectedGroupId}
                    onBack={handleBackToList}
                />
            ) : (
                <div className={`${style.chatWindow} ${style.hiddenOnMobile} ${style.emptyState}`}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 50, marginBottom: 20 }}>💬</div>
                        <p style={{ fontSize: 18, color: '#666' }}>
                            {t('chat.selectChatToStart', 'Выберите чат для начала общения')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetChat;