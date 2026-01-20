// --- File: src/pages/cabinet/CabinetPetForm.tsx ---
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/CabinetPetForm.module.scss';
import {
    createPet, updatePet, getPetById, fetchBreeds, PetFile, Breed, deleteFile, setPetAvatar
} from '../../services/api';

// Иконки
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const UploadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;

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

    // Породы
    const [breedQuery, setBreedQuery] = useState('');
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [showBreeds, setShowBreeds] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            type_id: '1', // 1 - dog, 2 - cat. Строка для radio.
            name: '',
            breed_id: '',
            breed_name: '',
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

    // Загрузка данных при редактировании
    useEffect(() => {
        if (mode === 'edit' && id) {
            getPetById(id).then(pet => {
                // --- ИСПРАВЛЕНИЕ: Безопасное получение ID из вложенных структур ---
                const safeTypeId = pet.type?.data?.id || pet.type_id || 1;
                const safeBreedId = pet.breed?.data?.id || pet.breed_id || '';
                const safeSizeId = pet.size?.data?.id || pet.size_id || 3;

                // Используем _value поля из JSON, если они есть, иначе основные поля
                const safeGender = pet.gender_value !== undefined ? String(pet.gender_value) : String(pet.gender ?? '0');
                const safeSterilized = pet.sterilized_value ?? pet.sterilized ?? 0;
                const safeVaccinated = pet.vaccinated_value ?? pet.vaccinated ?? 0;
                const safeHomeAlone = pet.staying_home_alone_value ?? pet.staying_home_alone ?? 0;
                const safeKids = pet.kids_friendly_value ?? pet.kids_friendly ?? 0;
                const safeDogs = pet.dogs_friendly_value ?? pet.dogs_friendly ?? 0;
                const safeCats = pet.cats_friendly_value ?? pet.cats_friendly ?? 0;

                setValue('name', pet.name);
                setValue('type_id', String(safeTypeId)); // Radio input value must be string
                setValue('breed_id', String(safeBreedId));
                setValue('breed_name', pet.breed?.data?.name || '');
                setBreedQuery(pet.breed?.data?.name || '');
                setValue('gender', safeGender);
                setValue('year', String(pet.year || ''));
                setValue('month', String(pet.month || ''));
                setValue('size_id', String(safeSizeId));

                setValue('sterilized', String(safeSterilized));
                setValue('vaccinated', String(safeVaccinated));
                setValue('staying_home_alone', String(safeHomeAlone));
                setValue('kids_friendly', String(safeKids));
                setValue('dogs_friendly', String(safeDogs));
                setValue('cats_friendly', String(safeCats));

                setValue('info_for_sitting', pet.info_for_sitting || '');
                setValue('info_for_walking', pet.info_for_walking || '');

                // Файлы
                const files = pet.files?.data || pet.media?.data || [];
                setExistingFiles(files);
                // Аватар берем из avatar.data.id или avatar_id
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

    // Поиск пород
    useEffect(() => {
        const timer = setTimeout(async () => {
            // Ищем только если есть ввод и он отличается от текущего ID (чтобы не искать уже выбранное)
            if (breedQuery.length > 1 && showBreeds) {
                try {
                    const res = await fetchBreeds(breedQuery, parseInt(typeId));
                    setBreeds(res);
                } catch (e) {
                    console.error(e);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [breedQuery, typeId, showBreeds]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = async (fileId: number) => {
        if (window.confirm('Удалить фото?')) {
            try {
                await deleteFile(fileId);
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                if (avatarId === fileId) setAvatarId(null);
            } catch (e) {
                alert('Ошибка удаления');
            }
        }
    };

    const setAvatar = async (fileId: number) => {
        if (mode === 'edit' && id) {
            await setPetAvatar(id, fileId);
            setAvatarId(fileId);
        } else {
            alert('Сначала сохраните питомца');
        }
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const payload = {
                ...data,
                // Если breed_id пустой, но есть breed_name, возможно, стоит отправить его как имя?
                // Но обычно API требует ID.
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

    const handleBreedSelect = (breed: Breed) => {
        setValue('breed_id', String(breed.id));
        setBreedQuery(breed.name);
        setShowBreeds(false);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={style.formContainer}>
            <button className={style.backButton} onClick={() => navigate('/cabinet/pets')}>
                <BackIcon /> Назад к списку
            </button>

            <h1 className={style.pageTitle}>{mode === 'create' ? t('petForm.titleAdd', 'Добавить питомца') : t('petForm.titleEdit', 'Редактировать')}</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* 1. Основное */}
                <div className={style.card}>
                    <h2>{t('petForm.sectionDetails', 'Детали')}</h2>
                    <div className={style.formGroup}>
                        <label>{t('petForm.labelPetType', 'Тип')} <span className={style.required}>*</span></label>
                        <div className={style.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    value="1"
                                    {...register('type_id')}
                                    onChange={(e) => {
                                        // При смене типа сбрасываем породу
                                        setValue('type_id', e.target.value);
                                        setValue('breed_id', '');
                                        setBreedQuery('');
                                    }}
                                />
                                {t('petTypes.dog', 'Собака')}
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="2"
                                    {...register('type_id')}
                                    onChange={(e) => {
                                        setValue('type_id', e.target.value);
                                        setValue('breed_id', '');
                                        setBreedQuery('');
                                    }}
                                />
                                {t('petTypes.cat', 'Кошка')}
                            </label>
                        </div>
                    </div>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelName', 'Кличка')} <span className={style.required}>*</span></label>
                            <input className={style.input} {...register('name', { required: true })} placeholder="Бобик" />
                            {errors.name && <span className={style.errorText}>Обязательно</span>}
                        </div>

                        <div className={style.formGroup} style={{ position: 'relative' }}>
                            <label>{t('petForm.labelBreed', 'Порода')}</label>
                            <input
                                className={style.input}
                                value={breedQuery}
                                onChange={e => {
                                    setBreedQuery(e.target.value);
                                    setShowBreeds(true);
                                    // Если юзер меняет текст, сбрасываем ID, чтобы заставить выбрать из списка
                                    setValue('breed_id', '');
                                }}
                                placeholder="Начните вводить..."
                                onFocus={() => setShowBreeds(true)}
                            // onBlur={() => setTimeout(() => setShowBreeds(false), 200)} // Задержка для клика
                            />
                            {/* Выпадающий список */}
                            {showBreeds && breeds.length > 0 && (
                                <ul className={style.suggestionsList}>
                                    {breeds.map(b => (
                                        <li key={b.id} onMouseDown={() => handleBreedSelect(b)}>{b.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelGender', 'Пол')}</label>
                            <select className={style.select} {...register('gender')}>
                                <option value="0">{t('common.male', 'Мальчик')}</option>
                                <option value="1">{t('common.female', 'Девочка')}</option>
                            </select>
                        </div>

                        <div className={style.formGroup}>
                            <label>{t('petForm.labelSize', 'Размер')}</label>
                            <select className={style.select} {...register('size_id')}>
                                <option value="1">{t('petSizes.mini.name', 'Мини (до 5кг)')}</option>
                                <option value="2">{t('petSizes.small.name', 'Маленький (5-10кг)')}</option>
                                <option value="3">{t('petSizes.medium.name', 'Средний (10-20кг)')}</option>
                                <option value="4">{t('petSizes.big.name', 'Большой (20-40кг)')}</option>
                                <option value="5">{t('petSizes.huge.name', 'Гигант (40+кг)')}</option>
                            </select>
                        </div>
                    </div>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelAge', 'Возраст')}</label>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="number" className={style.input} {...register('year')} placeholder="0" style={{ width: '80px' }} />
                            <span>{t('common.years_short', 'лет')}</span>
                            <input type="number" className={style.input} {...register('month')} placeholder="0" style={{ width: '80px' }} />
                            <span>{t('common.months_short', 'мес')}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Медиа */}
                <div className={style.card}>
                    <h2>{t('petForm.sectionPhotos', 'Фотографии')}</h2>
                    <div className={style.mediaGrid}>
                        {/* Существующие фото */}
                        {existingFiles.map(file => (
                            <div key={file.id} className={`${style.mediaItem} ${avatarId === file.id ? style.isAvatar : ''}`}>
                                <img src={file.preview_url || file.url} alt="Pet" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeExistingFile(file.id)}>
                                    <TrashIcon />
                                </button>
                                {avatarId !== file.id && (
                                    <button type="button" className={style.setAvatarBtn} onClick={() => setAvatar(file.id)}>
                                        Сделать главной
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Новые фото (превью) */}
                        {newFiles.map((file, idx) => (
                            <div key={idx} className={style.mediaItem}>
                                <img src={URL.createObjectURL(file)} alt="New" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeNewFile(idx)}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}

                        <label className={style.uploadBtn}>
                            <UploadIcon />
                            <span>Добавить</span>
                            <input type="file" multiple accept="image/*" onChange={onFileSelect} />
                        </label>
                    </div>
                </div>

                {/* 3. Характер */}
                <div className={style.card}>
                    <h2>{t('petForm.sectionBehavior', 'Характер и привычки')}</h2>

                    <div className={style.grid2}>
                        <YesNoSelect label={t('petForm.labelSterilized', 'Стерилизован?')} name="sterilized" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelVaccinated', 'Вакцинирован?')} name="vaccinated" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelHomeAlone', 'Остается один?')} name="staying_home_alone" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelKidsFriendly', 'Ладит с детьми?')} name="kids_friendly" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelDogsFriendly', 'Ладит с собаками?')} name="dogs_friendly" register={register} t={t} />
                        <YesNoSelect label={t('petForm.labelCatsFriendly', 'Ладит с кошками?')} name="cats_friendly" register={register} t={t} />
                    </div>
                </div>

                {/* 4. Инфо */}
                <div className={style.card}>
                    <h2>{t('petForm.sectionAdditionalInfo', 'Дополнительно')}</h2>
                    <div className={style.formGroup}>
                        <label>{t('petForm.labelInfoSitting', 'Для передержки')}</label>
                        <textarea className={style.textarea} {...register('info_for_sitting')} placeholder="Особенности питания, выгула..." />
                    </div>
                    {typeId === '1' && (
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelInfoWalking', 'Для выгула')}</label>
                            <textarea className={style.textarea} {...register('info_for_walking')} placeholder="Тянет поводок, боится машин..." />
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

// Хелпер для Yes/No/Unknown селектов
const YesNoSelect = ({ label, name, register, t }: any) => (
    <div className={style.formGroup}>
        <label>{label}</label>
        <select className={style.select} {...register(name)}>
            <option value="0">{t('common.unknown', 'Не знаю')}</option>
            <option value="1">{t('common.yes', 'Да')}</option>
            <option value="2">{t('common.no', 'Нет')}</option>
        </select>
    </div>
);

export default CabinetPetForm;