import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import style from '../../style/pages/cabinet/Chat.module.scss';
import { getChatDialogueMessages, sendMessage, markMessagesAsRead } from '../../services/api';
import { RootState, AppDispatch } from '../../store';
import { SEND_TYPING } from '../../store/middleware/websocketMiddleware';
import { updateDialogueFromWs, clearTypingForUserInGroup } from '../../store/slices/dialoguesSlice';
import moment from 'moment';
import ChecklistModal from '../modals/ChecklistModal';

// --- Lightbox Imports ---
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// Иконки
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>;
const CheckListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const AttachIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

interface ChatWindowProps {
    groupId: string;
    onBack?: () => void;
    className?: string;
}

const CACHE_PREFIX = 'chat_messages_v3_';

// Сортировка: Старые -> Новые
const sortMessages = (msgs: any[]) => {
    return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const ChatWindow: React.FC<ChatWindowProps> = ({ groupId, onBack, className }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useSelector((state: RootState) => state.auth);
    const { typingStates, lastReceivedMessage } = useSelector((state: RootState) => state.dialogues);

    const [messages, setMessages] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [partnerName, setPartnerName] = useState('');
    const [partnerStatus, setPartnerStatus] = useState('');
    const [partnerAvatar, setPartnerAvatar] = useState('');

    const [inputText, setInputText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Флаг первичной загрузки, чтобы не скроллить при каждом чихе
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [showMenu, setShowMenu] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    // --- State для Lightbox ---
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);

    // Для ResizeObserver
    const resizeObserver = useRef<ResizeObserver | null>(null);

    const isTyping = typingStates[groupId]?.some(id => String(id) !== String(user?.id));

    // --- Нормализация данных ---
    const normalizeMessage = useCallback((msg: any) => {
        const msgOwner = msg.owner || msg.user;
        const ownerId = String(msg.owner_id || msgOwner?.id || '');
        const avatarUrl = msgOwner?.avatar?.preview_url || msgOwner?.avatar?.url || msg.sender_avatar?.url || msg.sender_avatar?.preview_url || msgOwner?.avatar;

        let galleryData = msg.gallery || msg.media || msg.files || msg.attachments || [];

        if (Array.isArray(galleryData)) {
            galleryData = galleryData.map((item: any) => ({
                id: item.id || Math.random(),
                url: item.url || item.src || item.preview_url,
                preview_url: item.preview_url || item.preview,
                type: item.media_type || item.type || (item.mime?.startsWith('video') ? 'video' : 'photo')
            })).filter((item: any) => item.url);
        }

        return {
            ...msg,
            id: String(msg.id || msg.tempId),
            tempId: msg.tempId,
            text: msg.text || msg.message || '',
            createdAt: msg.createdAt || msg.created_at,
            user: {
                _id: ownerId,
                name: msgOwner?.name || msg.sender_name || 'User',
                avatar: { preview_url: avatarUrl }
            },
            owner_id: ownerId,
            gallery: galleryData,
            is_system: !!msg.is_system,
            pending: !!msg.pending,
            failed: !!msg.failed,
            read: !!msg.read
        };
    }, []);

    // --- 1. Инициализация ---
    useEffect(() => {
        if (!groupId || !user?.id) return;

        setIsInitialLoad(true); // Сбрасываем флаг при смене чата

        const cached = localStorage.getItem(`${CACHE_PREFIX}${user.id}_${groupId}`);
        if (cached) {
            try {
                let parsed = JSON.parse(cached).map(normalizeMessage);
                parsed = sortMessages(parsed);
                setMessages(parsed);
                setLoading(false);
            } catch (e) { console.error('Cache error'); }
        } else {
            setMessages([]);
            setLoading(true);
        }

        setPage(1);
        setHasMore(true);
        loadMessages(1, true);
        markMessagesAsRead(groupId);
    }, [groupId, user?.id]);

    // --- 2. Умный скролл ---
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            // Используем scrollIntoView для элемента-якоря
            messagesEndRef.current.scrollIntoView({ behavior });
        } else if (messagesContainerRef.current) {
            // Фолбек на контейнер
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    // --- Observer для отслеживания изменения высоты контента (загрузка картинок) ---
    useEffect(() => {
        if (!messagesContainerRef.current) return;

        const container = messagesContainerRef.current;

        resizeObserver.current = new ResizeObserver(() => {
            // Если это первая загрузка или мы уже были внизу -> скроллим вниз при изменении размера
            // (например, загрузилась картинка и увеличила высоту)
            if (isInitialLoad) {
                scrollToBottom('auto');
            } else {
                // Если пользователь был близко к низу (меньше 100px), скроллим за него
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
                if (isNearBottom) {
                    scrollToBottom('smooth');
                }
            }
        });

        resizeObserver.current.observe(container);

        return () => {
            if (resizeObserver.current) resizeObserver.current.disconnect();
        };
    }, [isInitialLoad, scrollToBottom]);

    // Сброс флага начальной загрузки после рендера сообщений
    useEffect(() => {
        if (!loading && messages.length > 0 && isInitialLoad) {
            // Даем браузеру время отрисовать layout
            setTimeout(() => {
                scrollToBottom('auto'); // Мгновенный скролл при открытии
                setIsInitialLoad(false);
            }, 100);
        }
    }, [loading, messages, isInitialLoad, scrollToBottom]);

    // Обработчик загрузки изображения (вызывается на каждой <img>)
    const handleImageLoad = () => {
        // Если это начальная загрузка или пользователь внизу, обновляем скролл
        if (isInitialLoad || (messagesContainerRef.current && (messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop - messagesContainerRef.current.clientHeight < 200))) {
            scrollToBottom('auto');
        }
    };

    // --- Сохранение кэша ---
    useEffect(() => {
        if (groupId && user?.id && messages.length > 0) {
            localStorage.setItem(`${CACHE_PREFIX}${user.id}_${groupId}`, JSON.stringify(messages.slice(-50)));
        }
    }, [messages, groupId, user?.id]);

    // --- API Load ---
    const loadMessages = async (currentPage: number, isRefresh = false) => {
        try {
            if (currentPage > 1) setLoadingMore(true);
            const res = await getChatDialogueMessages(groupId, currentPage, 50);

            if (isRefresh && (res?.data?.group || res?.data)) {
                const groupData = res.data.group || (res.data.id ? res.data : null);
                if (groupData) {
                    const pName = groupData.name || groupData.participant?.name || groupData.worker?.name || groupData.client?.name;
                    setPartnerName(pName || t('chat.defaultPartnerName', 'Собеседник'));
                    const pAvatar = groupData.participant?.avatar?.preview_url || groupData.participant?.avatar?.url;
                    setPartnerAvatar(pAvatar);
                    if (groupData.opponent?.last_activity_text) {
                        setPartnerStatus(groupData.opponent.last_activity_text);
                    }
                }
            }

            let rawMsgs = res?.data?.messages?.data || res?.messages?.data || (Array.isArray(res?.data) ? res.data : []);
            const normalizedMsgs = rawMsgs.map(normalizeMessage);

            setMessages(prev => {
                if (isRefresh) {
                    const serverMessages = [...normalizedMsgs].reverse();
                    const serverIds = new Set(serverMessages.map((m: any) => String(m.id)));
                    const pendingMessages = prev.filter(m => m.pending && !serverIds.has(String(m.id)) && !serverIds.has(String(m.tempId)));
                    return sortMessages([...serverMessages, ...pendingMessages]);
                } else {
                    const olderMessages = [...normalizedMsgs].reverse();
                    const existingIds = new Set(prev.map(m => String(m.id)));
                    const uniqueOlder = olderMessages.filter((m: any) => !existingIds.has(String(m.id)));

                    if (messagesContainerRef.current) {
                        prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
                    }
                    return sortMessages([...uniqueOlder, ...prev]);
                }
            });

            setHasMore(normalizedMsgs.length >= 50);
        } catch (e) { console.error("Load messages error", e); }
        finally { setLoading(false); setLoadingMore(false); }
    };

    // --- WebSocket ---
    useEffect(() => {
        if (!lastReceivedMessage) return;

        if (String(lastReceivedMessage.chat_group_id) === String(groupId)) {
            setMessages(prev => {
                const incomingId = String(lastReceivedMessage.id);
                const ownerId = String(lastReceivedMessage.owner_id);
                const myId = String(user?.id);

                const exactMatchIndex = prev.findIndex(m => String(m.id) === incomingId);
                if (exactMatchIndex !== -1) {
                    const newArr = [...prev];
                    newArr[exactMatchIndex] = { ...newArr[exactMatchIndex], ...normalizeMessage(lastReceivedMessage) };
                    return newArr;
                }

                if (ownerId === myId) {
                    const msgTime = new Date(lastReceivedMessage.createdAt).getTime();
                    const pendingMatchIndex = prev.findIndex(m => {
                        if (!m.pending) return false;
                        const localTime = new Date(m.createdAt).getTime();
                        return m.text === lastReceivedMessage.text && Math.abs(localTime - msgTime) < 15000;
                    });

                    if (pendingMatchIndex !== -1) {
                        const newArr = [...prev];
                        newArr[pendingMatchIndex] = { ...normalizeMessage(lastReceivedMessage), tempId: prev[pendingMatchIndex].tempId };
                        return sortMessages(newArr);
                    }
                }

                const newList = [...prev, normalizeMessage(lastReceivedMessage)];
                // Скролл при новом сообщении
                setTimeout(() => scrollToBottom('smooth'), 100);
                return sortMessages(newList);
            });

            if (String(lastReceivedMessage.owner_id) !== String(user?.id)) {
                markMessagesAsRead(groupId);
            }
        }
    }, [lastReceivedMessage?._receiveTimestamp, groupId, user?.id, scrollToBottom]);

    // Restore scroll pos
    useEffect(() => {
        if (loadingMore === false && prevScrollHeightRef.current > 0 && messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
        }
    }, [messages, loadingMore]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop < 50 && hasMore && !loadingMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadMessages(nextPage);
        }
    };

    // --- Files & Send ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!inputText.trim() && files.length === 0) || !groupId) return;

        const tempId = `temp-${Date.now()}`;
        const textToSend = inputText;
        const filesToSend = [...files];

        setInputText('');
        setFiles([]);

        const newMessage = {
            id: tempId,
            tempId: tempId,
            text: textToSend,
            createdAt: new Date().toISOString(),
            owner_id: String(user?.id),
            user: { _id: String(user?.id), name: user?.name, avatar: { preview_url: user?.avatar?.data?.preview_url } },
            gallery: filesToSend.map(f => ({
                url: URL.createObjectURL(f),
                type: f.type.startsWith('video') ? 'video' : 'photo'
            })),
            pending: true,
            read: false,
            failed: false,
            chat_group_id: groupId,
            is_system: false
        };

        setMessages(prev => sortMessages([...prev, normalizeMessage(newMessage)]));
        setTimeout(() => scrollToBottom('smooth'), 50);

        dispatch(updateDialogueFromWs({ ...newMessage, chat_group_id: groupId, owner_id: user?.id, currentUserIdInApp: String(user?.id) }));

        try {
            const res = await sendMessage(groupId, textToSend, filesToSend);
            if (res.data) {
                const serverId = String(res.data.id);
                setMessages(prev => {
                    const exists = prev.some(m => String(m.id) === serverId);
                    if (exists) return prev.filter(m => m.tempId !== tempId);
                    return prev.map(m => m.tempId === tempId ? { ...m, ...normalizeMessage(res.data), id: serverId, tempId: undefined, pending: false } : m);
                });
                dispatch(updateDialogueFromWs({ ...res.data, chat_group_id: groupId, currentUserIdInApp: String(user?.id), _receiveTimestamp: Date.now() }));
            }
        } catch (e) {
            console.error('Send error', e);
            setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, failed: true, pending: false } : m));
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        if (groupId) dispatch({ type: SEND_TYPING, payload: { groupId } });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleMediaClick = (msgGallery: any[], index: number) => {
        const slides = msgGallery.map(m => ({
            type: m.type === 'video' ? 'video' : 'image',
            src: m.url,
            poster: m.preview_url,
            sources: m.type === 'video' ? [{ src: m.url, type: 'video/mp4' }] : undefined
        }));

        setLightboxSlides(slides);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // --- Render Message ---
    const renderMessage = (msg: any, index: number) => {
        if (msg.is_system) {
            return (<div key={msg.id || index} className={style.systemMessageRow}><div className={style.systemBubble}><span className={style.systemText}>{msg.text}</span></div></div>);
        }
        const isMe = String(msg.owner_id) === String(user?.id);
        const prevMsg = messages[index - 1];
        const showAvatar = !isMe && (!prevMsg || String(prevMsg.owner_id) !== String(msg.owner_id) || prevMsg.is_system);
        const avatarUrl = msg.user?.avatar?.preview_url || msg.user?.avatar?.url || '/placeholder-user.jpg';

        return (
            <div key={msg.id || msg.tempId || index} className={`${style.messageRow} ${isMe ? style.me : style.them}`}>
                <div className={style.avatarCol}>{showAvatar && !isMe && <img src={avatarUrl} className={style.avatar} alt="avatar" />}</div>
                <div className={style.messageBubble}>
                    {msg.gallery && msg.gallery.length > 0 && (
                        <div className={style.mediaGrid}>
                            {msg.gallery.map((media: any, i: number) => (
                                <div
                                    key={i}
                                    className={style.mediaItemWrapper}
                                    onClick={() => handleMediaClick(msg.gallery, i)}
                                >
                                    {media.type === 'video' ? (
                                        <div className={style.videoPreviewBox}>
                                            <video src={media.url} className={style.mediaImg} />
                                            <div className={style.playOverlay}>▶</div>
                                        </div>
                                    ) : (
                                        // --- FIX: Добавлен onLoad для коррекции скролла ---
                                        <img
                                            src={media.url}
                                            className={style.mediaImg}
                                            alt="attachment"
                                            onLoad={handleImageLoad}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {msg.text && <div className={style.msgText}>{msg.text}</div>}

                    <div className={style.msgMeta}>
                        <span className={style.time}>{moment(msg.created_at || msg.createdAt).format('HH:mm')}</span>
                        {isMe && <span className={style.status}>{msg.failed ? '❌' : (msg.pending ? '🕒' : (msg.read ? '✓✓' : '✓'))}</span>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`${style.chatWindow} ${className || ''}`}>
            <div className={style.chatHeader}>
                <div className={style.headerLeft}>
                    {onBack && <button className={style.backButton} onClick={onBack}>←</button>}
                    {partnerAvatar && <img src={partnerAvatar} alt="" className={style.headerAvatar} />}
                    <div className={style.chatHeaderInfo}>
                        <h3>{partnerName}</h3>
                        {isTyping ? <span className={style.typingStatus}>{t('chat.typing', 'печатает...')}</span> : partnerStatus && <span className={style.onlineStatus}>{partnerStatus}</span>}
                    </div>
                </div>
                <div className={style.headerRight} ref={menuRef}>
                    <button className={style.menuBtn} onClick={() => setShowMenu(!showMenu)}><MenuIcon /></button>
                    {showMenu && <div className={style.dropdownMenu}><button onClick={() => { setShowMenu(false); setShowChecklist(true); }}><CheckListIcon /><span>Что взять с собой?</span></button></div>}
                </div>
            </div>

            <div
                className={style.messagesArea}
                ref={messagesContainerRef}
                onScroll={handleScroll}
                // --- FIX: Скрываем пока не загрузится (opacity 0 -> 1) ---
                style={{ opacity: isInitialLoad ? 0 : 1 }}
            >
                {loadingMore && <div className={style.loadingMore}>Загрузка истории...</div>}
                {loading ? <div className={style.centerLoading}>Загрузка...</div> : messages.length === 0 ? <div className={style.emptyPlaceholder}>{t('chat.noMessages', 'Напишите первое сообщение!')}</div> : messages.map((msg, idx) => renderMessage(msg, idx))}
                <div ref={messagesEndRef} />
            </div>

            <div className={style.inputArea}>
                {files.length > 0 && (
                    <div className={style.attachmentsPreview}>
                        {files.map((f, i) => (
                            <div key={i} className={style.attachItem}>
                                {f.type.startsWith('video') ? (
                                    <video src={URL.createObjectURL(f)} className={style.previewMedia} />
                                ) : (
                                    <img src={URL.createObjectURL(f)} alt="preview" className={style.previewMedia} />
                                )}
                                <div className={style.removeAttach} onClick={() => removeFile(i)}>✕</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={style.inputWrapper}>
                    <button
                        className={style.fileBtn}
                        onClick={() => fileInputRef.current?.click()}
                        title="Прикрепить файл"
                    >
                        <AttachIcon />
                    </button>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                    />

                    <textarea
                        className={style.messageInput}
                        placeholder={t('chat.inputPlaceholder', 'Сообщение...')}
                        value={inputText}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button
                        className={style.sendBtn}
                        onClick={handleSend}
                        disabled={!inputText.trim() && files.length === 0}
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
            <ChecklistModal isOpen={showChecklist} onClose={() => setShowChecklist(false)} />

            {/* Lightbox Component */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
                plugins={[Video]}
                video={{
                    autoPlay: true,
                    controls: true,
                    muted: false
                }}
            />
        </div>
    );
};

export default ChatWindow;