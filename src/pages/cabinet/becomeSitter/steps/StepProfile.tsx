import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createAdditionalWorkerProfile, fetchAddressSuggestions } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepProfile.module.scss';

// Иконки
const ProfileIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1"></rect></svg>;
const BulbIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2v1"></path><path d="M12 2a7 7 0 0 1 7 7c0 3.87-2.33 6.5-7 6.5s-7-2.63-7-6.5a7 7 0 0 1 7-7z"></path></svg>;
const AddIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

interface MediaFile {
    file: File;
    preview: string;
    type: 'image' | 'video';
    id: string;
}

const StepProfile = ({ onNext, isResubmission, adminMessage }: { onNext: () => void, isResubmission: boolean, adminMessage?: string }) => {
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [careExperience, setCareExperience] = useState('');
    const [constantSupervision, setConstantSupervision] = useState(false);
    const [childrenUnderTwelve, setChildrenUnderTwelve] = useState(false);

    // Состояния для автокомплита адреса
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
    const [mainMediaId, setMainMediaId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Логика поиска адресов с задержкой (debounce)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (address && address.length > 2 && showSuggestions) {
                try {
                    const results = await fetchAddressSuggestions(address);
                    setSuggestions(results);
                } catch (e) {
                    console.error("Error fetching suggestions", e);
                }
            } else {
                setSuggestions([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [address, showSuggestions]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newItems: MediaFile[] = files.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' : 'image',
                id: Math.random().toString(36).substr(2, 9)
            }));

            setMediaItems(prev => {
                const combined = [...prev, ...newItems];
                if (!mainMediaId && combined.length > 0) setMainMediaId(combined[0].id);
                return combined;
            });
        }
        e.target.value = '';
    };

    const handleRemoveMedia = (idToRemove: string) => {
        setMediaItems(prev => prev.filter(item => item.id !== idToRemove));
        if (mainMediaId === idToRemove) {
            setMediaItems(prev => {
                const remaining = prev.filter(item => item.id !== idToRemove);
                setMainMediaId(remaining.length > 0 ? remaining[0].id : null);
                return remaining;
            });
        }
    };

    const handleSetMain = (id: string) => {
        setMainMediaId(id);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = t('validation.titleRequired', 'Заголовок обязателен');
        if (!description.trim()) newErrors.description = t('validation.descriptionRequired', 'Описание обязательно');
        if (!address.trim()) newErrors.address = t('validation.addressRequired', 'Укажите район или метро');
        if (!careExperience.trim()) newErrors.care_experience = t('validation.experienceRequired', 'Укажите опыт');
        if (mediaItems.length === 0) newErrors.media = t('validation.mediaRequired', 'Загрузите хотя бы одно фото');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            let sortedFiles = [...mediaItems];
            if (mainMediaId) {
                const mainIndex = sortedFiles.findIndex(i => i.id === mainMediaId);
                if (mainIndex > 0) {
                    const [mainItem] = sortedFiles.splice(mainIndex, 1);
                    sortedFiles.unshift(mainItem);
                }
            }

            const profileData = {
                title,
                description,
                address_q: address,
                care_experience: parseInt(careExperience) || 0,
                constant_supervision: constantSupervision ? 1 : 0,
                children_under_twelve_yo: childrenUnderTwelve ? 1 : 0,
            };

            await createAdditionalWorkerProfile(profileData, sortedFiles.map(i => i.file));
            onNext();
        } catch (e: any) {
            console.error(e);
            if (e.response?.data?.errors) {
                const serverErrors = e.response.data.errors;
                const mapped: Record<string, string> = {};
                Object.keys(serverErrors).forEach(k => mapped[k] = serverErrors[k][0]);
                setErrors(mapped);
            } else {
                alert(e.response?.data?.message || 'Ошибка сохранения профиля');
            }
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className={style.stepCard}>
            <div className={style.header}>
                <div className={style.iconCircle}>
                    <ProfileIcon />
                </div>
                <h1>{t('additionalProfile.mainTitle', 'Анкета исполнителя')}</h1>
                <p>{t('additionalProfile.mainSubtitle', 'Расскажите о себе, чтобы клиенты выбрали именно вас.')}</p>
            </div>

            {isResubmission && adminMessage && (
                <div className={style.errorMessage}>
                    <strong>Администратор:</strong> {adminMessage}
                </div>
            )}

            <div className={style.infoCard}>
                <BulbIcon />
                <span>
                    {t('additionalProfile.guidanceMessage', 'Заполните профиль подробно.')} {' '}
                    <a href="/sitter/b572a4a4-370b-4a36-8518-b663bc907fea" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', textDecoration: 'underline', color: 'inherit' }}>
                        {t('additionalProfile.viewExampleProfileLink', 'Посмотреть пример')}
                    </a>
                </span>
            </div>

            {/* MEDIA SECTION */}
            <div className={style.sectionTitle}>
                {t('additionalProfile.mediaSectionTitle', 'Фото и Видео')}
                {errors.media && <span style={{ color: '#F44336', fontSize: '0.8rem', marginLeft: 10 }}>{errors.media}</span>}
            </div>

            <div className={style.mediaGrid}>
                {mediaItems.map(item => (
                    <div
                        key={item.id}
                        className={`${style.mediaItem} ${mainMediaId === item.id ? style.isMain : ''}`}
                        onClick={() => handleSetMain(item.id)}
                        title="Нажмите, чтобы сделать главным"
                    >
                        {item.type === 'video' ? (
                            <video src={item.preview} />
                        ) : (
                            <img src={item.preview} alt="upload" />
                        )}
                        <button className={style.deleteBtn} onClick={(e) => { e.stopPropagation(); handleRemoveMedia(item.id); }}>
                            <TrashIcon />
                        </button>
                    </div>
                ))}

                {mediaItems.length < 10 && (
                    <label className={style.uploadBtn}>
                        <AddIcon />
                        <span>{t('common.add', 'Добавить')}</span>
                        <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} />
                    </label>
                )}
            </div>
            {mediaItems.length > 0 && <p className={style.mediaHint}>{t('additionalProfile.dragAndDropHelpText', 'Нажмите на фото, чтобы сделать его главным. Добавьте фото себя с животными, вашего дома или условий содержания.')}</p>}

            {/* INFO FORM */}
            <div className={style.sectionTitle} style={{ marginTop: 30 }}>{t('additionalProfile.mainInfoCardTitle', 'Основная информация')}</div>

            <div className={style.formGroup}>
                <label>
                    {t('additionalProfile.titleLabel', 'Заголовок профиля')} <span>*</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '8px', lineHeight: '1.4' }}>
                    {t('additionalProfile.titleHint', 'Придумайте короткий и яркий слоган. Это первое, что увидят клиенты в поиске рядом с вашим фото. Например: "Заботливая няня в центре" или "Активные прогулки для вашего пса".')}
                </p>
                <input
                    className={`${style.input} ${errors.title ? style.error : ''}`}
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                    placeholder={t('additionalProfile.titlePlaceholder', 'Например: Опытный догситтер, ваш питомец будет счастлив!')}
                    maxLength={75}
                />
                {errors.title && <div className={style.errorText}>{errors.title}</div>}
            </div>

            <div className={style.formGroup}>
                <label>
                    {t('additionalProfile.descriptionLabel', 'О себе')} <span>*</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '8px', lineHeight: '1.4' }}>
                    {t('additionalProfile.descriptionHint', 'Подробно расскажите о своем опыте. Укажите, в каких условиях будет жить питомец (квартира/дом), есть ли рядом парки. Напишите о своем графике (работаете дома или в офисе). Чем больше деталей, тем больше доверия!')}
                </p>
                <textarea
                    className={`${style.textarea} ${errors.description ? style.error : ''}`}
                    value={description}
                    onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                    placeholder={t('additionalProfile.descriptionPlaceholder', 'Привет! Меня зовут... Я обожаю собак и занимаюсь передержкой уже 2 года. Живу в просторной квартире рядом с парком...')}
                    maxLength={5000}
                    style={{ minHeight: '150px' }}
                />
                {errors.description && <div className={style.errorText}>{errors.description}</div>}
            </div>

            {/* ПОЛЕ АДРЕСА С АВТОКОМПЛИТОМ */}
            <div className={style.formGroup} style={{ position: 'relative' }}>
                <label>{t('additionalProfile.addressLabel', 'Ваш адрес')} <span>*</span></label>
                <input
                    className={`${style.input} ${errors.address ? style.error : ''}`}
                    value={address}
                    onChange={e => {
                        setAddress(e.target.value);
                        setErrors(p => ({ ...p, address: '' }));
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    // Задержка при блюре, чтобы клик по списку успел пройти
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={t('additionalProfile.addressPlaceholder', 'Например: м. Тверская, район Хамовники')}
                    autoComplete="off"
                />
                {errors.address && <div className={style.errorText}>{errors.address}</div>}

                {/* Выпадающий список подсказок */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10,
                        listStyle: 'none',
                        padding: 0,
                        marginTop: '4px'
                    }}>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #F7FAFC',
                                    fontSize: '0.95rem',
                                    color: '#1A202C'
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Предотвращаем потерю фокуса перед кликом
                                    setAddress(suggestion);
                                    setSuggestions([]);
                                    setShowSuggestions(false);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={style.formGroup}>
                <label>{t('additionalProfile.careExperienceLabel', 'Опыт работы с животными (лет)')} <span>*</span></label>
                <input
                    className={`${style.input} ${errors.care_experience ? style.error : ''}`}
                    value={careExperience}
                    onChange={e => { setCareExperience(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, care_experience: '' })); }}
                    placeholder="0"
                    maxLength={2}
                    style={{ width: 100 }}
                />
                {errors.care_experience && <div className={style.errorText}>{errors.care_experience}</div>}
            </div>

            {/* CONDITIONS */}
            <div className={style.sectionTitle} style={{ marginTop: 20 }}>{t('additionalProfile.additionalInfoCardTitle', 'Условия')}</div>

            <div className={style.switchRow}>
                <div className={style.switchInfo}>
                    <h4>{t('additionalProfile.childrenPresentLabel', 'Есть дети до 12 лет?')}</h4>
                    <p>{t('additionalProfile.childrenPresentHelpText', 'Важно для питомцев, которые боятся детей')}</p>
                </div>
                <label className={style.switch}>
                    <input type="checkbox" checked={childrenUnderTwelve} onChange={e => setChildrenUnderTwelve(e.target.checked)} />
                    <span className={style.slider}></span>
                </label>
            </div>

            <div className={style.switchRow}>
                <div className={style.switchInfo}>
                    <h4>{t('additionalProfile.constantSupervisionLabel', 'Постоянный присмотр 24/7?')}</h4>
                    <p>{t('additionalProfile.constantSupervisionHelpText', 'Включите, если вы работаете из дома или не оставляете питомца одного дольше чем на пару часов')}</p>
                </div>
                <label className={style.switch}>
                    <input type="checkbox" checked={constantSupervision} onChange={e => setConstantSupervision(e.target.checked)} />
                    <span className={style.slider}></span>
                </label>
            </div>

            <button className={style.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? t('loading', 'Отправка...') : t('additionalProfile.submitButtonText', 'Создать профиль')}
            </button>
            {loading && uploadProgress > 0 && (
                <div className={style.progress}>Загрузка медиа: {Math.round(uploadProgress * 100)}%</div>
            )}
        </div>
    );
};

export default StepProfile;