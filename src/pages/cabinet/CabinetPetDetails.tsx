import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/CabinetPetForm.module.scss';
import { getPetById, deletePet, Pet } from '../../services/api';
import { getAgeString } from './CabinetPets';

// --- ИКОНКИ ---
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const CrossIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const QuestionIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const MaleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M16.5 7.5l0 4" /><path d="M16.5 7.5l-4 0" /><path d="M11.5 12.5l5 -5" /></svg>; // Simplified logic
const FemaleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 11m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 16l0 5" /><path d="M9 19l6 0" /></svg>; // Simplified logic
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const WalkIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"></path></svg>; // Abstract leash/wheel

const CabinetPetDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pet, setPet] = useState<Pet | null>(null);

    useEffect(() => {
        if (id) {
            getPetById(id).then(response => {
                setPet(response.data || response);
            }).catch(console.error);
        }
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm(t('common.confirmDelete', 'Вы уверены, что хотите удалить карточку питомца? Это действие нельзя отменить.'))) {
            try {
                await deletePet(id!);
                navigate('/cabinet/pets');
            } catch (e) {
                alert('Ошибка удаления');
            }
        }
    };

    if (!pet) return <div className={style.loadingState}>{t('loading')}</div>;

    // Подготовка данных
    const typeName = pet.type?.data?.name || (pet.type_id === 1 ? t('petTypes.dog') : t('petTypes.cat'));
    const breedName = pet.breed?.data?.name || t('common.unknownBreed', 'Метис / Другая');
    const sizeName = pet.size?.data?.name || t('common.unknown', 'Не указан');
    const isMale = pet.gender === 0 || pet.gender === '0' || String(pet.gender_value).toLowerCase() === 'male';

    // Рендер статуса (Да/Нет/Не знаю)
    const renderStatus = (label: string, value: any) => {
        const val = Number(value); // 0=Unknown, 1=Yes, 2=No
        let icon = <QuestionIcon />;
        let statusClass = style.statusUnknown;
        let text = t('common.unknown', 'Не знаю');

        if (val === 1) {
            icon = <CheckIcon />;
            statusClass = style.statusYes;
            text = t('common.yes', 'Да');
        } else if (val === 2) {
            icon = <CrossIcon />;
            statusClass = style.statusNo;
            text = t('common.no', 'Нет');
        }

        return (
            <div className={`${style.statusItem} ${statusClass}`}>
                <div className={style.statusIcon}>{icon}</div>
                <div className={style.statusText}>
                    <span className={style.statusLabel}>{label}</span>
                    <span className={style.statusValue}>{text}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={style.formContainer}>
            {/* Навигация */}
            <div className={style.topNav}>
                <Link to="/cabinet/pets" className={style.backButton}>
                    <BackIcon /> {t('common.back', 'Назад')}
                </Link>
                <div className={style.topActions}>
                    <Link to={`/cabinet/pets/${id}/edit`} className={style.btnIconPrimary} title={t('common.edit')}>
                        <EditIcon />
                    </Link>
                    <button onClick={handleDelete} className={style.btnIconDelete} title={t('common.delete')}>
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {/* --- 1. ГЛАВНАЯ КАРТОЧКА (HERO) --- */}
            <div className={style.card}>
                <div className={style.heroContent}>
                    <div className={style.heroAvatar}>
                        <img
                            src={pet.avatar?.data?.preview_url || pet.avatar?.data?.url || '/placeholder-pet.jpg'}
                            alt={pet.name}
                        />
                    </div>
                    <div className={style.heroInfo}>
                        <div className={style.heroHeader}>
                            <h1 className={style.heroName}>{pet.name}</h1>
                            <span className={style.heroBreed}>{breedName}</span>
                        </div>

                        <div className={style.tagsRow}>
                            <span className={`${style.tag} ${isMale ? style.tagBlue : style.tagPink}`}>
                                {isMale ? <MaleIcon /> : <FemaleIcon />}
                                {isMale ? t('common.male', 'Мальчик') : t('common.female', 'Девочка')}
                            </span>
                            <span className={style.tag}>
                                {getAgeString(pet.year, pet.month, t)}
                            </span>
                            <span className={style.tag}>
                                {sizeName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. ХАРАКТЕРИСТИКИ (GRID) --- */}
            <div className={style.card}>
                <h2 className={style.sectionTitle}>{t('petForm.sectionBehavior', 'Здоровье и характер')}</h2>
                <div className={style.statusGrid}>
                    {/* Здоровье */}
                    {renderStatus(t('petForm.labelSterilized', 'Стерилизован'), pet.sterilized_value ?? pet.sterilized)}
                    {renderStatus(t('petForm.labelVaccinated', 'Вакцинирован'), pet.vaccinated_value ?? pet.vaccinated)}

                    {/* Социализация */}
                    {renderStatus(t('petForm.labelKidsFriendly', 'Ладит с детьми'), pet.kids_friendly_value ?? pet.kids_friendly)}
                    {renderStatus(t('petForm.labelDogsFriendly', 'Ладит с собаками'), pet.dogs_friendly_value ?? pet.dogs_friendly)}
                    {renderStatus(t('petForm.labelCatsFriendly', 'Ладит с кошками'), pet.cats_friendly_value ?? pet.cats_friendly)}
                    {renderStatus(t('petForm.labelHomeAlone', 'Остается один'), pet.staying_home_alone_value ?? pet.staying_home_alone)}
                </div>
            </div>

            {/* --- 3. ПОДРОБНАЯ ИНФОРМАЦИЯ --- */}
            <div className={style.card}>
                <h2 className={style.sectionTitle}>{t('petForm.sectionAdditionalInfo', 'Особенности ухода')}</h2>

                <div className={style.infoBlockWrapper}>
                    {/* Для передержки */}
                    <div className={style.infoBlock}>
                        <div className={style.infoBlockHeader}>
                            <div className={style.infoIconBg}><HomeIcon /></div>
                            <h3>{t('petForm.labelInfoSitting', 'Дома у ситтера')}</h3>
                        </div>
                        <div className={style.infoContent}>
                            {pet.info_for_sitting ? (
                                <p>{pet.info_for_sitting}</p>
                            ) : (
                                <span className={style.emptyText}>{t('common.noInfo', 'Информация не указана')}</span>
                            )}
                        </div>
                    </div>

                    {/* Для выгула (если есть, или если это собака) */}
                    {(pet.info_for_walking || pet.type_id === 1 || typeName.toLowerCase().includes('dog')) && (
                        <div className={style.infoBlock}>
                            <div className={style.infoBlockHeader}>
                                <div className={style.infoIconBg}><WalkIcon /></div>
                                <h3>{t('petForm.labelInfoWalking', 'На прогулке')}</h3>
                            </div>
                            <div className={style.infoContent}>
                                {pet.info_for_walking ? (
                                    <p>{pet.info_for_walking}</p>
                                ) : (
                                    <span className={style.emptyText}>{t('common.noInfo', 'Информация не указана')}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 4. ГАЛЕРЕЯ --- */}
            {pet.files?.data && pet.files.data.length > 0 && (
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>
                        {t('petForm.sectionPhotos', 'Фотографии')}
                        <span className={style.countBadge}>{pet.files.data.length}</span>
                    </h2>
                    <div className={style.mediaGrid}>
                        {pet.files.data.map(f => (
                            <div key={f.id} className={style.mediaItem}>
                                <img src={f.preview_url || f.url} alt="Gallery" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={style.bottomActions}>
                <button onClick={handleDelete} className={style.btnDeleteLink}>
                    {t('common.deletePet', 'Удалить этого питомца')}
                </button>
            </div>
        </div>
    );
};

export default CabinetPetDetails;