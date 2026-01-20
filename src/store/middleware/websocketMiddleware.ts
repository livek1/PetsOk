import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Middleware } from 'redux';
import { RootState } from '../index';
import { updateDialogueFromWs, setDialogueTyping, clearTypingForUserInGroup } from '../slices/dialoguesSlice';
import { websocketStateChange } from '../slices/websocketSlice';
import { config as appConfig } from '../../config/appConfig';

declare global {
    interface Window {
        Pusher: any;
    }
}
window.Pusher = Pusher;

export const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';
export const WEBSOCKET_DISCONNECT = 'WEBSOCKET_DISCONNECT';
export const SUBSCRIBE_TO_GROUP_TYPING_CHANNEL = 'SUBSCRIBE_TO_GROUP_TYPING_CHANNEL';
export const UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL = 'UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL';
export const SEND_TYPING = 'SEND_TYPING';

let echo: any = null;
let currentConnectedUserId: string | null = null;
const typingChannels: Record<string, any> = {};
const typingTimeouts: Record<string, NodeJS.Timeout> = {};

const transformMessageForRedux = (resource: any) => {
    if (!resource || !resource.id) return null;
    const ownerId = String(resource.owner_id || resource.sender_id || resource.user?.id || resource.user?._id || '');
    const ownerData = resource.owner || resource.user;
    return {
        id: Number(resource.id),
        text: resource.message || resource.text || '',
        createdAt: resource.created_at || new Date().toISOString(),
        is_system: !!resource.is_system,
        chat_group_id: String(resource.chat_group_id || resource.group_id),
        owner_id: ownerId,
        user: {
            _id: ownerId,
            id: ownerId,
            name: ownerData?.name || resource.sender_name || 'User',
            avatar: ownerData?.avatar
        },
        gallery: resource.gallery || [],
        read: resource.read || false,
        _receiveTimestamp: Date.now()
    };
};

export const websocketMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
    const { dispatch, getState } = store;

    switch (action.type) {
        case WEBSOCKET_CONNECT: {
            const state = getState();
            const token = state.auth.token;
            const userId = action.payload?.userId ? String(action.payload.userId) : state.auth.user?.id ? String(state.auth.user.id) : null;

            if (!token || !userId) return next(action);
            if (echo && echo.connector.pusher.connection.state === 'connected' && currentConnectedUserId === userId) return next(action);
            if (echo) disconnectWebSocket(dispatch);

            dispatch(websocketStateChange({ connecting: true, error: null }));

            fetch(`${appConfig.apiBaseUrl}/chat/verify`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            })
                .then(res => res.json())
                .then(config => {
                    if (!config.app_key) throw new Error('Invalid WS config');
                    echo = new Echo({
                        broadcaster: 'pusher',
                        key: config.app_key,
                        cluster: config.app_cluster || 'mt1',
                        wsHost: config.host || 'petsok.ru',
                        wsPort: config.port || 443,
                        wssPort: config.port || 443,
                        forceTLS: config.scheme === 'https' || config.port === 443,
                        disableStats: true,
                        encrypted: true,
                        authEndpoint: `${appConfig.apiBaseUrl.replace('/api/v1', '')}/broadcasting/auth`,
                        auth: { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
                        enabledTransports: ['ws', 'wss'],
                    });

                    echo.connector.pusher.connection.bind('connected', () => {
                        currentConnectedUserId = userId;
                        dispatch(websocketStateChange({ connected: true, connecting: false, error: null }));

                        const userChannelName = `App.Containers.User.Models.User.${userId}`;
                        echo.private(userChannelName)
                            .listen('Ws.ReceiveUserMessage', (payload: any) => {
                                const resource = payload.resource || payload;
                                if (resource) {
                                    const msg = transformMessageForRedux(resource);
                                    if (msg) {
                                        dispatch(updateDialogueFromWs({ ...msg, currentUserIdInApp: userId }));
                                        dispatch(clearTypingForUserInGroup({
                                            groupId: String(msg.chat_group_id),
                                            userId: String(msg.owner_id)
                                        }));
                                    }
                                }
                            });
                    });
                    echo.connector.pusher.connection.bind('disconnected', () => {
                        dispatch(websocketStateChange({ connected: false, connecting: false }));
                        currentConnectedUserId = null;
                    });
                    echo.connector.pusher.connection.bind('error', (err: any) => {
                        if (err?.error?.data?.code !== 4004) dispatch(websocketStateChange({ connected: false, connecting: false, error: 'Connection error' }));
                    });
                })
                .catch(err => dispatch(websocketStateChange({ connecting: false, error: err.message })));
            break;
        }
        case WEBSOCKET_DISCONNECT: disconnectWebSocket(dispatch); break;
        case SUBSCRIBE_TO_GROUP_TYPING_CHANNEL: if (echo && action.payload?.groupId) subscribeToDialogueTyping(dispatch, getState, String(action.payload.groupId)); break;
        case UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL: if (action.payload?.groupId) unsubscribeFromDialogueTyping(String(action.payload.groupId)); break;
        case SEND_TYPING: {
            const { groupId } = action.payload;
            const channel = typingChannels[String(groupId)];
            if (channel) {
                const userId = getState().auth.user?.id;
                channel.whisper('typing', { userId: String(userId) });
            }
            break;
        }
    }
    return next(action);
};

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
    if (!echo || typingChannels[groupId]) return;
    const channel = echo.private(`App.Models.ChatGroup.${groupId}`);
    typingChannels[groupId] = channel;

    channel.listenForWhisper('typing', (data: any) => {
        const typingUserId = String(data?.userId || 'partner');
        const currentAuthUserId = String(getState().auth.user?.id);

        if (typingUserId === currentAuthUserId) return;

        dispatch(setDialogueTyping({ groupId, userId: typingUserId, isTyping: true }));

        const timeoutKey = `${groupId}_${typingUserId}`;
        if (typingTimeouts[timeoutKey]) clearTimeout(typingTimeouts[timeoutKey] as any);

        typingTimeouts[timeoutKey] = setTimeout(() => {
            dispatch(setDialogueTyping({ groupId, userId: typingUserId, isTyping: false }));
            delete typingTimeouts[timeoutKey];
        }, 3000);
    });
};

const unsubscribeFromDialogueTyping = (groupId: string) => {
    if (!echo) return;
    Object.keys(typingTimeouts).forEach(key => {
        if (key.startsWith(`${groupId}_`)) {
            clearTimeout(typingTimeouts[key] as any);
            delete typingTimeouts[key];
        }
    });
    if (typingChannels[groupId]) { echo.leave(`App.Models.ChatGroup.${groupId}`); delete typingChannels[groupId]; }
};