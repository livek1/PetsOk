// --- File: src/store/slices/configSlice.ts ---
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchAppConfiguration, AppConfigData } from '../../services/api';

interface ConfigState {
    headers: Record<string, string>;
    maintenance: {
        enabled: boolean;
        message: string;
    };
    versionConfig: any | null;
    activeServices: string[];
    headerMessages: string[];
    systemMessages: any[];
    isConfigLoaded: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: ConfigState = {
    headers: {},
    maintenance: {
        enabled: false,
        message: ''
    },
    versionConfig: null,
    activeServices: [],
    headerMessages: [],
    systemMessages: [],
    isConfigLoaded: false,
    loading: false,
    error: null,
};

export const loadAppConfig = createAsyncThunk<AppConfigData, void, { rejectValue: string }>(
    'config/loadAppConfig',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchAppConfiguration();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch config');
        }
    }
);

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        updateHeaders(state, action: PayloadAction<Record<string, string>>) {
            state.headers = { ...state.headers, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAppConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadAppConfig.fulfilled, (state, action) => {
                const data = action.payload;
                state.loading = false;
                state.isConfigLoaded = true;

                // 1. Хедеры
                if (data.custom_headers) {
                    state.headers = { ...state.headers, ...data.custom_headers };
                }

                // 2. Основные настройки
                state.maintenance = data.maintenance || { enabled: false, message: '' };
                state.versionConfig = data.versions || null;

                // 3. Активные услуги
                state.activeServices = data.features?.active_services || [];

                // 4. UI Тексты
                state.headerMessages = data.ui?.header_messages || [];

                // 5. Системные сообщения
                state.systemMessages = data.messages || [];
            })
            .addCase(loadAppConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
                // При ошибке считаем конфиг загруженным (чтобы показать дефолт или ошибку)
                state.isConfigLoaded = true;
            });
    },
});

export const { updateHeaders } = configSlice.actions;
export default configSlice.reducer;