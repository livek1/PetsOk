// --- File: src/store/slices/searchSlice.ts ---
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchSitterFetch, SearchParams } from '../../services/api';
import { RootState } from '../index';

interface SearchState {
    searchParams: SearchParams;
    searchResults: any[];
    pagination: {
        current_page: number;
        total_pages: number;
        total: number;
    } | null;
    searchMeta: any;
    isLoading: boolean;
    isFetchingMore: boolean;
    error: string | null;
}

const initialState: SearchState = {
    searchParams: {
        service_key: 'boarding',
        city: undefined,
        address: undefined,
        latitude: undefined,
        longitude: undefined,
        radius_km: 30,
        sw_lat: undefined,
        sw_lon: undefined,
        ne_lat: undefined,
        ne_lon: undefined,
        searchReason: 'initial',
        limit: 30,
    },
    searchResults: [],
    pagination: null,
    searchMeta: {},
    isLoading: false,
    isFetchingMore: false,
    error: null,
};

export const performSearch = createAsyncThunk(
    'search/performSearch',
    async (
        { params, page = 1, isNewSearch = true }: { params: SearchParams; page?: number; isNewSearch?: boolean },
        { getState, rejectWithValue }
    ) => {
        const state = getState() as RootState;
        const currentParams = state.search.searchParams;

        // Мержим параметры: новые поверх старых
        const paramsForApi = {
            ...currentParams,
            ...params,
            limit: params.limit || currentParams.limit || 30,
        };

        try {
            const response = await searchSitterFetch({ searchParams: paramsForApi, page });

            if (response.status === 'success' && response.data) {
                const responseBody = response.data;
                return {
                    results: responseBody.data || [],
                    pagination: responseBody.meta?.pagination || responseBody.pagination,
                    meta: responseBody.meta,
                    isNewSearch,
                    searchParams: params, // Передаем параметры, которые инициировали поиск
                };
            }
            return rejectWithValue(response.message || 'Ошибка API');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchParams(state, action: PayloadAction<SearchParams>) {
            state.searchParams = { ...state.searchParams, ...action.payload };
        },
        clearSearchResults(state) {
            state.searchResults = [];
            state.pagination = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(performSearch.pending, (state, action) => {
                if (action.meta.arg.isNewSearch) {
                    state.isLoading = true;
                    state.error = null;
                } else {
                    state.isFetchingMore = true;
                }
            })
            .addCase(performSearch.fulfilled, (state, action) => {
                const { results, pagination, meta, isNewSearch, searchParams } = action.payload;

                state.isLoading = false;
                state.isFetchingMore = false;
                state.pagination = pagination;
                state.searchMeta = meta;

                // 1. Сначала обновляем параметры из того, что передали в action (например, сдвиг карты)
                if (searchParams) {
                    state.searchParams = { ...state.searchParams, ...searchParams };
                }

                // 2. Если API вернул новые координаты (например, при поиске по адресу), обновляем их
                // Это критично для центрирования карты!
                const customMeta = meta?.custom || {};

                // Если мы искали НЕ по границам (а, например, по городу), и сервер вернул координаты города
                const isMapBoundsSearch = searchParams?.searchReason === 'map_bounds';

                if (isNewSearch && !isMapBoundsSearch) {
                    if (customMeta.search_latitude && customMeta.search_longitude) {
                        state.searchParams.latitude = customMeta.search_latitude;
                        state.searchParams.longitude = customMeta.search_longitude;
                        // Если сервер вернул нормализованный адрес
                        if (customMeta.search_address) {
                            state.searchParams.address = customMeta.search_address;
                        }
                    }
                }

                if (isNewSearch) {
                    state.searchResults = results;
                } else {
                    const existingIds = new Set(state.searchResults.map(i => i.id));
                    const newUnique = results.filter((i: any) => !existingIds.has(i.id));
                    state.searchResults = [...state.searchResults, ...newUnique];
                }
            })
            .addCase(performSearch.rejected, (state, action) => {
                state.isLoading = false;
                state.isFetchingMore = false;
                state.error = action.payload as string;
            });
    }
});

export const { setSearchParams, clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;