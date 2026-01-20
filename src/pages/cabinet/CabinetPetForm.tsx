import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
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

// Иконки SVG
interface IconProps {
    className?: string;
}
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const TrashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>;
const UploadIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
// FIX: ChevronDown now accepts props
const ChevronDown = ({ className }: IconProps) => <svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#718096" strokeWidth="2"><path d="M1 1.5L6 6.5L11 1.5" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

interface PetFormProps {
    mode: 'create' | 'edit';
}

const CabinetPetForm: React.FC<PetFormProps> = ({ mode }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting] = useState(false);

    // Медиа
    const [existingFiles, setExistingFiles] = useState<PetFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [avatarId, setAvatarId] = useState<number | null>(null);

    // Породы (Логика поиска)
    const [breedQuery, setBreedQuery] = useState('');
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [showBreeds, setShowBreeds] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [addingBreed, setAddingBreed] = useState(false);
    const breedInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            type_id: '1', // 1 - dog, 2 - cat
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

    // 1. Загрузка данных при редактировании
    useEffect(() => {
        if (mode === 'edit' && id) {
            getPetById(id).then(response => {
                const pet = response.data || response;

                const safeTypeId = pet.type?.data?.id || pet.type_id || 1;
                const safeBreedId = pet.breed?.data?.id || pet.breed_id || '';
                const safeSizeId = pet.size?.data?.id || pet.size_id || 3;

                // Gender logic (0 - male, 1 - female)
                const safeGender = pet.gender_value !== undefined
                    ? (String(pet.gender_value) === 'male' ? '0' : '1')
                    : String(pet.gender ?? '0');

                setValue('name', pet.name);
                setValue('type_id', String(safeTypeId));
                setValue('breed_id', String(safeBreedId));
                setBreedQuery(pet.breed?.data?.name || pet.breed?.name || '');

                setValue('gender', safeGender);
                setValue('year', String(pet.year || ''));
                setValue('month', String(pet.month || ''));
                setValue('size_id', String(safeSizeId));

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
                alert('Ошибка загрузки данных питомца');
                navigate('/cabinet/pets');
            });
        }
    }, [mode, id, setValue, navigate]);

    // 2. Логика поиска пород
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (breedQuery.length > 1 && showBreeds) {
                setLoadingBreeds(true);
                try {
                    const res = await fetchBreeds(breedQuery, parseInt(typeId));
                    const data = Array.isArray(res) ? res : (res.data || []);
                    setBreeds(data);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingBreeds(false);
                }
            } else {
                setBreeds([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [breedQuery, typeId, showBreeds]);

    // 3. Обработчики файлов
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (existingFiles.length + newFiles.length + e.target.files.length > 10) {
                alert(t('petForm.maxPhotosReached', 'Максимум 10 фото'));
                return;
            }
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = async (fileId: number) => {
        if (window.confirm('Удалить фото?')) {
            try {
                await deletePetPhoto(fileId);
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                if (avatarId === fileId) setAvatarId(null);
            } catch (e) {
                alert('Ошибка удаления');
            }
        }
    };

    const setAvatar = async (fileId: number) => {
        if (mode === 'edit' && id) {
            try {
                await setPetAvatar(id, fileId);
                setAvatarId(fileId);
            } catch (e) {
                alert('Ошибка установки аватара');
            }
        } else {
            alert('Сначала сохраните питомца, чтобы выбрать главное фото.');
        }
    };

    // 4. Выбор породы
    const handleBreedSelect = (breed: Breed) => {
        setValue('breed_id', String(breed.id));
        setBreedQuery(breed.name);
        setShowBreeds(false);
    };

    // 5. Добавление своей породы
    const handleAddCustomBreed = async () => {
        if (!breedQuery || addingBreed) return;
        setAddingBreed(true);
        try {
            const res = await addBreed({ query: breedQuery, typeId: parseInt(typeId) });
            // API возвращает { status: 'success', data: { id: ..., name: ... } } или подобное
            // Проверяем структуру ответа (в вашем API это response.data.data)
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

    // 6. Отправка формы
    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const payload = {
                ...data,
                breed_id: data.breed_id || null,
            };

            if (mode === 'create') {
                await createPet(payload, newFiles);
            } else {
                await updatePet(id!, payload, newFiles);
            }
            navigate('/cabinet/pets');
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.message || e.message || 'Ошибка сохранения';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('type_id', e.target.value);
        setValue('breed_id', '');
        setBreedQuery('');
        setBreeds([]);
    };

    if (loading) return <div className={style.loadingState}>{t('loading')}</div>;

    return (
        <div className={style.formContainer}>
            <button className={style.backButton} onClick={() => navigate('/cabinet/pets')}>
                <BackIcon /> {t('common.backToProfile', 'Назад')}
            </button>

            <h1 className={style.pageTitle}>
                {mode === 'create' ? t('petForm.titleAdd', 'Добавить питомца') : t('petForm.titleEdit', 'Редактировать')}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>

                {/* --- 1. ФОТОГРАФИИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionPhotos', 'Фотографии')}</h2>

                    <div className={style.infoBox}>
                        <InfoIcon />
                        <p>{t('petForm.photoInstructionExtended', 'Рекомендуем добавить четкий портрет и фото в полный рост.')}</p>
                    </div>

                    <div className={style.mediaGrid}>
                        {existingFiles.map(file => (
                            <div key={file.id} className={`${style.mediaItem} ${avatarId === file.id ? style.isAvatar : ''}`}>
                                <img src={file.preview_url || file.url} alt="Pet" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeExistingFile(file.id)}>
                                    <TrashIcon />
                                </button>
                                {avatarId === file.id && <div className={style.avatarBadge}><StarIcon /></div>}
                                {avatarId !== file.id && (
                                    <button type="button" className={style.makeAvatarBtn} onClick={() => setAvatar(file.id)}>
                                        Главная
                                    </button>
                                )}
                            </div>
                        ))}

                        {newFiles.map((file, idx) => (
                            <div key={idx} className={style.mediaItem}>
                                <img src={URL.createObjectURL(file)} alt="New upload" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeNewFile(idx)}>
                                    <TrashIcon />
                                </button>
                                <span className={style.newBadge}>New</span>
                            </div>
                        ))}

                        {(existingFiles.length + newFiles.length < 10) && (
                            <label className={style.uploadBtn}>
                                <UploadIcon />
                                <span>{t('petForm.addPhoto', 'Добавить')}</span>
                                <input type="file" multiple accept="image/*" onChange={onFileSelect} />
                            </label>
                        )}
                    </div>
                </div>

                {/* --- 2. ДЕТАЛИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionDetails', 'Детали питомца')}</h2>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelPetType', 'Тип питомца')} <span className={style.required}>*</span></label>
                        <div className={style.radioGroup}>
                            <label className={typeId === '1' ? style.active : ''}>
                                <input type="radio" value="1" {...register('type_id')} onChange={handleTypeChange} />
                                {t('petTypes.dog', 'Собака')}
                            </label>
                            <label className={typeId === '2' ? style.active : ''}>
                                <input type="radio" value="2" {...register('type_id')} onChange={handleTypeChange} />
                                {t('petTypes.cat', 'Кошка')}
                            </label>
                        </div>
                    </div>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelName', 'Кличка')} <span className={style.required}>*</span></label>
                            <input
                                className={`${style.input} ${errors.name ? style.errorInput : ''}`}
                                {...register('name', { required: true })}
                                placeholder={t('petForm.placeholderName', 'Например, Бобик')}
                            />
                            {errors.name && <span className={style.errorText}>{t('petForm.errorNameRequired')}</span>}
                        </div>

                        {/* ВЫБОР ПОРОДЫ С АВТОКОМПЛИТОМ И ДОБАВЛЕНИЕМ */}
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
                                // Используем setTimeout, чтобы клик по списку успел пройти до onBlur
                                onBlur={() => setTimeout(() => setShowBreeds(false), 200)}
                                placeholder={t('petForm.placeholderSelectBreed', 'Начните вводить...')}
                                autoComplete="off"
                            />
                            {/* Выпадающий список */}
                            {showBreeds && breedQuery.length > 0 && (
                                <ul className={style.suggestionsList}>
                                    {loadingBreeds ? (
                                        <li className={style.loadingItem}>Загрузка...</li>
                                    ) : (
                                        <>
                                            {breeds.map(b => (
                                                <li key={b.id} onMouseDown={(e) => { e.preventDefault(); handleBreedSelect(b); }}>
                                                    {b.name}
                                                </li>
                                            ))}
                                            {/* Пункт "Добавить как новую" */}
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
                            {errors.breed_id && <span className={style.errorText}>{t('petForm.errorBreedRequired')}</span>}
                        </div>
                    </div>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelGender', 'Пол')} <span className={style.required}>*</span></label>
                            <div className={style.selectWrapper}>
                                <select className={style.select} {...register('gender')}>
                                    <option value="0">{t('common.male', 'Мальчик')}</option>
                                    <option value="1">{t('common.female', 'Девочка')}</option>
                                </select>
                                <ChevronDown className={style.selectArrow} />
                            </div>
                        </div>

                        <div className={style.formGroup}>
                            <label>{t('petForm.labelSize', 'Размер')} <span className={style.required}>*</span></label>
                            <div className={style.selectWrapper}>
                                <select className={style.select} {...register('size_id')}>
                                    <option value="1">{t('petSizes.mini.name')} ({t('petSizes.mini.description')})</option>
                                    <option value="2">{t('petSizes.small.name')} ({t('petSizes.small.description')})</option>
                                    <option value="3">{t('petSizes.medium.name')} ({t('petSizes.medium.description')})</option>
                                    <option value="4">{t('petSizes.big.name')} ({t('petSizes.big.description')})</option>
                                    <option value="5">{t('petSizes.huge.name')} ({t('petSizes.huge.description')})</option>
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

                {/* --- 3. ХАРАКТЕР --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionBehavior', 'Характер и привычки')}</h2>
                    <div className={style.grid2}>
                        <YesNoSelect label={t('petForm.labelSterilized', 'Стерилизован?')} name="sterilized" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelVaccinated', 'Вакцинирован?')} name="vaccinated" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelHomeAlone', 'Остается один?')} name="staying_home_alone" sub={t('petForm.homeAloneSub')} register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelKidsFriendly', 'Ладит с детьми?')} name="kids_friendly" sub={t('petForm.kidsFriendlySub')} register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelDogsFriendly', 'Ладит с собаками?')} name="dogs_friendly" sub={t('petForm.dogsFriendlySub')} register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelCatsFriendly', 'Ладит с кошками?')} name="cats_friendly" sub={t('petForm.catsFriendlySub')} register={register} t={t} />
                    </div>
                </div>

                {/* --- 4. ДОП ИНФО --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionAdditionalInfo', 'Дополнительно')}</h2>
                    <p className={style.sectionSubtitle}>{t('petForm.additionalInfoHelp')}</p>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelInfoSitting', 'Для передержки')} <span className={style.required}>*</span></label>
                        <textarea
                            className={style.textarea}
                            {...register('info_for_sitting', { required: true })}
                            placeholder={t('petForm.placeholderInfoSitting', 'Питание, привычки...')}
                        />
                        {errors.info_for_sitting && <span className={style.errorText}>{t('validation.fieldRequired', 'Обязательное поле')}</span>}
                    </div>

                    {typeId === '1' && (
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelInfoWalking', 'Для выгула')} <span className={style.required}>*</span></label>
                            <textarea
                                className={style.textarea}
                                {...register('info_for_walking', { required: true })}
                                placeholder={t('petForm.placeholderInfoWalking', 'Поводок, команды...')}
                            />
                            {errors.info_for_walking && <span className={style.errorText}>{t('validation.fieldRequired', 'Обязательное поле')}</span>}
                        </div>
                    )}
                </div>

                <div className={style.actions}>
                    <button type="submit" disabled={submitting} className={style.btnPrimary}>
                        {submitting ? t('loading') : t('common.save', 'Сохранить')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const YesNoSelect = ({ label, sub, name, register, t }: any) => (
    <div className={style.formGroup}>
        <label>
            {label} <span className={style.required}>*</span>
            {sub && <span className={style.subLabel}>{sub}</span>}
        </label>
        <div className={style.selectWrapper}>
            <select className={style.select} {...register(name)}>
                <option value="0">{t('common.unknown', 'Не знаю')}</option>
                <option value="1">{t('common.yes', 'Да')}</option>
                <option value="2">{t('common.no', 'Нет')}</option>
            </select>
            <ChevronDown className={style.selectArrow} />
        </div>
    </div>
);

export default CabinetPetForm;