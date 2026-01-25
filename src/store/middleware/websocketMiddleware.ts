// --- File: src/store/middleware/websocketMiddleware.ts ---
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Middleware } from 'redux';
import { RootState } from '../index';
import { updateDialogueFromWs, setDialogueTyping, clearTypingForUserInGroup } from '../slices/dialoguesSlice';
import { websocketStateChange } from '../slices/websocketSlice';
import { config as appConfig } from '../../config/appConfig';

// Делаем Pusher доступным глобально (требование Laravel Echo)
declare global {
    interface Window {
        Pusher: any;
    }
}
window.Pusher = Pusher;

// Action Types
export const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';
export const WEBSOCKET_DISCONNECT = 'WEBSOCKET_DISCONNECT';
export const SUBSCRIBE_TO_GROUP_TYPING_CHANNEL = 'SUBSCRIBE_TO_GROUP_TYPING_CHANNEL';
export const UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL = 'UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL';
export const SEND_TYPING = 'SEND_TYPING';

let echo: any = null;
let currentConnectedUserId: string | null = null;
const typingChannels: Record<string, any> = {};
const typingTimeouts: Record<string, NodeJS.Timeout> = {};

// Функция нормализации сообщения (как в RN, но адаптирована под Web типы)
const transformMessageForRedux = (resource: any) => {
    if (!resource || !resource.id) return null;

    // Определяем owner_id
    const ownerId = String(resource.owner_id || resource.sender_id || resource.user?.id || resource.user?._id || '');
    const ownerData = resource.owner || resource.user;

    // Аватарка может приходить в разных форматах
    const avatarData = ownerData?.avatar?.preview_url || ownerData?.avatar?.url || resource.sender_avatar?.preview_url || resource.sender_avatar;

    return {
        id: Number(resource.id),
        text: resource.message || resource.text || '',
        createdAt: resource.created_at || new Date().toISOString(),
        is_system: !!resource.is_system,
        chat_group_id: String(resource.chat_group_id || resource.group_id),
        owner_id: ownerId,
        user: {
            _id: ownerId, // Для совместимости с UI
            id: ownerId,
            name: ownerData?.name || resource.sender_name || 'User',
            avatar: { preview_url: avatarData }
        },
        gallery: resource.gallery || [],
        read: resource.read || false,
        pending: false,
        failed: false,
        _receiveTimestamp: Date.now(), // Метка времени для принудительного обновления React
        tempId: resource.tempId // Если это ответ на наше сообщение
    };
};

export const websocketMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
    const { dispatch, getState } = store;

    switch (action.type) {
        case WEBSOCKET_CONNECT: {
            const state = getState();
            const token = state.auth.token;
            // Берем ID юзера из пейлоада или из стейта
            const userId = action.payload?.userId ? String(action.payload.userId) : state.auth.user?.id ? String(state.auth.user.id) : null;

            if (!token || !userId) {
                console.warn('[WS] Missing token or userId, skipping connect');
                return next(action);
            }

            // Если уже подключены с тем же юзером - ничего не делаем
            if (echo && echo.connector.pusher.connection.state === 'connected' && currentConnectedUserId === userId) {
                return next(action);
            }

            // Если подключены, но юзер другой - переподключаемся
            if (echo) disconnectWebSocket(dispatch);

            dispatch(websocketStateChange({ connecting: true, error: null }));

            // 1. Получаем конфиг с бэкенда
            fetch(`${appConfig.apiBaseUrl}/chat/verify`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            })
                .then(res => {
                    if (!res.ok) throw new Error(`Config fetch error: ${res.status}`);
                    return res.json();
                })
                .then(config => {
                    if (!config.app_key) throw new Error('Invalid WS config');

                    console.log('[WS] Config received:', config);

                    // --- ВАЖНЫЙ ФИКС ДЛЯ ПРОДАКШЕНА (HTTPS) ---
                    // Если сайт на https, мы игнорируем порт 6001 от бэкенда и идем на 443 через Nginx
                    const useTLS = window.location.protocol === 'https:' || config.scheme === 'https' || config.tls === true;

                    // Auth Endpoint (убираем /api/v1, добавляем /broadcasting/auth)
                    // Пример: https://petsok.ru/broadcasting/auth
                    const authUrl = `${appConfig.apiBaseUrl.replace('/api/v1', '')}/broadcasting/auth`;

                    echo = new Echo({
                        broadcaster: 'pusher',
                        key: config.app_key,
                        cluster: config.app_cluster || 'mt1',

                        // Хост (без порта)
                        wsHost: config.host || window.location.hostname,

                        // ФОРСИРУЕМ 443 ПОРТ ДЛЯ SSL
                        wsPort: useTLS ? 443 : (config.port || 6001),
                        wssPort: 443,

                        forceTLS: useTLS,
                        disableStats: true,
                        encrypted: true,

                        authEndpoint: authUrl,
                        auth: {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/json'
                            }
                        },
                        // Разрешаем только WebSocket (без HTTP поллинга, он часто глючит с кастомными портами)
                        enabledTransports: ['ws', 'wss'],
                    });

                    // --- Обработчики событий соединения ---

                    echo.connector.pusher.connection.bind('connected', () => {
                        console.log('[WS] Connected');
                        currentConnectedUserId = userId;
                        dispatch(websocketStateChange({ connected: true, connecting: false, error: null }));

                        // Подписываемся на личный канал юзера (уведомления, новые сообщения)
                        const userChannelName = `App.Containers.User.Models.User.${userId}`;
                        echo.private(userChannelName)
                            .listen('Ws.ReceiveUserMessage', (payload: any) => {
                                console.log('[WS] ReceiveUserMessage:', payload);
                                const resource = payload.resource || payload;
                                if (resource) {
                                    const msg = transformMessageForRedux(resource);
                                    if (msg) {
                                        // Отправляем в Redux
                                        dispatch(updateDialogueFromWs({ ...msg, currentUserIdInApp: userId }));

                                        // Сбрасываем "печатает...", если пришло сообщение от этого юзера
                                        dispatch(clearTypingForUserInGroup({
                                            groupId: String(msg.chat_group_id),
                                            userId: String(msg.owner_id)
                                        }));
                                    }
                                }
                            });
                    });

                    echo.connector.pusher.connection.bind('disconnected', () => {
                        console.log('[WS] Disconnected');
                        dispatch(websocketStateChange({ connected: false, connecting: false }));
                        currentConnectedUserId = null;
                    });

                    echo.connector.pusher.connection.bind('error', (err: any) => {
                        console.error('[WS] Error:', err);
                        // Игнорируем ошибку 4004 (канал не найден), остальные логируем
                        if (err?.error?.data?.code !== 4004) {
                            dispatch(websocketStateChange({ connected: false, connecting: false, error: 'Connection error' }));
                        }
                    });
                })
                .catch(err => {
                    console.error('[WS] Init failed:', err);
                    dispatch(websocketStateChange({ connecting: false, error: err.message }));
                });
            break;
        }

        case WEBSOCKET_DISCONNECT:
            disconnectWebSocket(dispatch);
            break;

        case SUBSCRIBE_TO_GROUP_TYPING_CHANNEL:
            if (echo && action.payload?.groupId) {
                subscribeToDialogueTyping(dispatch, getState, String(action.payload.groupId));
            }
            break;

        case UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL:
            if (action.payload?.groupId) {
                unsubscribeFromDialogueTyping(String(action.payload.groupId));
            }
            break;

        case SEND_TYPING: {
            const { groupId } = action.payload;
            const channel = typingChannels[String(groupId)];
            if (channel) {
                const userId = getState().auth.user?.id;
                // Отправляем client-event (whisper)
                // Внимание: для этого в Laravel Echo должен быть включен client-events в настройках канала
                channel.whisper('typing', { userId: String(userId) });
            }
            break;
        }
    }
    return next(action);
};

// --- Вспомогательные функции ---

const disconnectWebSocket = (dispatch: any) => {
    if (echo) {
        Object.keys(typingChannels).forEach(gId => unsubscribeFromDialogueTyping(gId));
        echo.disconnect();
        echo = null;
        currentConnectedUserId = null;
        dispatch(websocketStateChange({ connected: false, connecting: false, error: null }));
    }
};

const subscribeToDialogueTyping = (dispatch: any, getState: any, groupId: string) => {
    // Не подписываемся дважды
    if (!echo || typingChannels[groupId]) return;

    // Канал чата (presence или private, зависит от бэка, обычно private для чатов)
    const channelName = `App.Models.ChatGroup.${groupId}`;
    console.log(`[WS] Subscribing to typing channel: ${channelName}`);

    const channel = echo.private(channelName);
    typingChannels[groupId] = channel;

    // Слушаем событие 'client-typing' (в терминологии Echo это whisper('typing'))
    channel.listenForWhisper('typing', (data: any) => {
        const typingUserId = String(data?.userId || 'partner');
        const currentAuthUserId = String(getState().auth.user?.id);

        // Игнорируем свое собственное печатание
        if (typingUserId === currentAuthUserId) return;

        // 1. Ставим статус "печатает"
        dispatch(setDialogueTyping({ groupId, userId: typingUserId, isTyping: true }));

        // 2. Сбрасываем таймер очистки
        const timeoutKey = `${groupId}_${typingUserId}`;
        if (typingTimeouts[timeoutKey]) clearTimeout(typingTimeouts[timeoutKey] as any);

        // 3. Через 3 секунды убираем статус
        typingTimeouts[timeoutKey] = setTimeout(() => {
            dispatch(setDialogueTyping({ groupId, userId: typingUserId, isTyping: false }));
            delete typingTimeouts[timeoutKey];
        }, 3000);
    });
};

const unsubscribeFromDialogueTyping = (groupId: string) => {
    if (!echo) return;

    // Очищаем таймеры
    Object.keys(typingTimeouts).forEach(key => {
        if (key.startsWith(`${groupId}_`)) {
            clearTimeout(typingTimeouts[key] as any);
            delete typingTimeouts[key];
        }
    });

    // Отписываемся
    if (typingChannels[groupId]) {
        echo.leave(`App.Models.ChatGroup.${groupId}`);
        delete typingChannels[groupId];
    }
};