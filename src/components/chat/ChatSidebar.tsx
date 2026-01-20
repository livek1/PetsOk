// --- File: src/components/chat/ChatSidebar.tsx ---
import React, { useState, useMemo, useEffect } from 'react';
import style from '../../style/pages/cabinet/Chat.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { SUBSCRIBE_TO_GROUP_TYPING_CHANNEL, UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL } from '../../store/middleware/websocketMiddleware';
import moment from 'moment';

interface ChatSidebarProps {
    onSelect: (groupId: string) => void;
    activeGroupId: string | null;
    className?: string;
    onOpenMenu?: () => void; // НОВЫЙ ПРОП
}

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelect, activeGroupId, className, onOpenMenu }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { dialoguesList, typingStates } = useSelector((state: RootState) => state.dialogues);
    const { user } = useSelector((state: RootState) => state.auth);
    const { isConnected } = useSelector((state: RootState) => state.websocket);

    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const subscribedGroups: string[] = [];
        if (isConnected && dialoguesList.length > 0) {
            dialoguesList.forEach(dialogue => {
                if (dialogue && dialogue.id) {
                    const groupId = String(dialogue.id);
                    dispatch({ type: SUBSCRIBE_TO_GROUP_TYPING_CHANNEL, payload: { groupId } });
                    subscribedGroups.push(groupId);
                }
            });
        }
        return () => {
            subscribedGroups.forEach(groupId => {
                dispatch({ type: UNSUBSCRIBE_FROM_GROUP_TYPING_CHANNEL, payload: { groupId } });
            });
        };
    }, [dialoguesList, isConnected, dispatch]);

    const toggleSection = (sectionKey: string) => {
        setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = moment(dateStr);
        if (date.isSame(moment(), 'day')) return date.format('HH:mm');
        return date.format('D MMM');
    };

    const isMyMessage = (msg: any) => {
        if (!msg || !user?.id) return false;
        const msgOwnerId = String(msg.owner_id || msg.user?._id || '');
        return msgOwnerId === String(user.id);
    };

    const groupedDialogues = useMemo(() => {
        const sections = {
            support: { title: t('inbox.sectionTitleSupport', 'Поддержка'), data: [] as any[] },
            active: { title: t('inbox.sectionTitleActiveChats', 'Активные чаты'), data: [] as any[] },
            other: { title: t('inbox.sectionTitleOtherChats', 'Другие чаты'), data: [] as any[] },
        };

        dialoguesList.forEach(dialogue => {
            if (!dialogue) return;
            if (dialogue.type === 'support') {
                sections.support.data.push(dialogue);
            } else if (dialogue.status === 'open' || dialogue.status === 'active') {
                sections.active.data.push(dialogue);
            } else {
                sections.other.data.push(dialogue);
            }
        });
        return sections;
    }, [dialoguesList, t]);

    const renderDialogueItem = (dialogue: any) => {
        const partner = dialogue.participant;
        const groupIdStr = String(dialogue.id);
        const typingUsersInGroup = typingStates[groupIdStr] || [];
        const isTyping = typingUsersInGroup.some(id => String(id) !== String(user?.id));
        const lastMsg = dialogue.last_message;

        let previewText = lastMsg?.text || lastMsg?.message || t('inbox.noMessages', 'Нет сообщений');
        if (lastMsg?.is_system) {
            previewText = `Система: ${previewText}`;
        } else if (lastMsg?.gallery?.length && !lastMsg.text && !lastMsg.message) {
            previewText = '📷 Медиа файл';
        } else if (isMyMessage(lastMsg)) {
            previewText = `${t('common.you', 'Вы')}: ${previewText}`;
        }

        const partnerName = partner?.name || (dialogue.type === 'support' ? t('inbox.supportTeamDefaultName', 'Поддержка') : 'User');
        const avatarUrl = partner?.avatar?.preview_url || partner?.avatar?.url || '/placeholder-user.jpg';

        return (
            <div
                key={dialogue.id}
                className={`${style.dialogueItem} ${String(dialogue.id) === activeGroupId ? style.active : ''}`}
                onClick={() => onSelect(String(dialogue.id))}
            >
                <div className={style.avatarWrapper}>
                    <img src={avatarUrl} alt="Ava" className={style.avatar} />
                    {dialogue.unread_count > 0 && <div className={style.unreadDot} />}
                </div>
                <div className={style.dialogueInfo}>
                    <div className={style.dialogueTop}>
                        <span className={`${style.dialogueName} ${dialogue.unread_count > 0 ? style.unreadName : ''}`}>
                            {partnerName}
                        </span>
                        <span className={style.dialogueTime}>{formatDate(dialogue.last_message_at)}</span>
                    </div>
                    <div className={style.dialoguePreview}>
                        {isTyping ? (
                            <span className={style.typing}>{t('chat.typing', 'печатает...')}</span>
                        ) : (
                            <span className={`${style.lastMessage} ${dialogue.unread_count > 0 ? style.unreadText : ''}`}>
                                {previewText}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const hasAnyDialogues = dialoguesList.length > 0;

    return (
        <div className={`${style.sidebar} ${className || ''}`}>
            {/* НОВАЯ МОБИЛЬНАЯ ШАПКА */}
            <div className={style.mobileSidebarHeader}>
                <button onClick={onOpenMenu}>
                    <MenuIcon />
                </button>
                <h2>Сообщения</h2>
            </div>

            <div className={style.dialoguesList}>
                {!hasAnyDialogues ? (
                    <div className={style.emptyState}>
                        <p>{t('inbox.noDialogues', 'У вас пока нет диалогов')}</p>
                    </div>
                ) : (
                    <>
                        {groupedDialogues.support.data.length > 0 && (
                            <div className={style.sectionContainer}>
                                {renderDialogueItem(groupedDialogues.support.data[0])}
                            </div>
                        )}
                        {groupedDialogues.active.data.length > 0 && (
                            <div className={style.sectionContainer}>
                                <div className={style.sectionHeader} onClick={() => toggleSection('active')}>
                                    <span>{groupedDialogues.active.title}</span>
                                    <ChevronIcon className={`${style.chevron} ${collapsedSections['active'] ? style.collapsed : ''}`} />
                                </div>
                                {!collapsedSections['active'] && (
                                    <div className={style.sectionList}>
                                        {groupedDialogues.active.data.map(renderDialogueItem)}
                                    </div>
                                )}
                            </div>
                        )}
                        {groupedDialogues.other.data.length > 0 && (
                            <div className={style.sectionContainer}>
                                <div className={style.sectionHeader} onClick={() => toggleSection('other')}>
                                    <span>{groupedDialogues.other.title}</span>
                                    <ChevronIcon className={`${style.chevron} ${collapsedSections['other'] ? style.collapsed : ''}`} />
                                </div>
                                {!collapsedSections['other'] && (
                                    <div className={style.sectionList}>
                                        {groupedDialogues.other.data.map(renderDialogueItem)}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;