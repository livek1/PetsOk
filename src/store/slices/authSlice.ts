// --- File: src/store/slices/authSlice.ts ---
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import {
    registerUser as registerUserApi,
    loginUser as loginUserApi,
    fetchUserProfile as fetchUserProfileApi,
    checkPhoneExists as checkContactExistsApi,
    sendOtpCode as sendOtpCodeApi,
    checkOtpCode as checkOtpCodeApi,
    loginWithGoogleApi,
    loginWithAppleApi,
    CheckContactPayload,
    CheckContactResponse,
    SendOtpPayload,
    SendOtpResponse,
    CheckOtpPayload,
    CheckOtpResponse,
    AuthApiResponse,
    RegistrationPayload,
    LoginPayload,
    User
} from '../../services/api';
import { RootState } from '../index';

// --- ИМПОРТЫ ДЛЯ ПОЛНОГО ВЫХОДА ---
import { clearPaymentMethods } from './paymentSlice';
import { resetDialogues } from './dialoguesSlice';
import { WEBSOCKET_DISCONNECT } from '../middleware/websocketMiddleware';
// ----------------------------------

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    status: 'idle' | 'checking_contact' | 'contact_exists' | 'contact_new' |
    'otp_sending' | 'otp_sent' | 'otp_verifying' | 'otp_verified_register' | 'otp_verified_reset' |
    'registering' | 'logging_in' | 'succeeded' | 'failed' | 'resetting_password';
    error: string | null;
    contactCheckError: string | null;
    otpError: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('authToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('authToken'),
    isLoading: false,
    status: 'idle',
    error: null,
    contactCheckError: null,
    otpError: null,
};

interface RegisterThunkArg {
    registrationData: Omit<RegistrationPayload, 'source' | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content'>;
    registrationType: 'client' | 'sitter';
}

interface CheckContactThunkArg { contactValue: string; contactType: 'phone' | 'email'; }
interface SendOtpThunkArg { contactValue: string; contactType: 'phone' | 'email'; operation: 'register' | 'reset'; }
interface VerifyOtpThunkArg { contactValue: string; contactType: 'phone' | 'email'; code: string; operation: 'register' | 'reset'; }

const fetchProfileAfterAuth = async (authResponse: AuthApiResponse) => {
    localStorage.setItem('authToken', authResponse.accessToken);
    if (authResponse.refreshToken) {
        localStorage.setItem('refreshToken', authResponse.refreshToken);
    }

    try {
        const userProfile = await fetchUserProfileApi();
        return { ...authResponse, user: userProfile, data: userProfile };
    } catch (e) {
        console.error("Failed to fetch profile immediately after auth", e);
        return authResponse;
    }
};

// --- НОВЫЙ THUNK ДЛЯ ПОЛНОГО ВЫХОДА ИЗ СИСТЕМЫ ---
export const logoutUser = createAsyncThunk<void, void, { state: RootState }>(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        // 1. Отключаем веб-сокеты (чтобы не приходили новые события)
        dispatch({ type: WEBSOCKET_DISCONNECT });

        // 2. Очищаем данные других слайсов
        dispatch(clearPaymentMethods());
        dispatch(resetDialogues());

        // 3. Выполняем синхронный выход (чистит auth slice)
        dispatch(logout());

        // 4. Гарантированно очищаем localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');

        // 5. Опционально: небольшая задержка, чтобы React успел обработать изменения стейта
        // перед тем как navigate сработает в компоненте
        await new Promise(resolve => setTimeout(resolve, 50));
    }
);
// ---------------------------------------------------


export const checkContactExists = createAsyncThunk<CheckContactResponse, CheckContactThunkArg, { rejectValue: string }>(
    'auth/checkContactExists', async (payload, { rejectWithValue }) => {
        try {
            const apiPayload: CheckContactPayload = payload.contactType === 'phone' ? { phone: payload.contactValue } : { email: payload.contactValue };
            return await checkContactExistsApi(apiPayload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to check contact');
        }
    }
);

export const sendOtp = createAsyncThunk<SendOtpResponse, SendOtpThunkArg, { rejectValue: string }>(
    'auth/sendOtp', async (payload, { rejectWithValue }) => {
        try {
            const contactApiPayload: CheckContactPayload = payload.contactType === 'phone' ? { phone: payload.contactValue } : { email: payload.contactValue };
            const apiPayload: SendOtpPayload = { ...contactApiPayload, operation: payload.operation };
            return await sendOtpCodeApi(apiPayload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send OTP');
        }
    }
);

export const verifyOtp = createAsyncThunk<CheckOtpResponse, VerifyOtpThunkArg, { rejectValue: string }>(
    'auth/verifyOtp', async (payload, { rejectWithValue }) => {
        try {
            const contactApiPayload: CheckContactPayload = payload.contactType === 'phone' ? { phone: payload.contactValue } : { email: payload.contactValue };
            const apiPayload: CheckOtpPayload = { ...contactApiPayload, code: payload.code, operation: payload.operation };
            return await checkOtpCodeApi(apiPayload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Invalid OTP code');
        }
    }
);

export const register = createAsyncThunk<AuthApiResponse, RegisterThunkArg, { rejectValue: string }>(
    'auth/register', async ({ registrationData, registrationType }, { rejectWithValue }) => {
        try {
            const augmentedPayload: RegistrationPayload = {
                ...registrationData,
                source: 'website',
                registration_type: registrationType,
            };

            const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            utmParams.forEach(param => {
                const value = Cookies.get(param);
                if (value) {
                    (augmentedPayload as any)[param] = value;
                }
            });

            const response = await registerUserApi(augmentedPayload);
            return await fetchProfileAfterAuth(response);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
        }
    }
);

export const login = createAsyncThunk<AuthApiResponse, LoginPayload, { rejectValue: string }>(
    'auth/login', async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginUserApi(credentials);
            return await fetchProfileAfterAuth(response);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const loginWithGoogle = createAsyncThunk<AuthApiResponse, { idToken: string }, { rejectValue: string }>(
    'auth/loginWithGoogle', async (payload, { rejectWithValue }) => {
        try {
            const response = await loginWithGoogleApi(payload.idToken);
            return await fetchProfileAfterAuth(response);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Google login failed');
        }
    }
);

export const loginWithApple = createAsyncThunk<AuthApiResponse, { appleAuthData: any }, { rejectValue: string }>(
    'auth/loginWithApple', async (payload, { rejectWithValue }) => {
        try {
            const response = await loginWithAppleApi(payload.appleAuthData);
            return await fetchProfileAfterAuth(response);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Apple login failed');
        }
    }
);

export const loadUser = createAsyncThunk<User, void, { rejectValue: string; state: RootState }>(
    'auth/loadUser', async (_, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        if (!token) return rejectWithValue('No token found');
        try {
            return await fetchUserProfileApi();
        } catch (error: any) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            return rejectWithValue(error.response?.data?.message || 'Failed to load user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null; state.token = null; state.refreshToken = null; state.isAuthenticated = false;
            state.isLoading = false; state.status = 'idle'; state.error = null;
            state.contactCheckError = null; state.otpError = null;
            localStorage.removeItem('authToken'); localStorage.removeItem('refreshToken');
        },
        clearAuthErrors: (state) => {
            state.error = null; state.contactCheckError = null; state.otpError = null;
        },
        resetAuthFlow: (state) => {
            state.status = 'idle'; state.contactCheckError = null; state.otpError = null;
            state.error = null; state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        const handlePending = (state: AuthState, actionMetaArgStatus?: AuthState['status']) => {
            state.isLoading = true; if (actionMetaArgStatus) state.status = actionMetaArgStatus;
            state.contactCheckError = null; state.otpError = null; state.error = null;
        };
        const handleAuthFulfilled = (state: AuthState, action: PayloadAction<AuthApiResponse>) => {
            state.isLoading = false; state.status = 'succeeded'; state.isAuthenticated = true;

            const userDataFromApi = action.payload.user || action.payload.data;

            if (userDataFromApi) {
                state.user = {
                    ...userDataFromApi,
                    isSitter: userDataFromApi.roles?.includes('sitter') || userDataFromApi.roles?.includes('admin') || userDataFromApi.isSitter
                };
            } else {
                state.user = null;
                console.warn("User data was still null in fulfilled auth action payload (fetch failed?).");
            }
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken || null;
            state.error = null;
        };
        const handleAuthRejected = (state: AuthState, action: PayloadAction<any>) => {
            state.isLoading = false; state.status = 'failed'; state.error = action.payload ?? 'An unknown error occurred';
        };

        builder.addCase(checkContactExists.pending, (state) => handlePending(state, 'checking_contact')).addCase(checkContactExists.fulfilled, (state, action) => { state.isLoading = false; state.status = action.payload.exists ? 'contact_exists' : 'contact_new'; }).addCase(checkContactExists.rejected, (state, action) => { state.isLoading = false; state.status = 'failed'; state.contactCheckError = action.payload ?? 'An unknown error occurred'; });
        builder.addCase(sendOtp.pending, (state) => handlePending(state, 'otp_sending')).addCase(sendOtp.fulfilled, (state, action) => { state.isLoading = false; if (action.payload.data?.code === 200 || action.payload.success === true) { state.status = 'otp_sent'; } else { state.status = 'failed'; state.otpError = action.payload.message || action.payload.data?.message || 'Failed to send OTP'; } }).addCase(sendOtp.rejected, (state, action) => { state.isLoading = false; state.status = 'failed'; state.otpError = action.payload ?? 'An unknown error occurred'; });
        builder.addCase(verifyOtp.pending, (state) => handlePending(state, 'otp_verifying')).addCase(verifyOtp.fulfilled, (state, action) => { state.isLoading = false; state.status = action.payload.success ? (action.meta.arg.operation === 'register' ? 'otp_verified_register' : 'otp_verified_reset') : 'failed'; if (!action.payload.success) { state.otpError = action.payload.message || 'Invalid OTP code'; } }).addCase(verifyOtp.rejected, (state, action) => { state.isLoading = false; state.status = 'failed'; state.otpError = action.payload ?? 'An unknown error occurred'; });

        [register, login, loginWithGoogle, loginWithApple].forEach(thunk => {
            builder.addCase(thunk.pending, (state) => {
                let currentStatus: AuthState['status'] = 'logging_in';
                if (thunk.typePrefix === register.typePrefix) currentStatus = 'registering';
                handlePending(state, currentStatus);
            });
            builder.addCase(thunk.fulfilled, handleAuthFulfilled);
            builder.addCase(thunk.rejected, handleAuthRejected);
        });

        builder.addCase(loadUser.pending, (state) => { state.isLoading = true; }).addCase(loadUser.fulfilled, (state, action) => { state.isLoading = false; state.isAuthenticated = true; state.user = { ...action.payload, isSitter: action.payload.roles?.includes('sitter') || action.payload.roles?.includes('admin') || action.payload.isSitter }; }).addCase(loadUser.rejected, (state, action) => { state.isLoading = false; state.isAuthenticated = false; state.user = null; state.token = null; state.refreshToken = null; console.warn('AuthSlice: Load user rejected - ', action.payload); });
    },
});

export const { logout, clearAuthErrors, resetAuthFlow } = authSlice.actions;
export default authSlice.reducer;