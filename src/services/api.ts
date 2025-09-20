// --- File: services/api.ts ---
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'; // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
import { config as appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

export interface User {
    id: string | number;
    name?: string;
    first_name?: string;
    email?: string;
    avatar?: { data?: { preview_url?: string } };
    isSitter?: boolean;
    roles?: string[];
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError) => {
        if (error.response) {
            console.error('API Error Response:', error.response.data);
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new CustomEvent('authError401'));
            }
        } else if (error.request) {
            console.error('API No Response (Network Error):', error.request);
        } else {
            console.error('API Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export interface CheckContactPayload {
    phone?: string;
    email?: string;
}

export interface CheckContactResponse {
    exists: boolean;
    message?: string;
}

export interface SendOtpPayload {
    phone?: string;
    email?: string;
    operation: 'register' | 'reset';
}

export interface SendOtpResponse {
    data?: {
        code?: number;
        message: string;
    };
    success?: boolean;
    message?: string;
}

export interface CheckOtpPayload {
    phone?: string;
    email?: string;
    code: string;
    operation: 'register' | 'reset';
}

export interface CheckOtpResponse {
    success: boolean;
    message?: string;
}

export interface RegistrationPayload {
    first_name?: string;
    fullName?: string;
    password?: string;
    password_confirmation?: string;
    email?: string;
    phone?: string;
    code: string;
    timezone?: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    registration_type?: 'client' | 'sitter';
}

export interface AuthApiResponse {
    data?: User;
    user?: User;
    accessToken: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
}

export interface LoginPayload {
    email?: string;
    phone?: string;
    password?: string;
    code?: string;
}

const mapAuthResponse = (responseData: any): AuthApiResponse => {
    let user: User | undefined;
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (responseData.data && responseData.data.object === "User") {
        user = responseData.data as User;
    } else if (responseData.user && typeof responseData.user === 'object') {
        user = responseData.user as User;
    } else if (responseData.data && typeof responseData.data === 'object' && responseData.data !== null && !responseData.data.object) {
        user = responseData.data as User;
    } else if (typeof responseData === 'object' && responseData !== null && responseData.id) {
        user = responseData as User;
    } else {
        console.warn("User data structure in API response is not as expected in mapAuthResponse.", responseData);
        user = (responseData && responseData.id) ? responseData as User : undefined;
    }

    if (responseData.accessToken) {
        accessToken = responseData.accessToken;
    } else if (responseData.access_token) {
        accessToken = responseData.access_token;
    } else if (responseData.meta?.token) {
        accessToken = responseData.meta.token;
    } else if (responseData.meta?.custom?.token) {
        accessToken = responseData.meta.custom.token;
    }

    if (responseData.refreshToken) {
        refreshToken = responseData.refreshToken;
    } else if (responseData.refresh_token) {
        refreshToken = responseData.refresh_token;
    } else if (responseData.meta?.custom?.refreshToken) {
        refreshToken = responseData.meta.custom.refreshToken;
    }

    if (!accessToken) {
        console.error("Access token not found in API response after mapping:", responseData);
        throw new Error("Access token missing in authentication response");
    }
    if (!user) {
        console.error("User data not found in API response after mapping:", responseData);
        user = { id: 'unknown_user', name: 'Unknown User' };
    }

    return { data: user, user, accessToken, refreshToken };
};

export const checkPhoneExists = async (payload: CheckContactPayload): Promise<CheckContactResponse> => {
    const response = await apiClient.post<CheckContactResponse>('/check/user', payload);
    return response.data;
};

export const sendOtpCode = async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    const endpoint = payload.operation === 'register' ? '/code' : '/code/reset';
    const apiPayload: any = {};
    if (payload.phone) apiPayload.phone = payload.phone;
    if (payload.email) apiPayload.email = payload.email;
    const response = await apiClient.post<SendOtpResponse>(endpoint, apiPayload);
    if (response.data && response.data.data && response.data.data.message) {
        return { success: true, message: response.data.data.message, data: response.data.data };
    } else if (response.data && response.data.message && response.data.success !== undefined) {
        return { ...response.data };
    } else if (response.data && response.data.message) {
        return { success: true, ...response.data };
    }
    return response.data;
};

export const checkOtpCode = async (payload: CheckOtpPayload): Promise<CheckOtpResponse> => {
    const endpoint = payload.operation === 'register' ? '/code/check' : '/code/reset/check';
    const apiPayload: any = { code: payload.code };
    if (payload.phone) apiPayload.phone = payload.phone;
    if (payload.email) apiPayload.email = payload.email;
    const response = await apiClient.post<CheckOtpResponse>(endpoint, apiPayload);
    return response.data;
};

export const registerUser = async (data: RegistrationPayload): Promise<AuthApiResponse> => {
    const payload: any = { ...data };
    if (data.fullName && !data.first_name) {
        payload.first_name = data.fullName.split(' ')[0];
        if (data.fullName.split(' ').length > 1) {
            payload.last_name = data.fullName.split(' ').slice(1).join(' ');
        }
        delete payload.fullName;
    }
    const response = await apiClient.post<any>('/register', payload);
    return mapAuthResponse(response.data);
};

export const loginUser = async (credentials: LoginPayload): Promise<AuthApiResponse> => {
    const response = await apiClient.post<any>('/login', credentials);
    return mapAuthResponse(response.data);
};

export const loginWithGoogleApi = async (idToken: string): Promise<AuthApiResponse> => {
    const response = await apiClient.post<any>('/auth/google', { access_token: idToken });
    return mapAuthResponse(response.data);
};

export const loginWithAppleApi = async (appleAuthData: { identityToken: string; user?: string; email?: string; fullName?: { givenName?: string; familyName?: string; } }): Promise<AuthApiResponse> => {
    const payload = {
        identity_token: appleAuthData.identityToken,
        user_identifier: appleAuthData.user,
        email: appleAuthData.email,
        first_name: appleAuthData.fullName?.givenName,
        last_name: appleAuthData.fullName?.familyName
    };
    const response = await apiClient.post<any>('/auth/apple', payload);
    return mapAuthResponse(response.data);
};

export const fetchUserProfile = async (): Promise<User> => {
    const response = await apiClient.get<AuthApiResponse>('/user/profile');
    const user = response.data.user || response.data.data;
    if (!user) {
        throw new Error("User data not found in profile response");
    }
    return user;
};

export const fetchAddressSuggestions = async (query: string): Promise<string[]> => {
    if (!query.trim()) return Promise.resolve([]);
    try {
        const response = await apiClient.get<string[]>('/address/suggest', { params: { query } });
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error fetching address suggestions:', error.message);
        } else {
            console.error('Unexpected error fetching address suggestions:', error);
        }
        throw error;
    }
};

export default apiClient;