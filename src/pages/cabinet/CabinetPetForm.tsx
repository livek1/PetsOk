import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/CabinetPetForm.module.scss';
import {
    createPet,
    updatePet,
    getPetById,
    fetchBreeds,
    addBreed,
    deletePetPhoto,
    setPetAvatar,
    PetFile,
    Breed
} from '../../services/api';

// --- ИКОНКИ ---
interface IconProps { className?: string; }
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>;
const UploadIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const StarIcon = ({ filled }: { filled?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const ChevronDown = ({ className }: IconProps) => <svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#718096" strokeWidth="2"><path d="M1 1.5L6 6.5L11 1.5" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const DogIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 4.916-5 7 6.667-1.333 9 0 9 0" /><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 4.916 5 7-6.667-1.333-9 0-9 0" /><path d="M12 22v-3" /><path d="M8 8.5C8 8.5 7 11 6 13c-2.5 5 1 9 6 9s8.5-4 6-9c-1-2-2-4.5-2-4.5" /></svg>;
const CatIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21S3 17.9 3 13.44c0-1.2.43-2.37 1-3.44 0 0-1.82-6.42-.42-7 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z" /></svg>;


interface PetFormProps {
    mode: 'create' | 'edit';
}

const CabinetPetForm: React.FC<PetFormProps> = ({ mode }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation(); // Используем хук
    const { id } = useParams();
    const returnToOrderUuid = location.state?.returnToOrderUuid;
    const [loading, setLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting] = useState(false);

    // Медиа
    const [existingFiles, setExistingFiles] = useState<PetFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [avatarId, setAvatarId] = useState<number | null>(null);

    // Породы
    const [breedQuery, setBreedQuery] = useState('');
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [showBreeds, setShowBreeds] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [addingBreed, setAddingBreed] = useState(false);
    const breedInputRef = useRef<HTMLInputElement>(null);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            type_id: '1',
            name: '',
            breed_id: '',
            gender: '0',
            size_id: '3',
            year: '',
            month: '',
            sterilized: '0',
            vaccinated: '0',
            staying_home_alone: '0',
            kids_friendly: '0',
            dogs_friendly: '0',
            cats_friendly: '0',
            info_for_sitting: '',
            info_for_walking: ''
        }
    });

    const typeId = watch('type_id');

    // --- 1. ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => {
        if (mode === 'edit' && id) {
            getPetById(id).then(response => {
                const pet = response.data || response;

                const safeTypeId = pet.type?.data?.id || pet.type_id || 1;
                const safeBreedId = pet.breed?.data?.id || pet.breed_id || '';
                const safeSizeId = pet.size?.data?.id || pet.size_id || 3;

                // Gender: backend might return 'male'/'female' or 0/1
                const isMale =
                    (pet.gender_value && String(pet.gender_value).toLowerCase() === 'male') ||
                    pet.gender === 0 ||
                    pet.gender === '0';

                const safeGender = isMale ? '0' : '1';

                setValue('name', pet.name);
                setValue('type_id', String(safeTypeId));
                setValue('breed_id', String(safeBreedId));
                setBreedQuery(pet.breed?.data?.name || pet.breed?.name || '');

                setValue('gender', safeGender);
                setValue('year', String(pet.year || ''));
                setValue('month', String(pet.month || ''));
                setValue('size_id', String(safeSizeId));

                // Helper to map values to '0'|'1'|'2'
                const mapBool = (val: any) => val !== undefined && val !== null ? String(val) : '0';

                setValue('sterilized', mapBool(pet.sterilized_value ?? pet.sterilized));
                setValue('vaccinated', mapBool(pet.vaccinated_value ?? pet.vaccinated));
                setValue('staying_home_alone', mapBool(pet.staying_home_alone_value ?? pet.staying_home_alone));
                setValue('kids_friendly', mapBool(pet.kids_friendly_value ?? pet.kids_friendly));
                setValue('dogs_friendly', mapBool(pet.dogs_friendly_value ?? pet.dogs_friendly));
                setValue('cats_friendly', mapBool(pet.cats_friendly_value ?? pet.cats_friendly));

                setValue('info_for_sitting', pet.info_for_sitting || '');
                setValue('info_for_walking', pet.info_for_walking || '');

                const files = pet.files?.data || pet.media?.data || [];
                setExistingFiles(files);
                const currentAvatarId = pet.avatar?.data?.id || pet.avatar_id;
                if (currentAvatarId) setAvatarId(currentAvatarId);

                setLoading(false);
            }).catch((err) => {
                console.error(err);
                alert('Ошибка загрузки данных');
                navigate('/cabinet/pets');
            });
        }
    }, [mode, id, setValue, navigate]);

    // --- 2. ПОИСК ПОРОД ---
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (breedQuery.length > 1 && showBreeds) {
                setLoadingBreeds(true);
                try {
                    const res = await fetchBreeds(breedQuery, parseInt(typeId));
                    const data = Array.isArray(res) ? res : (res.data || []);
                    setBreeds(data);
                } catch (e) { console.error(e); }
                finally { setLoadingBreeds(false); }
            } else {
                setBreeds([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [breedQuery, typeId, showBreeds]);

    // --- 3. ОБРАБОТЧИКИ ФАЙЛОВ ---
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (existingFiles.length + newFiles.length + e.target.files.length > 10) {
                alert(t('petForm.maxPhotosReached', 'Максимум 10 фото'));
                return;
            }
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewFile = (index: number) => setNewFiles(prev => prev.filter((_, i) => i !== index));

    const removeExistingFile = async (fileId: number) => {
        if (window.confirm('Удалить фото?')) {
            try {
                await deletePetPhoto(fileId);
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                if (avatarId === fileId) setAvatarId(null);
            } catch (e) { alert('Ошибка удаления'); }
        }
    };

    const handleSetAvatar = async (fileId: number) => {
        if (mode === 'edit' && id) {
            try {
                await setPetAvatar(id, fileId);
                setAvatarId(fileId);
            } catch (e) { alert('Ошибка установки аватара'); }
        } else {
            // В режиме создания просто отмечаем локально, реальная привязка будет после сохранения
            // (Зависит от вашего API createPet, поддерживает ли оно выбор аватара сразу. 
            // Если нет — показываем алерт)
            alert('Сначала сохраните питомца, чтобы выбрать главное фото.');
        }
    };

    // --- 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    const handleBreedSelect = (breed: Breed) => {
        setValue('breed_id', String(breed.id));
        setBreedQuery(breed.name);
        setShowBreeds(false);
    };

    const handleAddCustomBreed = async () => {
        if (!breedQuery || addingBreed) return;
        setAddingBreed(true);
        try {
            const res = await addBreed({ query: breedQuery, typeId: parseInt(typeId) });
            const newBreed = res.data;
            if (newBreed && newBreed.id) {
                setValue('breed_id', String(newBreed.id));
                setBreedQuery(newBreed.name);
                setShowBreeds(false);
            }
        } catch (e) {
            console.error(e);
            alert('Не удалось добавить породу');
        } finally {
            setAddingBreed(false);
        }
    };

    const handleTypeChange = (val: string) => {
        setValue('type_id', val);
        setValue('breed_id', '');
        setBreedQuery('');
        setBreeds([]);
    };

    const handleBackClick = () => {
        if (returnToOrderUuid) {
            navigate(`/cabinet/orders/create?uuid=${returnToOrderUuid}`);
        } else {
            navigate('/cabinet/pets');
        }
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const payload = { ...data, breed_id: data.breed_id || null };
            if (mode === 'create') {
                await createPet(payload, newFiles);
            } else {
                await updatePet(id!, payload, newFiles);
            }

            // --- ЛОГИКА ВОЗВРАТА ---
            if (returnToOrderUuid) {
                // Если мы пришли из заказа, возвращаемся в него
                navigate(`/cabinet/orders/create?uuid=${returnToOrderUuid}`);
            } else {
                navigate('/cabinet/pets');
            }

        } catch (e: any) {
            console.error(e);
            alert('Ошибка сохранения. Проверьте обязательные поля.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={style.loadingState}>{t('loading')}</div>;

    return (
        <div className={style.formContainer}>
            <button className={style.backButton} onClick={handleBackClick}>
                <BackIcon /> {returnToOrderUuid ? 'Вернуться к созданию заказа' : t('common.backToProfile', 'Вернуться к питомцам')}
            </button>

            <div className={style.headerBlock}>
                <h1 className={style.pageTitle}>
                    {mode === 'create' ? t('petForm.titleAdd', 'Кого добавляем?') : t('petForm.titleEdit', 'Редактирование')}
                </h1>
                <p className={style.pageSubtitle}>
                    {t('petForm.subtitle', 'Заполните анкету, чтобы ситтер знал об особенностях вашего любимца.')}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

                {/* --- ТИП ПИТОМЦА --- */}
                <div className={style.typeSection}>
                    <div className={style.visualRadioGroup}>
                        <div
                            className={`${style.visualRadio} ${typeId === '1' ? style.active : ''}`}
                            onClick={() => handleTypeChange('1')}
                        >
                            <DogIcon />
                            <span>{t('petTypes.dog', 'Собака')}</span>
                            <input type="hidden" value="1" {...register('type_id')} />
                        </div>
                        <div
                            className={`${style.visualRadio} ${typeId === '2' ? style.active : ''}`}
                            onClick={() => handleTypeChange('2')}
                        >
                            <CatIcon />
                            <span>{t('petTypes.cat', 'Кошка')}</span>
                        </div>
                    </div>
                </div>

                {/* --- 1. ФОТОГРАФИИ --- */}
                <div className={style.card}>
                    <div className={style.cardHeader}>
                        <h2 className={style.sectionTitle}>{t('petForm.sectionPhotos', 'Фотографии')}</h2>
                        <span className={style.sectionHint}>{t('petForm.photoHint', 'Загрузите до 10 фото')}</span>
                    </div>

                    <div className={style.mediaGrid}>
                        {existingFiles.map(file => (
                            <div key={file.id} className={`${style.mediaItem} ${avatarId === file.id ? style.isAvatar : ''}`}>
                                <img src={file.preview_url || file.url} alt="Pet" />
                                <div className={style.mediaActions}>
                                    <button
                                        type="button"
                                        className={`${style.starBtn} ${avatarId === file.id ? style.active : ''}`}
                                        onClick={() => handleSetAvatar(file.id)}
                                        title="Сделать главным фото"
                                    >
                                        <StarIcon filled={avatarId === file.id} />
                                    </button>
                                    <button type="button" className={style.deleteBtn} onClick={() => removeExistingFile(file.id)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                                {avatarId === file.id && <span className={style.avatarLabel}>Главное</span>}
                            </div>
                        ))}

                        {newFiles.map((file, idx) => (
                            <div key={idx} className={style.mediaItem}>
                                <img src={URL.createObjectURL(file)} alt="New upload" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeNewFile(idx)}>
                                    <TrashIcon />
                                </button>
                                <span className={style.newBadge}>Новое</span>
                            </div>
                        ))}

                        {(existingFiles.length + newFiles.length < 10) && (
                            <label className={style.uploadBtn}>
                                <div className={style.uploadContent}>
                                    <UploadIcon />
                                    <span>{t('petForm.addPhoto', 'Загрузить')}</span>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={onFileSelect} />
                            </label>
                        )}
                    </div>
                    {existingFiles.length === 0 && newFiles.length === 0 && (
                        <p className={style.emptyPhotosMsg}>
                            {t('petForm.noPhotos', 'Фотографии повышают доверие ситтеров. Добавьте хотя бы одну!')}
                        </p>
                    )}
                </div>

                {/* --- 2. ДЕТАЛИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionDetails', 'Основная информация')}</h2>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelName', 'Кличка')} <span className={style.required}>*</span></label>
                            <input
                                className={`${style.input} ${errors.name ? style.errorInput : ''}`}
                                {...register('name', { required: true })}
                                placeholder={t('petForm.placeholderName', 'Как зовут питомца?')}
                            />
                            {errors.name && <span className={style.errorText}>Укажите кличку</span>}
                        </div>

                        {/* Порода с автокомплитом */}
                        <div className={style.formGroup} style={{ position: 'relative' }}>
                            <label>{t('petForm.labelBreed', 'Порода')} <span className={style.required}>*</span></label>
                            <input
                                ref={breedInputRef}
                                className={style.input}
                                value={breedQuery}
                                onChange={e => {
                                    setBreedQuery(e.target.value);
                                    setValue('breed_id', '');
                                    setShowBreeds(true);
                                }}
                                onFocus={() => setShowBreeds(true)}
                                onBlur={() => setTimeout(() => setShowBreeds(false), 200)}
                                placeholder={t('petForm.placeholderBreed', 'Начните вводить (например: Корги)')}
                                autoComplete="off"
                            />
                            {showBreeds && breedQuery.length > 0 && (
                                <ul className={style.suggestionsList}>
                                    {loadingBreeds ? (
                                        <li className={style.loadingItem}>Ищем...</li>
                                    ) : (
                                        <>
                                            {breeds.map(b => (
                                                <li key={b.id} onMouseDown={(e) => { e.preventDefault(); handleBreedSelect(b); }}>
                                                    {b.name}
                                                </li>
                                            ))}
                                            {!loadingBreeds && (
                                                <li className={style.addItem} onMouseDown={(e) => { e.preventDefault(); handleAddCustomBreed(); }}>
                                                    <PlusIcon /> {t('common.add', 'Добавить')} "{breedQuery}" {t('petForm.asNewBreed', 'как новую')}
                                                </li>
                                            )}
                                        </>
                                    )}
                                </ul>
                            )}
                            <input type="hidden" {...register('breed_id', { required: true })} />
                            {errors.breed_id && <span className={style.errorText}>{t('petForm.errorBreedRequired', 'Выберите породу из списка или добавьте новую')}</span>}
                            <span className={style.helperText}>{t('petForm.breedHelp', 'Если беспородный, напишите "Метис"')}</span>
                        </div>
                    </div>

                    <div className={style.grid2}>
                        {/* Пол - Сегментированный контроль */}
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelGender', 'Пол')} <span className={style.required}>*</span></label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <div className={style.segmentedControlSimple}>
                                        <button type="button" className={field.value === '0' ? style.active : ''} onClick={() => field.onChange('0')}>
                                            {t('common.male', 'Мальчик')}
                                        </button>
                                        <button type="button" className={field.value === '1' ? style.active : ''} onClick={() => field.onChange('1')}>
                                            {t('common.female', 'Девочка')}
                                        </button>
                                    </div>
                                )}
                            />
                        </div>

                        <div className={style.formGroup}>
                            <label>{t('petForm.labelSize', 'Размер')} <span className={style.required}>*</span></label>
                            <div className={style.selectWrapper}>
                                <select className={style.select} {...register('size_id')}>
                                    <option value="1">Мини (до 5 кг) — Чихуахуа, Йорк</option>
                                    <option value="2">Маленький (5-10 кг) — Мопс, Такса</option>
                                    <option value="3">Средний (10-20 кг) — Корги, Бигль</option>
                                    <option value="4">Большой (20-40 кг) — Лабрадор, Хаски</option>
                                    <option value="5">Гигант (40+ кг) — Дог, Мастиф</option>
                                </select>
                                <ChevronDown className={style.selectArrow} />
                            </div>
                        </div>
                    </div>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelAge', 'Возраст')}</label>
                        <div className={style.ageInputs}>
                            <div className={style.ageInputWrapper}>
                                <input type="number" className={style.input} {...register('year')} placeholder="0" min="0" max="30" />
                                <span className={style.ageLabel}>{t('common.years_short', 'лет')}</span>
                            </div>
                            <div className={style.ageInputWrapper}>
                                <input type="number" className={style.input} {...register('month')} placeholder="0" min="0" max="11" />
                                <span className={style.ageLabel}>{t('common.months_short', 'мес')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. ХАРАКТЕР (КНОПКИ) --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionBehavior', 'Здоровье и характер')}</h2>
                    <p className={style.sectionSubtitle}>{t('petForm.behaviorSubtitle', 'Честные ответы помогут подобрать идеального ситтера.')}</p>

                    <div className={style.behaviorGrid}>
                        <SegmentedControl
                            label={t('petForm.labelSterilized', 'Стерилизован?')}
                            name="sterilized" control={control} t={t}
                        />
                        <SegmentedControl
                            label={t('petForm.labelVaccinated', 'Вакцинирован?')}
                            name="vaccinated" control={control} t={t}
                        />
                        <SegmentedControl
                            label={t('petForm.labelHomeAlone', 'Остается один дома?')}
                            name="staying_home_alone" control={control} t={t}
                            sub={t('petForm.homeAloneSub', 'Не воет и не портит вещи')}
                        />
                        <SegmentedControl
                            label={t('petForm.labelKidsFriendly', 'Ладит с детьми?')}
                            name="kids_friendly" control={control} t={t}
                        />
                        <SegmentedControl
                            label={t('petForm.labelDogsFriendly', 'Дружелюбен к собакам?')}
                            name="dogs_friendly" control={control} t={t}
                        />
                        <SegmentedControl
                            label={t('petForm.labelCatsFriendly', 'Дружелюбен к кошкам?')}
                            name="cats_friendly" control={control} t={t}
                        />
                    </div>
                </div>

                {/* --- 4. ПОДРОБНОСТИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionAdditionalInfo', 'Особенности ухода')}</h2>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelInfoSitting', 'Важно для передержки (дома у ситтера)')} <span className={style.required}>*</span></label>
                        <div className={style.tipsBlock}>
                            <InfoIcon />
                            <span>
                                {typeId === '1'
                                    ? "Опишите: режим кормления, аллергии, где привык спать, можно ли на диван, как терпит туалет?"
                                    : "Опишите: какой лоток используете, режим кормления, дерет ли мебель, любит играть или прятаться?"}
                            </span>
                        </div>
                        <textarea
                            className={style.textarea}
                            {...register('info_for_sitting', { required: true })}
                            placeholder={t('petForm.placeholderInfoSitting', 'Например: Ест сухой корм 2 раза в день. Спит на своей лежанке. Боится громких звуков.')}
                        />
                        {errors.info_for_sitting && <span className={style.errorText}>{t('validation.fieldRequired', 'Пожалуйста, напишите пару слов о привычках')}</span>}
                    </div>

                    {typeId === '1' && (
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelInfoWalking', 'Важно для выгула')} <span className={style.required}>*</span></label>
                            <p className={style.helperText} style={{ marginBottom: 8 }}>
                                Как гуляет? Тянет поводок? Знает команды? Подбирает с земли?
                            </p>
                            <textarea
                                className={style.textarea}
                                {...register('info_for_walking', { required: true })}
                                placeholder={t('petForm.placeholderInfoWalking', 'Например: Гуляем 2 раза по 30 мин. На поводке ходит спокойно. Не любит больших собак.')}
                            />
                            {errors.info_for_walking && <span className={style.errorText}>{t('validation.fieldRequired', 'Опишите нюансы прогулки')}</span>}
                        </div>
                    )}
                </div>

                <div className={style.actions}>
                    <button type="submit" disabled={submitting} className={style.btnPrimary}>
                        {submitting ? t('loading') : t('common.save', 'Сохранить питомца')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Компонент переключателя (Да/Нет/Не знаю)
const SegmentedControl = ({ label, sub, name, control, t }: any) => (
    <div className={style.segmentRow}>
        <div className={style.segmentLabel}>
            {label}
            {sub && <span className={style.subLabel}>{sub}</span>}
        </div>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className={style.segmentedControl}>
                    <button
                        type="button"
                        className={field.value === '1' ? style.yes : ''}
                        onClick={() => field.onChange('1')}
                    >
                        {t('common.yes', 'Да')}
                    </button>
                    <button
                        type="button"
                        className={field.value === '2' ? style.no : ''}
                        onClick={() => field.onChange('2')}
                    >
                        {t('common.no', 'Нет')}
                    </button>
                    <button
                        type="button"
                        className={field.value === '0' ? style.unknown : ''}
                        onClick={() => field.onChange('0')}
                    >
                        {t('common.unknown', 'Не знаю')}
                    </button>
                </div>
            )}
        />
    </div>
);

export default CabinetPetForm;