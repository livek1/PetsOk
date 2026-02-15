import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/CabinetPets.module.scss';
import { getMyPets, Pet } from '../../services/api';

// Иконки
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const CabinetPets: React.FC = () => {
    const { t } = useTranslation();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPets();
    }, []);

    const loadPets = async () => {
        try {
            const response = await getMyPets();
            // Обработка структуры { data: [...] }
            const data = response.data || response;
            setPets(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={style.loader}>{t('loading')}</div>;

    return (
        <div className={style.container}>
            {/* Убрали H1, оставили только кнопку справа */}
            <div className={style.headerRow} style={{ justifyContent: 'flex-end' }}>
                <Link to="/cabinet/pets/add" className={style.addButton}>
                    <PlusIcon />
                    {t('petForm.addPetButton', 'Добавить питомца')}
                </Link>
            </div>

            {pets.length === 0 ? (
                <div className={style.emptyState}>
                    <div className={style.emptyIcon}>🐾</div>
                    <h3>{t('petsScreen.noPetsAdded', 'У вас пока нет питомцев')}</h3>
                    <p>{t('petsScreen.clickToAdd', 'Нажмите кнопку, чтобы добавить первого!')}</p>
                </div>
            ) : (
                <div className={style.petsGrid}>
                    {pets.map(pet => (
                        <Link to={`/cabinet/pets/${pet.id}`} key={pet.id} className={style.petCard}>
                            {pet.avatar?.data?.preview_url || pet.avatar?.data?.url ? (
                                <img
                                    src={pet.avatar?.data?.preview_url || pet.avatar?.data?.url}
                                    alt={pet.name}
                                    className={style.petAvatar}
                                />
                            ) : (
                                <div className={style.petAvatarPlaceholder}>
                                    {(pet.name && pet.name[0]) || 'P'}
                                </div>
                            )}

                            <div className={style.petInfo}>
                                <h3>{pet.name}</h3>
                                <p className={style.petBreed}>
                                    {pet.type?.data?.name || (pet.type_id === 1 ? t('petTypes.dog') : t('petTypes.cat'))}
                                    {pet.breed?.data?.name ? `, ${pet.breed.data.name}` : ''}
                                </p>
                                <p className={style.petMeta}>
                                    {getAgeString(pet.year, pet.month, t)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export const getAgeString = (y: number | undefined, m: number | undefined, t: any) => {
    if (!y && !m) return t('petsScreen.ageNotSpecified', 'Возраст не указан');
    const parts: string[] = [];
    if (y) parts.push(`${y} ${t('common.years_short', 'л.')}`);
    if (m) parts.push(`${m} ${t('common.months_short', 'мес.')}`);
    return parts.join(' ');
};

export default CabinetPets;