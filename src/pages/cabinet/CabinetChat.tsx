// --- File: src/pages/cabinet/CabinetChat.tsx ---
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'; // Новые хуки
import { RootState, AppDispatch } from '../../store';
import { WEBSOCKET_CONNECT } from '../../store/middleware/websocketMiddleware';
import { fetchDialogues, setCurrentChatGroupId, clearCurrentChatGroupId } from '../../store/slices/dialoguesSlice';
import style from '../../style/pages/cabinet/Chat.module.scss';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';

// Интерфейс для контекста, который мы передаем из Layout
interface CabinetChatContext {
    openMobileMenu: () => void;
}

const CabinetChat = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Получаем ID из URL

    // Получаем функцию открытия меню из контекста лайаута
    const { openMobileMenu } = useOutletContext<CabinetChatContext>() || {};

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
        navigate(`/cabinet/chat/${groupId}`);
    };

    // Обработчик "Назад" в мобильной версии
    const handleBackToList = () => {
        navigate('/cabinet/chat'); // Сбрасываем ID в URL
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