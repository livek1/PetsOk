// --- File: src/pages/cabinet/CabinetPetDetails.tsx ---
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/CabinetPetForm.module.scss';
import { getPetById, deletePet, Pet } from '../../services/api';
import { getAgeString } from './CabinetPets';

const CabinetPetDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pet, setPet] = useState<Pet | null>(null);

    useEffect(() => {
        if (id) getPetById(id).then(setPet).catch(console.error);
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm(t('common.confirmDelete', 'Удалить питомца?'))) {
            await deletePet(id!);
            navigate('/cabinet/pets');
        }
    };

    if (!pet) return <div>{t('loading')}</div>;

    const translateBool = (val?: number) => {
        if (val === 1) return t('common.yes', 'Да');
        if (val === 2) return t('common.no', 'Нет');
        return t('common.unknown', 'Не знаю');
    };

    // Безопасное получение данных
    const typeName = pet.type?.data?.name || (pet.type_id === 1 ? t('petTypes.dog') : t('petTypes.cat'));
    const breedName = pet.breed?.data?.name || t('common.unknownBreed', 'Порода не указана');
    const sizeName = pet.size?.data?.name || '-';

    return (
        <div className={style.formContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Link to="/cabinet/pets" className={style.backButton}>&larr; {t('common.back', 'Назад')}</Link>
                <div className={style.actions} style={{ marginTop: 0 }}>
                    <Link to={`/cabinet/pets/${id}/edit`} className={style.btnPrimary} style={{ textDecoration: 'none' }}>
                        {t('common.edit', 'Редактировать')}
                    </Link>
                    <button onClick={handleDelete} className={style.btnDelete}>
                        {t('common.delete', 'Удалить')}
                    </button>
                </div>
            </div>

            <div className={style.card} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <img
                    src={pet.avatar?.data?.preview_url || pet.avatar?.data?.url || '/placeholder-pet.jpg'}
                    style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                    alt={pet.name}
                />
                <div>
                    <h1 className={style.pageTitle} style={{ marginBottom: 5 }}>{pet.name}</h1>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>
                        {typeName} • {breedName}
                    </p>
                    <p style={{ fontSize: '1rem', color: '#888' }}>
                        {getAgeString(pet.year, pet.month, t)}
                    </p>
                </div>
            </div>

            <div className={style.card}>
                <h2>{t('petForm.sectionDetails', 'Характеристики')}</h2>
                <div className={style.grid2}>
                    <div><strong>{t('petForm.labelGender', 'Пол')}:</strong> {pet.gender === 0 || pet.gender === '0' || pet.gender_value === 'male' ? t('common.male') : t('common.female')}</div>
                    <div><strong>{t('petForm.labelSize', 'Размер')}:</strong> {sizeName}</div>

                    <div><strong>{t('petForm.labelSterilized', 'Стерилизован')}:</strong> {translateBool(pet.sterilized_value ?? pet.sterilized)}</div>
                    <div><strong>{t('petForm.labelVaccinated', 'Вакцинирован')}:</strong> {translateBool(pet.vaccinated_value ?? pet.vaccinated)}</div>

                    <div><strong>{t('petForm.labelKidsFriendly', 'Ладит с детьми')}:</strong> {translateBool(pet.kids_friendly_value ?? pet.kids_friendly)}</div>
                    <div><strong>{t('petForm.labelDogsFriendly', 'Ладит с собаками')}:</strong> {translateBool(pet.dogs_friendly_value ?? pet.dogs_friendly)}</div>
                    <div><strong>{t('petForm.labelCatsFriendly', 'Ладит с кошками')}:</strong> {translateBool(pet.cats_friendly_value ?? pet.cats_friendly)}</div>
                    <div><strong>{t('petForm.labelHomeAlone', 'Остается один')}:</strong> {translateBool(pet.staying_home_alone_value ?? pet.staying_home_alone)}</div>
                </div>
            </div>

            <div className={style.card}>
                <h2>{t('petForm.sectionAdditionalInfo', 'Заметки')}</h2>
                {pet.info_for_sitting && (
                    <div style={{ marginBottom: 15 }}>
                        <strong>{t('petForm.labelInfoSitting', 'Для передержки')}:</strong>
                        <p style={{ whiteSpace: 'pre-line' }}>{pet.info_for_sitting}</p>
                    </div>
                )}
                {pet.info_for_walking && (
                    <div>
                        <strong>{t('petForm.labelInfoWalking', 'Для выгула')}:</strong>
                        <p style={{ whiteSpace: 'pre-line' }}>{pet.info_for_walking}</p>
                    </div>
                )}
                {!pet.info_for_sitting && !pet.info_for_walking && <p style={{ color: '#888' }}>{t('common.noInfo', 'Нет информации')}</p>}
            </div>

            {/* Галерея */}
            <div className={style.card}>
                <h2>{t('petForm.sectionPhotos', 'Фотографии')}</h2>
                <div className={style.mediaGrid}>
                    {pet.files?.data?.map(f => (
                        <div key={f.id} className={style.mediaItem}>
                            <img src={f.preview_url || f.url} alt="Pet gallery" />
                        </div>
                    ))}
                    {(!pet.files?.data || pet.files.data.length === 0) && <p style={{ color: '#888', gridColumn: '1/-1' }}>{t('common.noPhotos', 'Нет фото')}</p>}
                </div>
            </div>
        </div>
    );
};

export default CabinetPetDetails;