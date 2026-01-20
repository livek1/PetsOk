import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { config as appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

// --- Interfaces ---
export interface User {
    id: string | number;
    name?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    birth?: string;
    gender?: number | string;
    avatar?: { data?: { preview_url?: string; url?: string } };
    isSitter?: boolean;
    roles?: string[];
    currency_symbol?: string;
    address?: string;
    address_q?: string;
    address_details?: string;
    additional_contact_name?: string;
    additional_contact_phone?: string;
    timezone?: string;
    [key: string]: any;
}

export interface Breed {
    id: number;
    name: string;
}

export interface PetFile {
    id: number;
    url: string;
    preview_url?: string;
    type?: string;
}

export interface Pet {
    id: number;
    name: string;
    type_id?: number;
    type?: { data: { id: number; name: string } };
    breed_id?: number;
    breed?: { data: Breed };
    gender: number | string;
    year?: number;
    month?: number;
    size_id?: number;
    size?: { data: { name: string; id?: number } };
    sterilized?: number;
    vaccinated?: number;
    staying_home_alone?: number;
    kids_friendly?: number;
    dogs_friendly?: number;
    cats_friendly?: number;
    info_for_sitting?: string;
    info_for_walking?: string;
    avatar_id?: number;
    avatar?: { data: PetFile };
    files?: { data: PetFile[] };
    media?: { data: PetFile[] };
    gender_value?: string;
    sterilized_value?: number;
    vaccinated_value?: number;
    staying_home_alone_value?: number;
    kids_friendly_value?: number;
    dogs_friendly_value?: number;
    cats_friendly_value?: number;
}

export interface SitterProfileResponse {
    id: number | string;
    user_id: number | string;
    name: string;
    title: string;
    description: string;
    latitude?: number;
    longitude?: number;
    user_rating: number;
    reviews_count: number;
    currency_symbol: string;
    city?: { name: string };
    country?: { name: string } | string;
    avatar?: { data?: { url?: string; preview_url?: string } };
    media?: { data?: Array<{ id: number; url: string; preview_url?: string; media_type?: string }> };
    pets?: { data?: Array<Pet> };
    worker_services?: { data?: Array<{ is_active: boolean; service_key: string; price_per_unit: number }> };
    [key: string]: any;
}

// --- Auth Types ---
export interface CheckContactPayload { phone?: string; email?: string; }
export interface CheckContactResponse { exists: boolean; message?: string; }
export interface SendOtpPayload { phone?: string; email?: string; operation: 'register' | 'reset'; }
export interface SendOtpResponse { data?: { code?: number; message: string; }; success?: boolean; message?: string; }
export interface CheckOtpPayload { phone?: string; email?: string; code: string; operation: 'register' | 'reset'; }
export interface CheckOtpResponse { success: boolean; message?: string; }
export interface LoginPayload { email?: string; phone?: string; password?: string; code?: string; }
export interface AuthApiResponse {
    data?: User;
    user?: User;
    accessToken: string;
    refreshToken?: string;
    message?: string;
    status?: string;
    errors?: Record<string, string[]>;
}

export interface RegistrationPayload {
    first_name?: string;
    fullName?: string;
    password?: string;
    password_confirmation?: string;
    email?: string;
    phone?: string;
    code?: string;
    timezone?: string;
    source?: string;
    registration_type?: 'client' | 'sitter';
    [key: string]: any;
}

// --- Subscription Payload Interface (НОВОЕ) ---
export interface CreateSubscriptionPayload {
    plan_id: string | number;
    promo_code?: string;
    save_new_card?: boolean;
    payment_method_id?: number | null;
    return_url_mobile?: string;
    [key: string]: any;
}

export interface AppConfigData {
    maintenance?: { enabled: boolean; message: string; };
    versions?: any;
    features?: { active_services?: string[]; };
    ui?: { header_messages?: string[]; };
    messages?: any[];
    custom_headers?: Record<string, string>;
}
export interface SearchParams {
    service_key?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    sw_lat?: number;
    sw_lon?: number;
    ne_lat?: number;
    ne_lon?: number;
    limit?: number;
    searchReason?: 'initial' | 'city' | 'coordinates' | 'map_bounds';
    pet_type_ids?: number[];
    dog_size_ids?: number[];
    cat_size_ids?: number[];
    role_id?: number;
    [key: string]: any;
}

// --- API Client Setup ---

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
    (error: any) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new CustomEvent('authError401'));
            }
        }
        return Promise.reject(error);
    }
);

// --- Auth Helper ---
const mapAuthResponse = (responseData: any): AuthApiResponse => {
    let user: User | undefined;
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (responseData.data && responseData.data.object === "User") {
        user = responseData.data as User;
    } else if (responseData.user && typeof responseData.user === 'object') {
        user = responseData.user as User;
    } else if (responseData.data && typeof responseData.data === 'object') {
        if (responseData.data.id || responseData.data.email) user = responseData.data as User;
    }

    if (responseData.accessToken) accessToken = responseData.accessToken;
    else if (responseData.access_token) accessToken = responseData.access_token;
    else if (responseData.meta?.token) accessToken = responseData.meta.token;

    if (responseData.refreshToken) refreshToken = responseData.refreshToken;
    else if (responseData.refresh_token) refreshToken = responseData.refresh_token;

    if (!accessToken) throw new Error("Access token missing in API response");

    return { data: user, user, accessToken, refreshToken };
};


// ==========================================
// API CALLS
// ==========================================

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

export const loginWithAppleApi = async (appleAuthData: any): Promise<AuthApiResponse> => {
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
    const user = response.data.user || response.data.data || (response.data as unknown as User);
    if (!user || !user.id) throw new Error("User data not found");
    return user;
};

export const updateUser = async (userData: Partial<User> & { avatar?: File | null }): Promise<AuthApiResponse> => {
    const formData = new FormData();
    const fields = ['first_name', 'last_name', 'gender', 'birth', 'phone', 'address_q', 'address_details', 'additional_contact_name', 'additional_contact_phone', 'timezone'];
    fields.forEach(field => {
        if (userData[field] !== undefined) formData.append(field, String(userData[field]));
    });
    formData.append('_method', 'put');
    if (userData.avatar instanceof File) {
        formData.append('avatar', userData.avatar);
    }
    const response = await apiClient.post<AuthApiResponse>('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const requestAccountDeletion = async (): Promise<{ status: number; data: any }> => {
    const response = await apiClient.post('/me/account/request-deletion');
    return { status: response.status, data: response.data };
};

export const fetchAppConfiguration = async (): Promise<AppConfigData> => {
    try {
        const response = await apiClient.get<{ data: AppConfigData }>('/config');
        return response.data.data;
    } catch (error) {
        console.error('Config fetch failed', error);
        throw error;
    }
};

export const getMyPets = async (): Promise<Pet[]> => {
    const response = await apiClient.get<{ data: Pet[] }>('/pets?include=avatar,files,breed,type,size');
    return response.data.data;
};

export const getPetById = async (id: string | number): Promise<Pet> => {
    const response = await apiClient.get<{ data: Pet }>(`/pets/${id}?include=avatar,files,breed,type,size`);
    return response.data.data;
};

export const fetchBreeds = async (query: string, typeId: number): Promise<Breed[]> => {
    const response = await apiClient.get<{ data: Breed[] }>('/pets/breeds', { params: { q: query, type_id: typeId } });
    return response.data.data;
};

export const createPet = async (petData: any, files: File[]): Promise<Pet> => {
    const response = await apiClient.post<{ data: Pet }>('/pets', petData);
    const newPet = response.data.data;
    if (files.length > 0 && newPet.id) {
        await uploadPetMedia(newPet.id, files);
        return getPetById(newPet.id);
    }
    return newPet;
};

export const updatePet = async (id: string | number, petData: any, newFiles: File[]): Promise<Pet> => {
    await apiClient.post(`/pets/${id}`, { ...petData, _method: 'PATCH' });
    if (newFiles.length > 0) {
        await uploadPetMedia(id, newFiles);
    }
    return getPetById(id);
};

export const deletePet = async (id: string | number): Promise<void> => {
    await apiClient.delete(`/pets/${id}`);
};

export const uploadPetMedia = async (petId: string | number, files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`files[${index}]`, file));
    await apiClient.post(`/pets/photos/${petId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteFile = async (fileId: string | number): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
};

export const setPetAvatar = async (petId: string | number, fileId: number): Promise<void> => {
    await apiClient.post(`/pets/${petId}`, { avatar_id: fileId, _method: 'PATCH' });
};

export const searchSitterFetch = async ({ searchParams, page }: { searchParams: SearchParams; page?: number }) => {
    let url = '/filtered/users';
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (searchParams?.limit) params.append('limit', searchParams.limit.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const body = { ...searchParams };
    const reason = body.searchReason;

    if (body.address) body.city = body.address;
    if (reason === 'map_bounds' && body.sw_lat && body.ne_lat) {
        delete body.city; delete body.address; delete body.latitude; delete body.longitude; delete body.radius_km;
    } else if ((reason === 'city' || reason === 'initial') && body.city) {
        delete body.latitude; delete body.longitude; delete body.radius_km; delete body.sw_lat; delete body.sw_lon; delete body.ne_lat; delete body.ne_lon;
    } else if (reason === 'coordinates' && body.latitude && body.longitude) {
        delete body.city; delete body.address; delete body.sw_lat; delete body.sw_lon; delete body.ne_lat; delete body.ne_lon;
        if (!body.radius_km) body.radius_km = 30;
    }

    delete body.searchReason; delete body.address; delete body.addressPoint;
    delete body.latitudeDelta; delete body.longitudeDelta; delete body.role_id; delete body.limit;

    body.pet_type_ids = body.pet_type_ids || [];
    body.dog_size_ids = body.dog_size_ids || [];
    body.cat_size_ids = body.cat_size_ids || [];

    try {
        const response = await apiClient.post(url, body);
        return { status: 'success', data: response.data };
    } catch (error: any) {
        return { status: 'error', message: error.message, data: null };
    }
};

export const fetchAddressSuggestions = async (query: string): Promise<string[]> => {
    if (!query.trim()) return Promise.resolve([]);
    try {
        const response = await apiClient.get<string[]>('/address/suggest', { params: { query } });
        return response.data;
    } catch (error) {
        return [];
    }
};

export const getSitterProfile = async (id: string): Promise<SitterProfileResponse> => {
    const response = await apiClient.get<SitterProfileResponse>(`/sitters/${id}`);
    return response.data;
};

// ... Worker application methods ...
export const getWorkerStatus = async () => (await apiClient.get('/worker/application/status')).data;
export const getAvailableCountries = async () => (await apiClient.get('/worker/available-countries')).data;
export const getAvailableCities = async (countryId: number | string) => (await apiClient.get(`/worker/available-cities?country_id=${countryId}`)).data;
export const createWorkerRequest = async (payload: any) => (await apiClient.post('/worker/create', payload)).data;
export const submitKycProfile = async (formData: FormData) => (await apiClient.post('/worker/profile/submit-kyc', formData, { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => data })).data;
export const getRequiredTests = async () => (await apiClient.get('/worker/application/required-tests')).data;
export const getTestStructure = async (testId: string, includes: string[] = []) => (await apiClient.get(`/worker/application/test-structure?test_id=${testId}&include=${includes.join(',')}`)).data;
export const submitTestAnswers = async (payload: { test_id: number; answers: any[] }) => (await apiClient.post('/worker/application/test/submit-answers', payload)).data;
export const getWorkerAvailableServices = async () => (await apiClient.get('/worker/available-services')).data;
export const createWorkerRequestSetting = async (payload: { services: any[] }) => (await apiClient.post('/worker/settings/submit', payload)).data;
export const createAdditionalWorkerProfile = async (profileData: any, files: File[]) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => { if (profileData[key] !== undefined && profileData[key] !== null) formData.append(key, String(profileData[key])); });
    files.forEach((file, index) => formData.append(`files[${index}]`, file));
    return (await apiClient.post('/worker/additional-profile/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => data })).data;
};

export const checkPromoCodeAPI = async (promoData: { code: string }) => {
    const response = await apiClient.post('/promo/check', promoData);
    return response.data;
};

export const createOrder = async (orderData: any) => (await apiClient.post('/orders', orderData)).data;
export const getMyOrders = async (page = 1, params: any = {}) => (await apiClient.get('/orders/my/client', { params: { page, include: params.include || 'client,promo_code,client_review,worker_review,payments,requests,dog_walk_logs,billing_periods', ...params } })).data;
export const getOrderDetails = async (orderId: string, includes?: string) => (await apiClient.get(`/orders/id/${orderId}${includes ? `?include=${includes}` : ''}`)).data;
export const cancelOrder = async (orderId: string, cancelData: { reason: string }) => (await apiClient.delete(`/orders/${orderId}`, { data: cancelData })).data;
export const cancelClientFutureRecurring = async (orderId: string) => (await apiClient.post(`/orders/${orderId}/recurring/cancel-future`)).data;
export const fetchUserBalance = async () => (await apiClient.get('/balance')).data;
export const getPaymentMethods = async () => (await apiClient.get('/payment-methods')).data;
export const getVerificationUrl = async (payload: { return_url_mobile_base?: string; currency_code?: string }) => (await apiClient.post('/payment-methods/verification-url', payload)).data;
export const setDefaultPaymentMethod = async (id: number) => (await apiClient.post(`/payment-methods/${id}/default`)).data;

// --- ИЗМЕНЕНО: Добавлен аргумент returnUrl ---
export const initiateOrderPayment = async (
    orderId: string | number,
    paymentMethodId: number | null,
    useBalance: boolean,
    saveNewCard: boolean = true,
    returnUrl: string | null = null
) => (await apiClient.post(`/orders/${orderId}/initiate-payment`, {
    payment_method_id: paymentMethodId,
    save_new_card: saveNewCard,
    use_balance: useBalance,
    return_url_mobile: returnUrl
})).data;

export const getSubscriptionPlans = async (params: any = {}) => { const response = await apiClient.get('/subscriptions/available', { params }); return { data: response.data.data || response.data }; };

// --- ИЗМЕНЕНО: createSubscription теперь принимает типизированный payload с новыми полями ---
export const createSubscription = async (payload: CreateSubscriptionPayload) => {
    const response = await apiClient.post('/subscriptions', payload);
    return response.data;
};

export const getUserSubscription = async () => (await apiClient.get('/subscriptions/current')).data;
export const getChatDialogueMessages = async (groupId: string, page = 1, perPage = 50) => (await apiClient.get(`/chat/dialog`, { params: { group_id: groupId, per_page: perPage, page: page, messages: true, orders: true } })).data;
export const sendMessage = async (groupId: string, message: string, files: File[] = [], replyToId: number | null = null) => {
    const formData = new FormData();
    formData.append('group_id', groupId);
    if (message) formData.append('message', message);
    if (replyToId) formData.append('reply_to_id', String(replyToId));
    files.forEach((file, index) => formData.append(`gallery[${index}]`, file));
    return (await apiClient.post(`/chat/message`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
export const markMessagesAsRead = async (groupId: string) => apiClient.post(`/chat/as_read`, { group_id: groupId });
export const getDialogues = async (page = 1, perPage = 15) => (await apiClient.get(`/chat/dialogues`, { params: { per_page: perPage, page: page, messages: true, orders: true } })).data;
export const clientInitiateChatWithWorker = async (orderId: string, workerId: number) => (await apiClient.post('/orders/chat/initiate-with-worker', { order_id: orderId, worker_id: workerId })).data.data;
export const addReview = async (orderId: string, rating: number, review: string | null) => (await apiClient.post('/orders/reviews', { order_id: orderId, rating, review })).data;


/**
 * Получение истории транзакций с пагинацией
 */
export const fetchUserTransactions = async (page = 1) => {
    const response = await apiClient.get(`/transactions?page=${page}`);
    return response.data; // Ожидается { data: [...], meta: ... }
};


/**
 * Удаление метода оплаты
 */
export const deletePaymentMethod = async (id: number) => {
    const response = await apiClient.delete(`/payment-methods/${id}`);
    return response.data;
};

// ==========================================
// СИТТЕР / ИСПОЛНИТЕЛЬ (НАСТРОЙКИ)
// ==========================================

/**
 * Получение текущих настроек услуг пользователя
 */
export const getUserSettings = async () => {
    const response = await apiClient.get('/settings');
    // Бэкенд возвращает { data: [...], meta: ... }
    return response.data;
};

/**
 * Обновление настроек услуг
 */
export const updateWorkerServices = async (payload: { services: any[] }) => {
    const response = await apiClient.post('/settings', payload);
    return response.data;
};

/**
 * Получение профиля ситтера (анкеты) для редактирования
 */
export const getMyProfile = async () => {
    // include=media важен для загрузки галереи
    const response = await apiClient.get('/my/profile?include=media');
    return response.data;
};

/**
 * Обновление анкеты ситтера (тексты + медиа)
 */
export const updateMyProfile = async (
    profileData: any,
    filesToUpload: File[] = [],
    orderIds: number[] = [],
    mediaIdsToRemove: number[] = []
) => {
    const formData = new FormData();

    // 1. Текстовые поля
    if (profileData.title !== undefined) formData.append('title', profileData.title);
    if (profileData.description !== undefined) formData.append('description', profileData.description);
    if (profileData.care_experience !== undefined) formData.append('care_experience', String(profileData.care_experience));
    // Обратите внимание: на вебе чекбоксы это boolean, но сервер ждет '1'/'0'
    if (profileData.children_under_twelve_yo !== undefined) formData.append('children_under_twelve_yo', profileData.children_under_twelve_yo ? '1' : '0');
    if (profileData.constant_supervision !== undefined) formData.append('constant_supervision', profileData.constant_supervision ? '1' : '0');

    // 2. Новые файлы
    filesToUpload.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });

    // 3. Удаление
    mediaIdsToRemove.forEach((id, index) => {
        formData.append(`media_ids_to_remove[${index}]`, String(id));
    });

    // 4. Сортировка
    orderIds.forEach((id, index) => {
        formData.append(`final_media_order[${index}]`, String(id));
    });

    const response = await apiClient.post('/my/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// --- НОВЫЕ ФУНКЦИИ ДЛЯ ВЫБОРА ИСПОЛНИТЕЛЯ ---

/**
 * Получение запросов (офферов, приглашений) для конкретного заказа клиента.
 * GET /v1/orders/{orderId}/requests
 */
export const getOrderRequests = async (orderId: string, params: any = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());

    // Важные связи: sender (воркер), recipient (если инвайт), order (данные заказа)
    const defaultInclude = 'sender.avatar,recipient,order';
    queryParams.append('include', params.include || defaultInclude);

    if (params.status) queryParams.append('status', params.status);
    if (params.request_type) queryParams.append('request_type', params.request_type);

    const response = await apiClient.get(`/orders/${orderId}/requests?${queryParams.toString()}`);
    return response.data; // { data: [...], meta: { pagination: ... } }
};

/**
 * Принятие оффера работника клиентом (выбор воркера для заказа).
 * POST /v1/orders/{orderId}/select-worker
 */
export const selectWorkerForOrder = async (orderId: string, workerId: string | number, requestId: string | number) => {
    const body = {
        worker_id: workerId,
        accepted_request_id: requestId
    };
    const response = await apiClient.post(`/orders/${orderId}/select-worker`, body);
    return response.data;
};


export default apiClient;