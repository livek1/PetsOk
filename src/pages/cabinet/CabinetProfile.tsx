import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// --- БИБЛИОТЕКА ТЕЛЕФОНОВ ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; // Обязательно импортируем стили
// Мы переопределим их в SCSS, чтобы они выглядели как наши инпуты

import { RootState, AppDispatch } from '../../store';
import { loadUser, logoutUser } from '../../store/slices/authSlice';
import { updateUser, fetchAddressSuggestions } from '../../services/api';
import style from '../../style/pages/cabinet/CabinetProfile.module.scss';

// Иконки
const CameraIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>);
const CheckCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const AlertCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);

interface ProfileFormValues {
    first_name: string;
    last_name: string;
    gender: string;
    birth: string;
    phone: string;
    address_q: string;
    address_details: string;
    additional_contact_name: string;
    additional_contact_phone: string;
}

const CabinetProfile: React.FC = () => {
    const { t, i18n } = useTranslation(); // i18n нужен для определения дефолтной страны
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading, token } = useSelector((state: RootState) => state.auth);

    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { register, handleSubmit, setValue, reset, watch, setError, control, formState: { errors } } = useForm<ProfileFormValues>({
        defaultValues: {
            first_name: '', last_name: '', gender: '0', birth: '', phone: '', address_q: '', address_details: '', additional_contact_name: '', additional_contact_phone: '',
        }
    });

    const addressQuery = watch('address_q');
    const currentGender = watch('gender');

    useEffect(() => {
        if (token) dispatch(loadUser());
    }, [dispatch, token]);

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

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (addressQuery && addressQuery.length > 2 && showSuggestions) {
                try {
                    const results = await fetchAddressSuggestions(addressQuery);
                    setSuggestions(results);
                } catch (e) { console.error(e); }
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
        setStatusMsg(null);

        try {
            // PhoneInput возвращает номер без плюса в начале, но с кодом страны.
            // Добавим плюс, если его нет, для корректного сохранения на бэке
            const formatPhone = (p: string) => p.startsWith('+') ? p : `+${p}`;

            const payload = {
                ...data,
                phone: formatPhone(data.phone),
                additional_contact_phone: formatPhone(data.additional_contact_phone),
                gender: parseInt(data.gender, 10),
                avatar: avatarFile || undefined
            };

            await updateUser(payload);
            await dispatch(loadUser());

            setStatusMsg({ type: 'success', text: t('editProfileScreen.flash.updateSuccess', 'Изменения успешно сохранены!') });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.errors) {
                const serverErrors = error.response.data.errors;
                Object.keys(serverErrors).forEach((key) => {
                    setError(key as keyof ProfileFormValues, {
                        type: "server",
                        message: serverErrors[key][0]
                    });
                });
                setStatusMsg({ type: 'error', text: t('validationErrors.fillAllFields', 'Проверьте ошибки в форме.') });
            } else {
                const msg = error.response?.data?.message || t('editProfileScreen.flash.updateFailed', 'Ошибка обновления');
                setStatusMsg({ type: 'error', text: msg });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSaving(false);
        }
    };

    // Определяем страну по языку приложения (ru -> russia, en -> usa/uk) или дефолт
    const defaultCountry = i18n.language === 'ru' ? 'ru' : 'us';

    if (isAuthLoading && !user) return <div style={{ padding: 40, textAlign: 'center' }}>{t('loading')}</div>;

    return (
        <div className={style.profileContainer}>

            {statusMsg && (
                <div className={`${style.statusMessage} ${statusMsg.type === 'success' ? style.statusSuccess : style.statusError}`}>
                    {statusMsg.type === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* Header */}
            <div className={style.headerSection}>
                <div className={style.avatarWrapper}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className={style.avatarImage} />
                    ) : (
                        <div className={style.avatarPlaceholder}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>
                    )}
                </div>

                <div className={style.userInfo}>
                    <h1 className={style.userName}>{user?.name || user?.email}</h1>
                    <label htmlFor="avatar-upload" className={style.uploadBtnLink}>
                        <CameraIcon /> {t('common.changePhoto', 'Изменить фото')}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className={style.hiddenInput} onChange={onAvatarChange} />
                </div>

                <div className={style.headerActions}>
                    <button className={style.logoutButtonMain} onClick={() => dispatch(logoutUser()).then(() => navigate('/'))}>
                        {t('profile.logout.confirmButton', 'Выйти')}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={style.profileForm}>

                {/* Личные данные */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.basicInfo.title', 'Личные данные')}</h2>
                    <div className={style.formGrid}>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.firstName', 'Имя')} <span className={style.requiredStar}>*</span></label>
                            <input
                                {...register("first_name", { required: t('editProfileScreen.validation.firstNameRequired', 'Введите имя') })}
                                className={`${style.input} ${errors.first_name ? style.inputError : ''}`}
                            />
                            {errors.first_name && <span className={style.errorText}>{errors.first_name.message}</span>}
                        </div>

                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.lastName', 'Фамилия')}</label>
                            <input {...register("last_name")} className={style.input} />
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidthMobile}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.gender', 'Пол')}</label>
                            <div className={style.segmentedControl}>
                                <button type="button" className={`${style.segmentBtn} ${currentGender === '0' ? style.active : ''}`} onClick={() => setValue('gender', '0')}>
                                    {t('common.male_people', 'Мужской')}
                                </button>
                                <button type="button" className={`${style.segmentBtn} ${currentGender === '1' ? style.active : ''}`} onClick={() => setValue('gender', '1')}>
                                    {t('common.female_people', 'Женский')}
                                </button>
                                <input type="hidden" {...register('gender')} />
                            </div>
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidthMobile}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.birthDate', 'Дата рождения')}</label>
                            <input type="date" {...register("birth")} className={style.input} />
                        </div>
                    </div>
                </div>

                {/* Контакты */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.contactInfo.title', 'Контакты и адрес')}</h2>
                    <div className={style.formGrid}>
                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.phone', 'Телефон')} <span className={style.requiredStar}>*</span></label>

                            {/* --- УМНЫЙ ВВОД ТЕЛЕФОНА --- */}
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: true, validate: (val) => val.length > 8 }}
                                render={({ field }) => (
                                    <PhoneInput
                                        country={defaultCountry}
                                        value={field.value}
                                        onChange={phone => field.onChange(phone)}
                                        // Классы для стилизации через модуль
                                        containerClass={style.phoneContainer}
                                        inputClass={`${style.phoneInput} ${errors.phone ? style.inputError : ''}`}
                                        buttonClass={style.phoneButton}
                                        // Настройки
                                        enableSearch={true}
                                        disableSearchIcon={true}
                                        preferredCountries={['ru', 'kz', 'by', 'us', 'de', 'ge', 'am']}
                                        placeholder="+7 (999) 000-00-00"
                                    />
                                )}
                            />
                            {errors.phone && <span className={style.errorText}>{t('validation.phoneRequired', 'Укажите корректный номер')}</span>}
                        </div>

                        <div className={style.infoBox}>
                            <div className={style.infoIcon}>ℹ️</div>
                            <div className={style.infoContent}>
                                <h4>{t('editProfileScreen.info.addressPrivacy.title', "Адрес в безопасности")}</h4>
                                <p>{t('editProfileScreen.info.addressPrivacy.text', "Точный адрес виден только исполнителю после подтверждения заказа.")}</p>
                            </div>
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.address', 'Адрес')} <span className={style.requiredStar}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    {...register("address_q", { required: t('editProfileScreen.validation.addressRequired', 'Введите адрес') })}
                                    className={`${style.input} ${errors.address_q ? style.inputError : ''}`}
                                    placeholder={t('editProfileScreen.placeholders.address', "Начните вводить...")}
                                    autoComplete="off"
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {errors.address_q && <span className={style.errorText}>{errors.address_q.message}</span>}

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className={style.suggestionsList}>
                                        {suggestions.map((s, i) => (
                                            <li key={i} onMouseDown={(e) => { e.preventDefault(); setValue('address_q', s); setSuggestions([]); setShowSuggestions(false); }}>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className={`${style.inputGroup} ${style.fullWidth}`}>
                            <label className={style.label}>{t('editProfileScreen.labels.addressDetails', 'Детали')}</label>
                            <input {...register("address_details")} className={style.input} placeholder={t('editProfileScreen.placeholders.addressDetails', "Подъезд, этаж...")} />
                        </div>
                    </div>
                </div>

                {/* Экстренный контакт */}
                <div className={style.sectionCard}>
                    <h2>{t('editProfileScreen.sections.emergencyContact.title', 'Экстренный контакт')}</h2>
                    <div className={style.infoBoxGreen}>
                        <div className={style.infoIcon}>🛡️</div>
                        <div className={style.infoContent}>
                            <h4>{t('editProfileScreen.info.emergency.title', "Зачем это нужно?")}</h4>
                            <p>{t('editProfileScreen.info.emergency.text', 'Мы позвоним этому человеку только в крайнем случае.')}</p>
                        </div>
                    </div>

                    <div className={style.formGrid}>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.emergencyName', 'Имя')} <span className={style.requiredStar}>*</span></label>
                            <input
                                {...register("additional_contact_name", { required: t('validation.required', 'Обязательное поле') })}
                                className={`${style.input} ${errors.additional_contact_name ? style.inputError : ''}`}
                            />
                            {errors.additional_contact_name && <span className={style.errorText}>{errors.additional_contact_name.message}</span>}
                        </div>
                        <div className={style.inputGroup}>
                            <label className={style.label}>{t('editProfileScreen.labels.emergencyPhone', 'Телефон')} <span className={style.requiredStar}>*</span></label>

                            {/* --- УМНЫЙ ВВОД ТЕЛЕФОНА (Экстренный) --- */}
                            <Controller
                                name="additional_contact_phone"
                                control={control}
                                rules={{ required: true, validate: (val) => val.length > 8 }}
                                render={({ field }) => (
                                    <PhoneInput
                                        country={defaultCountry}
                                        value={field.value}
                                        onChange={phone => field.onChange(phone)}
                                        containerClass={style.phoneContainer}
                                        inputClass={`${style.phoneInput} ${errors.additional_contact_phone ? style.inputError : ''}`}
                                        buttonClass={style.phoneButton}
                                        enableSearch={true}
                                        disableSearchIcon={true}
                                        preferredCountries={['ru', 'kz', 'by']}
                                    />
                                )}
                            />
                            {errors.additional_contact_phone && <span className={style.errorText}>{t('validation.required', 'Обязательное поле')}</span>}
                        </div>
                    </div>
                </div>

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