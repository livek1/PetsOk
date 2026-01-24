// --- File: src/pages/cabinet/CabinetSitterProfile.tsx ---
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Для ссылки на профиль пользователя
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import {
    getUserSettings,
    getWorkerAvailableServices,
    updateWorkerServices,
    getMyProfile,
    updateMyProfile
} from '../../services/api';

import style from '../../style/pages/cabinet/CabinetSitterProfile.module.scss';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// Компоненты
import StepTests from './becomeSitter/steps/StepTests';
import ServiceConfigurationCard from './becomeSitter/steps/ServiceConfigurationCard';

// Иконки
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const VideoIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 7l-5 3V8l5 3z" /></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const AlertIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const MapPinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

const SERVICE_KEYS = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DAY_CARE: 'doggy_day_care',
    WALKING: 'walking',
};

const DEFAULT_UNITS_MAP: Record<string, string> = {
    [SERVICE_KEYS.BOARDING]: 'night',
    [SERVICE_KEYS.HOUSE_SITTING]: 'night',
    [SERVICE_KEYS.DAY_CARE]: 'day',
    [SERVICE_KEYS.DROP_IN_VISIT]: 'visit',
    [SERVICE_KEYS.WALKING]: 'walk_60',
};

const CabinetSitterProfile: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'services' | 'profile' | 'tests'>('services');

    if (activeTab === 'tests') {
        return <StepTests onNext={() => setActiveTab('services')} />;
    }

    return (
        <div className={style.container}>
            <div className={style.tabsHeader}>
                <button
                    className={`${style.tabBtn} ${activeTab === 'services' ? style.active : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    {t('sitterSettings.tabs.services', 'Услуги и цены')}
                </button>
                <button
                    className={`${style.tabBtn} ${activeTab === 'profile' ? style.active : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    {t('sitterSettings.tabs.profile', 'Анкета и фото')}
                </button>
            </div>

            {activeTab === 'services' ? (
                <ServicesTab onGoToTests={() => setActiveTab('tests')} />
            ) : (
                <ProfileTab />
            )}
        </div>
    );
};

// ==========================================
// TAB 1: УСЛУГИ
// ==========================================
interface ServicesTabProps { onGoToTests: () => void; }

const ServicesTab: React.FC<ServicesTabProps> = ({ onGoToTests }) => {
    const { t } = useTranslation();
    const { activeServices: globalActiveServices } = useSelector((state: RootState) => state.config);

    const [workerServices, setWorkerServices] = useState<any>({});
    const [currencySymbol, setCurrencySymbol] = useState('₽');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availableKeys, setAvailableKeys] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [userSettingsResponse, apiServicesResponse] = await Promise.all([
                    getUserSettings(),
                    getWorkerAvailableServices()
                ]);

                const savedServices = userSettingsResponse.data?.data || userSettingsResponse.data || [];
                const apiServicesInfo = apiServicesResponse.data || [];
                const curr = userSettingsResponse.data?.meta?.currency?.symbol || '₽';
                setCurrencySymbol(curr);

                const order = [
                    SERVICE_KEYS.BOARDING,
                    SERVICE_KEYS.WALKING,
                    SERVICE_KEYS.DAY_CARE,
                    SERVICE_KEYS.HOUSE_SITTING,
                    SERVICE_KEYS.DROP_IN_VISIT
                ];

                const filteredKeys = globalActiveServices.length > 0
                    ? order.filter(k => globalActiveServices.includes(k))
                    : order;

                setAvailableKeys(filteredKeys);

                const initial: any = {};
                filteredKeys.forEach(key => {
                    const saved = savedServices.find((s: any) => s.service_key === key);
                    const abilityInfo = apiServicesInfo.find((s: any) => s.service_key === key);
                    const testDetails = saved?.test_details || abilityInfo?.test_details_for_activation || { status: 'not_defined' };

                    const canActivate = testDetails.status === 'required_passed' ||
                        testDetails.status === 'completed_passed' ||
                        testDetails.status === 'not_required' ||
                        testDetails.status === 'not_defined';

                    const allowedPetTypes = (saved?.allowedPetTypes?.data || []).map((pt: any) => pt.id).filter(Boolean);
                    const allowedDogSizes = (saved?.allowedDogSizes?.data || []).map((ds: any) => ds.id).filter(Boolean);
                    const allowedCatSizes = (saved?.allowedCatSizes?.data || []).map((cs: any) => cs.id).filter(Boolean);

                    if (saved) {
                        initial[key] = {
                            service_key: key,
                            price_per_unit: saved.price_per_unit?.toString() ?? abilityInfo?.recommended_price?.toString() ?? '',
                            unit: saved.unit || abilityInfo?.default_unit || DEFAULT_UNITS_MAP[key],
                            price_per_additional_pet: saved.price_per_additional_pet?.toString() ?? '',
                            max_pets: saved.max_pets?.toString() ?? '',
                            allowed_pet_types: allowedPetTypes,
                            allowed_dog_sizes: allowedDogSizes,
                            allowed_cat_sizes: allowedCatSizes,
                            is_active: !!saved.is_active,
                            can_be_activated_from_api: canActivate,
                            test_details_from_api: testDetails,
                            recommended_price_from_api: abilityInfo?.recommended_price ?? null,
                            default_unit_from_api: abilityInfo?.default_unit || DEFAULT_UNITS_MAP[key]
                        };
                    } else {
                        initial[key] = {
                            service_key: key,
                            price_per_unit: abilityInfo?.recommended_price?.toString() ?? '',
                            unit: abilityInfo?.default_unit || DEFAULT_UNITS_MAP[key],
                            price_per_additional_pet: '',
                            max_pets: '',
                            allowed_pet_types: [],
                            allowed_dog_sizes: [],
                            allowed_cat_sizes: [],
                            is_active: false,
                            can_be_activated_from_api: canActivate,
                            test_details_from_api: testDetails,
                            recommended_price_from_api: abilityInfo?.recommended_price ?? null,
                            default_unit_from_api: abilityInfo?.default_unit || DEFAULT_UNITS_MAP[key]
                        };
                    }
                });

                setWorkerServices(initial);
            } catch (e) {
                console.error("Error loading services:", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [globalActiveServices]);

    const handleSettingChange = (serviceKey: string, field: string, value: string) => {
        let sanitizedValue = value;
        if (['price_per_unit', 'price_per_additional_pet', 'max_pets'].includes(field)) {
            sanitizedValue = value.replace(/[^0-9.]/g, '');
        }
        setWorkerServices((prev: any) => ({
            ...prev,
            [serviceKey]: { ...(prev[serviceKey] || {}), [field]: sanitizedValue }
        }));
    };

    const handleToggleActive = (serviceKey: string) => {
        // --- ИСПРАВЛЕНИЕ: Проверка ДО изменения стейта ---
        const service = workerServices[serviceKey];
        if (!service) return;

        // Если пытаемся включить
        if (!service.is_active) {
            if (!service.can_be_activated_from_api) {
                const message = service.test_details_from_api?.message || t('sitterSettings.services.testRequired', 'Для активации нужно сдать тест.');
                // Блокируем и показываем конфирм
                if (window.confirm(`${message}\n\n${t('GoToTestsButton', 'Перейти к тестам')}?`)) {
                    onGoToTests();
                }
                // ВАЖНО: Возвращаемся без изменения стейта
                return;
            }
        }

        // Если все ок - меняем
        setWorkerServices((prev: any) => ({
            ...prev,
            [serviceKey]: { ...prev[serviceKey], is_active: !prev[serviceKey].is_active }
        }));
    };

    const handleMultiSelectChange = (serviceKey: string, field: string, newValue: any[]) => {
        setWorkerServices((prev: any) => ({
            ...prev,
            [serviceKey]: { ...(prev[serviceKey] || {}), [field]: newValue }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = availableKeys.map(key => {
                const s = workerServices[key];
                return {
                    service_key: key,
                    is_active: s.is_active,
                    price_per_unit: parseFloat(s.price_per_unit) || 0,
                    unit: s.unit,
                    price_per_additional_pet: s.price_per_additional_pet ? parseFloat(s.price_per_additional_pet) : null,
                    max_pets: s.max_pets ? parseInt(s.max_pets, 10) : null,
                    allowed_pet_types: s.allowed_pet_types,
                    allowed_dog_sizes: s.allowed_dog_sizes,
                    allowed_cat_sizes: s.allowed_cat_sizes,
                };
            });

            await updateWorkerServices({ services: payload });
            alert(t('sitterSettings.services.successSaved', 'Настройки сохранены!'));
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const getServiceNameLabel = (key: string) => t(`header.services.${key}`, key);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading')}</div>;

    return (
        <div>
            <div className={style.servicesGrid}>
                {availableKeys.map(key => (
                    <ServiceConfigurationCard
                        key={key}
                        serviceKey={key}
                        serviceName={getServiceNameLabel(key)}
                        settings={workerServices[key]}
                        currencySymbol={currencySymbol}
                        onToggleActive={handleToggleActive}
                        onChangeSetting={handleSettingChange}
                        onMultiSelectChange={handleMultiSelectChange}
                        onGoToTests={onGoToTests}
                    />
                ))}
            </div>
            <button className={style.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? '...' : t('sitterSettings.services.save', 'Сохранить настройки')}
            </button>
        </div>
    );
};


// ==========================================
// TAB 2: АНКЕТА (ProfileTab)
// ==========================================
const ProfileTab = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [experience, setExperience] = useState('');
    const [kids, setKids] = useState(false);
    const [supervision, setSupervision] = useState(false);

    // Адрес (для отображения в read-only)
    const [displayAddress, setDisplayAddress] = useState('');

    const [media, setMedia] = useState<any[]>([]);
    const [mediaIdsToRemove, setMediaIdsToRemove] = useState<number[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    const [moderationStatus, setModerationStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
    const [moderationNotes, setModerationNotes] = useState<string | null>(null);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const response = await getMyProfile();
                const data = response.data || response;

                setModerationStatus(data.moderation_status || 'approved');
                setModerationNotes(data.moderation_notes);

                const isPending = data.moderation_status === 'pending';
                const pending = data.pending_changes || {};

                setTitle((isPending && pending.title) ? pending.title : (data.title || ''));
                setDescription((isPending && pending.description) ? pending.description : (data.description || ''));
                setExperience(data.care_experience !== undefined ? String(data.care_experience) : '');
                setKids(!!data.children_under_twelve_yo);
                setSupervision(!!data.constant_supervision);

                // Адрес берем из профиля (он может быть в address_q или address)
                setDisplayAddress(data.address_q || data.address || 'Адрес не указан');

                const serverMedia = data.media?.data || [];
                let mediaList: any[] = [];

                if (isPending && pending.pending_media_order?.length > 0) {
                    const orderIds = pending.pending_media_order.map(String);
                    orderIds.forEach((id: string) => {
                        const found = serverMedia.find((f: any) => String(f.id) === id);
                        if (found) mediaList.push(mapServerFile(found));
                    });
                    serverMedia.forEach((f: any) => {
                        if (!mediaList.find(m => String(m.id) === String(f.id))) mediaList.push(mapServerFile(f));
                    });
                } else {
                    mediaList = serverMedia
                        .sort((a: any, b: any) => (a.pivot_order_column || 0) - (b.pivot_order_column || 0))
                        .map(mapServerFile);
                }
                setMedia(mediaList);

            } catch (e) {
                console.error("Failed to load profile:", e);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const mapServerFile = (f: any) => ({
        id: f.id,
        key: `server-${f.id}`,
        url: f.preview_url || f.url,
        type: (f.mime_type?.startsWith('video/') || f.url?.endsWith('.mp4')) ? 'video' : 'photo',
        isNew: false,
        isServer: true
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (media.length + files.length > 20) return alert(t('mediaPicker.limitReached', 'Максимум 20 файлов'));
            setNewFiles(prev => [...prev, ...files]);
            const newPreviews = files.map((file, idx) => ({
                id: `new-${Date.now()}-${idx}`,
                key: `local-${Date.now()}-${idx}`,
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' : 'photo',
                isNew: true,
                isServer: false,
                fileObj: file
            }));
            setMedia(prev => [...prev, ...newPreviews]);
        }
        e.target.value = '';
    };

    const handleRemoveMedia = (index: number) => {
        const item = media[index];
        if (item.isServer) {
            setMediaIdsToRemove(prev => [...prev, item.id]);
        } else {
            setNewFiles(prev => prev.filter(f => f !== item.fileObj));
        }
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    const handleMakeMain = (index: number) => {
        if (moderationStatus === 'pending') return;
        if (index === 0) return;
        const newMedia = [...media];
        const [movedItem] = newMedia.splice(index, 1);
        newMedia.unshift(movedItem);
        setMedia(newMedia);
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            return alert(t('validationErrors.titleRequired', 'Заполните заголовок и описание'));
        }
        setSaving(true);
        try {
            const orderIds = media.filter(m => m.isServer).map(m => m.id);
            const filesToUpload = media.filter(m => m.isNew).map(m => m.fileObj);

            const payload = {
                title,
                description,
                // Адрес НЕ отправляем, так как он редактируется в профиле пользователя
                care_experience: parseInt(experience) || 0,
                children_under_twelve_yo: kids ? '1' : '0',
                constant_supervision: supervision ? '1' : '0',
            };

            const res = await updateMyProfile(payload, filesToUpload, orderIds, mediaIdsToRemove);
            if (res.data?.moderation_status) setModerationStatus(res.data.moderation_status);

            alert(t('sitterSettings.profile.successProfile', 'Профиль обновлен!'));
            setNewFiles([]);
            setMediaIdsToRemove([]);
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading')}</div>;
    const isPending = moderationStatus === 'pending';
    const isRejected = moderationStatus === 'rejected';

    return (
        <div className={style.profileForm}>
            {/* Статус модерации */}
            {isPending && (
                <div className={`${style.banner} ${style.pending}`}>
                    <ClockIcon />
                    <p>{t('editSitterProfile.statusPending', 'Анкета на проверке. Вы не можете менять данные.')}</p>
                </div>
            )}
            {isRejected && (
                <div className={`${style.banner} ${style.rejected}`}>
                    <AlertIcon />
                    <div>
                        <p style={{ fontWeight: 'bold' }}>{t('editSitterProfile.statusRejected', 'Анкета отклонена. Исправьте ошибки.')}</p>
                        {moderationNotes && <p style={{ marginTop: 4, fontSize: '0.9em' }}>{t('editSitterProfile.moderationReason', 'Причина:')} {moderationNotes}</p>}
                    </div>
                </div>
            )}

            {/* МЕДИА */}
            <div className={style.sectionCard}>
                <div className={style.mediaHeader}>
                    <h3 className={style.sectionTitle}>{t('sitterSettings.profile.media', 'Фото и Видео')}</h3>
                    {!isPending && (
                        <label className={style.addMediaBtn}>
                            + {t('common.add', 'Добавить')}
                            <input type="file" multiple accept="image/*,video/*" className={style.hiddenInput} onChange={handleFileSelect} />
                        </label>
                    )}
                </div>
                <div className={style.mediaGrid}>
                    {media.map((item, index) => (
                        <div key={item.key || item.id} className={`${style.mediaItem} ${index === 0 ? style.isMain : ''}`} onClick={() => { setLightboxIndex(index); setIsLightboxOpen(true); }}>
                            {item.type === 'video' ? <video src={item.url} /> : <img src={item.url} alt="media" />}
                            {!isPending && (
                                <button type="button" className={style.deleteBtn} onClick={(e) => { e.stopPropagation(); handleRemoveMedia(index); }}><TrashIcon /></button>
                            )}
                            {index !== 0 && !isPending && (
                                <button type="button" className={style.makeMainBtn} onClick={(e) => { e.stopPropagation(); handleMakeMain(index); }}>Сделать главным</button>
                            )}
                            {index === 0 && <div className={style.mainBadge}>{t('editSitterProfile.mainPhoto', 'Главное')}</div>}
                        </div>
                    ))}
                    {!isPending && media.length < 20 && (
                        <label className={style.uploadLabel}>
                            <CameraIcon />
                            <span>{t('sitterSettings.profile.uploadBtn', 'Загрузить')}</span>
                            <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} />
                        </label>
                    )}
                </div>
                {/* Подсказки */}
                <p className={style.mediaHint}>{t('sitterSettings.profile.mediaHint', 'Загрузите фото. Первое будет главным в поиске.')}</p>
                <p className={style.mediaHint} style={{ color: '#718096', fontSize: '0.8rem', marginTop: 4 }}>
                    <InfoIcon /> {t('sitterSettings.profile.mediaPublicHint', 'Фотографии будут доступны в публичной галерее профиля.')}
                </p>
            </div>

            {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
            <div className={style.sectionCard}>
                <h3 className={style.sectionTitle}>{t('sitterSettings.profile.mainInfo', 'Основная информация')}</h3>

                <div className={style.formGroup}>
                    <label>{t('sitterSettings.profile.titleLabel', 'Заголовок профиля')}</label>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '8px', lineHeight: '1.4' }}>
                        {t('sitterSettings.profile.publicVisibilityHint', 'Эта информация будет видна всем в вашем публичном профиле.')}
                    </p>
                    <input className={`${style.input} ${isPending ? style.disabled : ''}`} value={title} onChange={e => setTitle(e.target.value)} placeholder="Опытный догситтер" maxLength={75} disabled={isPending} />
                </div>

                <div className={style.formGroup}>
                    <label>{t('sitterSettings.profile.aboutLabel', 'О себе')}</label>
                    <textarea className={`${style.textarea} ${isPending ? style.disabled : ''}`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Расскажите о себе..." maxLength={5000} disabled={isPending} />
                </div>

                {/* --- АДРЕС (READ ONLY) --- */}
                <div className={style.formGroup} style={{ backgroundColor: '#F8F9FB', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#718096' }}>
                        <MapPinIcon />
                        <label style={{ margin: 0, color: 'inherit' }}>{t('sitterSettings.profile.addressLabel', 'Ваш адрес')}</label>
                    </div>
                    <div style={{ paddingLeft: '28px' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1A202C', marginBottom: '8px' }}>
                            {displayAddress}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                            {t('sitterSettings.profile.addressReadOnlyHint', 'Адрес привязан к вашему основному аккаунту.')}
                        </p>
                        <Link to="/cabinet/profile" style={{ fontSize: '0.9rem', color: '#3598FE', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {t('sitterSettings.profile.addressEditLink', 'Редактировать адрес в профиле пользователя')} &rarr;
                        </Link>
                    </div>
                </div>

                <div className={style.formGroup}>
                    <label>{t('sitterSettings.profile.experienceLabel', 'Опыт (лет)')}</label>
                    <input type="text" className={`${style.input} ${isPending ? style.disabled : ''}`} value={experience} onChange={e => setExperience(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100px' }} disabled={isPending} maxLength={2} />
                </div>
            </div>

            <div className={style.sectionCard}>
                <h3 className={style.sectionTitle}>{t('sitterSettings.profile.conditions', 'Условия')}</h3>
                <div className={style.togglesRow}>
                    <label className={style.toggleItem}>
                        <span>{t('sitterSettings.profile.kidsLabel', 'Есть дети до 12 лет')}</span>
                        <div className={style.switch}>
                            <input type="checkbox" checked={kids} onChange={e => setKids(e.target.checked)} disabled={isPending} />
                            <span className={style.slider}></span>
                        </div>
                    </label>
                    <label className={style.toggleItem}>
                        <span>{t('sitterSettings.profile.supervisionLabel', 'Постоянный присмотр')}</span>
                        <div className={style.switch}>
                            <input type="checkbox" checked={supervision} onChange={e => setSupervision(e.target.checked)} disabled={isPending} />
                            <span className={style.slider}></span>
                        </div>
                    </label>
                </div>
            </div>

            {!isPending && (
                <button className={style.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? '...' : t('sitterSettings.profile.saveProfile', 'Сохранить профиль')}
                </button>
            )}

            <Lightbox open={isLightboxOpen} close={() => setIsLightboxOpen(false)} index={lightboxIndex} slides={media.map(m => m.type === 'video' ? { type: 'video', width: 1280, height: 720, sources: [{ src: m.url, type: 'video/mp4' }] } : { src: m.url })} plugins={[Video]} />
        </div>
    );
};

export default CabinetSitterProfile;