// --- File: src/store/slices/websocketSlice.ts ---
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebsocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

const initialState: WebsocketState = {
    isConnected: false,
    isConnecting: false,
    error: null,
};

const websocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        websocketStateChange(state, action: PayloadAction<{ connected?: boolean; connecting?: boolean; error?: string | null }>) {
            if (action.payload.connected !== undefined) state.isConnected = action.payload.connected;
            if (action.payload.connecting !== undefined) state.isConnecting = action.payload.connecting;
            if (action.payload.error !== undefined) state.error = action.payload.error;
        }
    }
});

export const { websocketStateChange } = websocketSlice.actions;
export default websocketSlice.reducer;