// src/store/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getPaymentMethods } from '../../services/api';
import { RootState } from '../index';

interface PaymentState {
    methods: any[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null; // Чтобы не запрашивать слишком часто
}

const initialState: PaymentState = {
    methods: [],
    isLoading: false,
    error: null,
    lastFetched: null,
};

// Асинхронный экшен для загрузки карт
export const fetchPaymentMethodsAction = createAsyncThunk(
    'payment/fetchMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getPaymentMethods();
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка загрузки карт');
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        // Экшен для очистки карт при выходе из аккаунта
        clearPaymentMethods(state) {
            state.methods = [];
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentMethodsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentMethodsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.methods = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchPaymentMethodsAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPaymentMethods } = paymentSlice.actions;

// Селектор для получения карт (активных)
export const selectActivePaymentMethods = (state: RootState) =>
    state.payment.methods.filter((m: any) => m.status === 'active');

export default paymentSlice.reducer;