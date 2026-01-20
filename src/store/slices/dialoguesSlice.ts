// --- File: src/store/slices/dialoguesSlice.ts ---
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getDialogues } from '../../services/api';

export interface Message {
    id: number | string;
    text: string;
    createdAt: string;
    user: {
        _id: string;
        name: string;
        avatar?: string | { preview_url?: string; url?: string };
    };
    gallery?: any[];
    is_system?: boolean;
    read?: boolean;
    pending?: boolean;
    failed?: boolean;
    chat_group_id: string;
    owner_id: string;
    _receiveTimestamp?: number;
    tempId?: string;
}

export interface Dialogue {
    id: string;
    type?: string;
    status?: string;
    participant?: {
        id: string;
        name: string;
        avatar?: { url?: string; preview_url?: string };
        is_online?: boolean;
    };
    unread_count: number;
    last_message?: Message;
    last_message_at?: string;
}

interface DialoguesState {
    dialoguesList: Dialogue[];
    currentChatGroupId: string | null;
    lastReceivedMessage: Message | null;
    isLoading: boolean;
    error: string | null;
    typingStates: Record<string, string[]>;
}

const initialState: DialoguesState = {
    dialoguesList: [],
    currentChatGroupId: null,
    lastReceivedMessage: null,
    isLoading: false,
    error: null,
    typingStates: {},
};

export const fetchDialogues = createAsyncThunk(
    'dialogues/fetchDialogues',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getDialogues(1, 50);
            const rawData = response.data?.data || response.data || [];

            const normalizedData = Array.isArray(rawData) ? rawData.map((d: any) => {
                if (d.last_message) {
                    const lm = d.last_message;
                    const owner = lm.owner || lm.user;
                    const msgOwnerId = String(lm.owner_id || owner?.id || '');
                    const msgUser = {
                        _id: msgOwnerId,
                        name: owner?.name || lm.sender_name || 'User',
                        avatar: owner?.avatar?.preview_url || lm.sender_avatar?.preview_url
                    };
                    d.last_message = {
                        ...lm,
                        text: lm.message || lm.text || '',
                        user: msgUser,
                        owner_id: msgOwnerId,
                        is_system: !!lm.is_system
                    };
                }
                return d;
            }) : [];
            return normalizedData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const dialoguesSlice = createSlice({
    name: 'dialogues',
    initialState,
    reducers: {
        setCurrentChatGroupId(state, action: PayloadAction<string | null>) {
            state.currentChatGroupId = action.payload;
            if (action.payload) {
                const dialogue = state.dialoguesList.find(d => String(d.id) === String(action.payload));
                if (dialogue) dialogue.unread_count = 0;
            }
        },
        clearCurrentChatGroupId(state) {
            state.currentChatGroupId = null;
        },
        setDialogueTyping(state, action: PayloadAction<{ groupId: string; userId: string; isTyping: boolean }>) {
            const groupId = String(action.payload.groupId);
            const userId = String(action.payload.userId);
            const isTyping = action.payload.isTyping;

            if (!state.typingStates[groupId]) state.typingStates[groupId] = [];

            if (isTyping) {
                if (!state.typingStates[groupId].includes(userId)) state.typingStates[groupId].push(userId);
            } else {
                state.typingStates[groupId] = state.typingStates[groupId].filter(id => id !== userId);
            }
        },
        clearTypingForUserInGroup(state, action: PayloadAction<{ groupId: string; userId: string }>) {
            const groupId = String(action.payload.groupId);
            const userId = String(action.payload.userId);

            if (state.typingStates[groupId]) {
                state.typingStates[groupId] = state.typingStates[groupId].filter(id => id !== userId);
            }
        },
        updateDialogueFromWs(state, action: PayloadAction<any>) {
            const message = action.payload;
            if (!message || !message.chat_group_id) return;

            const groupId = String(message.chat_group_id);
            const myId = String(message.currentUserIdInApp || '');
            const owner = message.owner || message.user;
            const msgOwnerId = String(message.owner_id || message.sender_id || owner?.id || '');

            const msgUser = {
                _id: msgOwnerId,
                name: owner?.name || message.sender_name || 'User',
                avatar: owner?.avatar?.preview_url || message.user?.avatar || message.sender_avatar
            };

            const newMessageObj: Message = {
                id: message.id,
                // --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Убрали (message.gallery?.length ? '📷 Фото' : '') ---
                text: message.message || message.text || '',
                createdAt: message.createdAt || message.created_at || new Date().toISOString(),
                user: msgUser,
                chat_group_id: groupId,
                owner_id: msgOwnerId,
                read: false,
                is_system: !!message.is_system,
                gallery: message.gallery || [],
                _receiveTimestamp: Date.now(),
                tempId: message.tempId
            };

            state.lastReceivedMessage = newMessageObj;

            const index = state.dialoguesList.findIndex(d => String(d.id) === groupId);
            if (index !== -1) {
                const dialogue = state.dialoguesList[index];
                dialogue.last_message = newMessageObj;
                dialogue.last_message_at = newMessageObj.createdAt;

                if (msgOwnerId !== myId && state.currentChatGroupId !== groupId) {
                    dialogue.unread_count = (dialogue.unread_count || 0) + 1;
                } else if (state.currentChatGroupId === groupId) {
                    dialogue.unread_count = 0;
                }
                state.dialoguesList.splice(index, 1);
                state.dialoguesList.unshift(dialogue);
            }
        },
        markDialogueAsReadOptimistic(state, action: PayloadAction<string>) {
            const groupId = action.payload;
            const dialogue = state.dialoguesList.find(d => String(d.id) === groupId);
            if (dialogue) dialogue.unread_count = 0;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDialogues.fulfilled, (state, action) => {
            state.dialoguesList = action.payload;
            state.isLoading = false;
        });
        builder.addCase(fetchDialogues.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchDialogues.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

export const {
    setCurrentChatGroupId,
    clearCurrentChatGroupId,
    setDialogueTyping,
    clearTypingForUserInGroup,
    updateDialogueFromWs,
    markDialogueAsReadOptimistic
} = dialoguesSlice.actions;

export default dialoguesSlice.reducer;