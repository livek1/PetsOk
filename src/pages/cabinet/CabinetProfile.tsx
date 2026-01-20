// --- File: src/pages/cabinet/CabinetProfile.tsx ---
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { loadUser, logout } from '../../store/slices/authSlice';
import { updateUser, fetchAddressSuggestions } from '../../services/api';
import style from '../../style/pages/cabinet/CabinetProfile.module.scss';

// Иконки
const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

interface ProfileFormValues {
    first_name: string;
    last_name: string;
    gender: string;
    birth: string; // YYYY-MM-DD
    phone: string;
    address_q: string;
    address_details: string;
    additional_contact_name: string;
    additional_contact_phone: string;
}

const CabinetProfile: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading: isAuthLoading, token } = useSelector((state: RootState) => state.auth);

    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // --- АВТОКОМПЛИТ АДРЕСА ---
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<ProfileFormValues>({
        defaultValues: {
            first_name: '',
            last_name: '',
            gender: '0',
            birth: '',
            phone: '',
            address_q: '',
            address_details: '',
            additional_contact_name: '',
            additional_contact_phone: '',
        }
    });

    const addressQuery = watch('address_q');

    // 1. Гарантированная подгрузка свежих данных при входе
    useEffect(() => {
        if (token) {
            dispatch(loadUser());
        }
    }, [dispatch, token]);

    // 2. Логика заполнения формы
    useEffect(() => {
        if (user) {
            const genderString = String(user.gender) === '1' ? '1' : '0';
            const birthDate = user.birth ? user.birth : '';

            reset({
                first_name: user.first_name || user.name?.split(' ')[0] || '',
                last_name: user.last_name || user.name?.split(' ')[1] || '',
                gender: genderString,
                birth: birthDate,
                phone: user.phone || '',
                address_q: (user as any).address || user.address_q || '',
                address_details: user.address_details || '',
                additional_contact_name: user.additional_contact_name || '',
                additional_contact_phone: user.additional_contact_phone || '',
            });

            if (user.avatar?.data?.preview_url) {
                setAvatarPreview(user.avatar.data.preview_url);
            }
        }
    }, [user, reset]);

    // Обработка ввода адреса (Автокомплит)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (addressQuery && addressQuery.length > 2 && showSuggestions) {
                try {
                    const results = await fetchAddressSuggestions(addressQuery);
                    setSuggestions(results);
                } catch (e) {
                    console.error("Error fetching suggestions", e);
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [addressQuery, showSuggestions]);

    const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        setIsSaving(true);
        try {
            const payload = {
                ...data,
                gender: parseInt(data.gender, 10),
                avatar: avatarFile || undefined
            };

            await updateUser(payload);
            await dispatch(loadUser());

            alert(t('editProfileScreen.flash.updateSuccess', 'Профиль успешно обновлен!'));
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || t('editProfileScreen.flash.updateFailed', 'Ошибка обновления');
            alert(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading && !user) {
        return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading')}</div>;
    }

    return (
        <div className={style.profileContainer}>
            {/* 1. Верхняя карточка: Аватар и Основное */}
            <div className={style.headerSection}>
                <div className={style.avatarWrapper}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className={style.avatarImage} />
                    ) : (
                        <div className={style.avatarPlaceholder}>
                            {(user?.name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                    )}

                    <label htmlFor="avatar-upload" className={style.avatarOverlay}>
                        <CameraIcon />
                    </label>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className={style.hiddenInput}
                        onChange={onAvatarChange}
                    />
                </div>

                <div className={style.userInfo}>
                    <h1 className={style.userName}>{user?.name || user?.email}</h1>
                    <p className={style.userEmail}>{user?.email}</p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        {user?.isSitter ? t('userRoles.sitter', 'Ситтер') : t('cabinet.modeClient', 'Клиент')}
                    </p>
                </div>

                <div className={style.headerActions}>
                    <button
                        className={style.logoutButtonMain}
                        onClick={() => dispatch(logout())}
                    >
                        {t('profile.logout.confirmButton', 'Выйти')}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={style.profileForm}>
                {/* 2. Личные данные */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.basicInfo.title', 'Личные данные')}</h2>
                    <div className={style.formGrid}>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.firstName', 'Имя')}</label>
                            <input
                                {...register("first_name", { required: t('editProfileScreen.validation.firstNameRequired', 'Введите имя') })}
                                className={`${style.input} ${errors.first_name ? style.inputError : ''}`}
                                placeholder={t('editProfileScreen.placeholders.firstName', 'Иван')}
                            />
                            {errors.first_name && <span className={style.errorText}>{errors.first_name.message}</span>}
                        </div>

                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.lastName', 'Фамилия')}</label>
                            <input
                                {...register("last_name")}
                                className={style.input}
                                placeholder={t('editProfileScreen.placeholders.lastName', 'Иванов')}
                            />
                        </div>

                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.gender', 'Пол')}</label>
                            <select {...register("gender")} className={style.select}>
                                <option value="0">{t('common.male_people', 'Мужской')}</option>
                                <option value="1">{t('common.female_people', 'Женский')}</option>
                            </select>
                        </div>

                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.birthDate', 'Дата рождения')}</label>
                            <input
                                type="date"
                                {...register("birth")}
                                className={style.input}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Контакты и Адрес */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.contactInfo.title', 'Контакты и адрес')}</h2>
                    <div className={style.formGrid}>
                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.phone', 'Телефон')}</label>
                            <input
                                {...register("phone", { required: true, minLength: 7 })}
                                className={style.input}
                                placeholder="+7..."
                            />
                        </div>

                        <div style={{ marginBottom: 10, gridColumn: '1 / -1' }}>
                            <div style={{ backgroundColor: '#E3F2FD', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ color: '#1565C0', marginTop: '2px' }}>ℹ️</div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1565C0' }}>
                                        {t('editProfileScreen.info.addressPrivacy.title', "Конфиденциальность адреса")}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1E40AF', lineHeight: '1.4' }}>
                                        {t('editProfileScreen.info.addressPrivacy.text', "Точный адрес (квартира, этаж) будет доступен исполнителю только после подтверждения заказа.")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.address', 'Адрес')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    {...register("address_q", { required: t('editProfileScreen.validation.addressRequired', 'Введите адрес') })}
                                    className={`${style.input} ${errors.address_q ? style.inputError : ''}`}
                                    placeholder={t('editProfileScreen.placeholders.address', "Начните вводить адрес...")}
                                    autoComplete="off"
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {errors.address_q && <span className={style.errorText}>{errors.address_q.message}</span>}

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul style={{
                                        position: 'absolute', top: '100%', left: 0, width: '100%',
                                        background: '#fff', border: '1px solid #ddd', borderRadius: 8,
                                        listStyle: 'none', padding: 0, margin: 0, zIndex: 10,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {suggestions.map((s, i) => (
                                            <li
                                                key={i}
                                                style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                                onMouseDown={() => {
                                                    setValue('address_q', s);
                                                    setSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.addressDetails', 'Детали адреса')}</label>
                            <input
                                {...register("address_details")}
                                className={style.input}
                                placeholder={t('editProfileScreen.placeholders.addressDetails', "Подъезд, этаж, домофон...")}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Экстренный контакт */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.emergencyContact.title', 'Доверенное лицо')}</h2>

                    <div style={{ marginBottom: 20 }}>
                        <div style={{ backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ color: '#2E7D32', marginTop: '2px' }}>🛡️</div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#2E7D32' }}>
                                    {t('editProfileScreen.info.emergency.title', "Зачем это нужно?")}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1B5E20', lineHeight: '1.4' }}>
                                    {t('editProfileScreen.info.emergency.text', 'Эти данные нужны нам исключительно для экстренных ситуаций.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={style.formGrid}>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.emergencyName', 'Имя')}</label>
                            <input
                                {...register("additional_contact_name")}
                                className={style.input}
                                placeholder={t('editProfileScreen.placeholders.emergencyName', 'Имя родственника или друга')}
                            />
                        </div>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.emergencyPhone', 'Телефон')}</label>
                            <input
                                {...register("additional_contact_phone")}
                                className={style.input}
                                placeholder="+7..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer с кнопкой */}
                <div className={style.footer}>
                    <button type="submit" disabled={isSaving} className={style.submitButton}>
                        {isSaving ? t('loading') : t('common.save', 'Сохранить изменения')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CabinetProfile;