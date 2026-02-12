import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Image as ImageIcon, Users, AlertTriangle, MessageCircle } from 'lucide-react';

export function CommunityDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [timelineItems, setTimelineItems] = useState([]);
    const [threads, setThreads] = useState([]); // Grouped threads
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [newTitle, setNewTitle] = useState(''); // For new topics
    const [isAlert, setIsAlert] = useState(false);
    const [activeThread, setActiveThread] = useState(null); // If null, showing list of topics/timeline. If set, showing specific thread.
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (id && user) {
            fetchCommunityDetails();
            fetchTimelineItems();

            const postSubscription = supabase
                .channel(`community_posts:${id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `community_id=eq.${id}` }, (payload) => {
                    fetchNewItem('post', payload.new.id);
                })
                .subscribe();

            const shareSubscription = supabase
                .channel(`record_shares:${id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'record_shares', filter: `community_id=eq.${id}` }, (payload) => {
                    fetchNewItem('share', payload.new.id);
                })
                .subscribe();

            return () => {
                postSubscription.unsubscribe();
                shareSubscription.unsubscribe();
            };
        }
    }, [id, user]);

    useEffect(() => {
        // Group items into threads only when timelineItems changes
        const grouped = groupItems(timelineItems);
        setThreads(grouped);
        scrollToBottom();
    }, [timelineItems]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const fetchCommunityDetails = async () => {
        const { data } = await supabase.from('communities').select('*').eq('id', id).single();
        if (data) setCommunity(data);
    };

    const fetchTimelineItems = async () => {
        setLoading(true);
        // Fetch posts (including thread info)
        const { data: postsData } = await supabase
            .from('community_posts')
            .select(`*, user:user_id(email)`)
            .eq('community_id', id)
            .order('created_at', { ascending: true }); // Oldest first for threads usually, but we might want newest topics first. Let's sort client side.

        // Fetch shared records
        const { data: sharesData } = await supabase
            .from('record_shares')
            .select(`id, created_at, record:records(*, user:user_id(email))`)
            .eq('community_id', id);

        const posts = postsData ? postsData.map(p => ({ type: 'post', ...p })) : [];
        const shares = sharesData ? sharesData.map(s => ({
            type: 'record',
            id: s.id,
            created_at: s.created_at,
            user_id: s.record?.user_id,
            user: s.record?.user,
            content: s.record
        })).filter(s => s.content) : [];

        // Linear list of all items
        const allItems = [...posts, ...shares].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setTimelineItems(allItems);
        setLoading(false);
    };

    const fetchNewItem = async (type, itemId) => {
        // ... (Simplified re-fetch logic could go here, or just append if we trust payload)
        // For robustness, reusing fetch logic essentially or selective fetch
        if (type === 'post') {
            const { data } = await supabase.from('community_posts').select(`*, user:user_id(email)`).eq('id', itemId).single();
            if (data) setTimelineItems(prev => [...prev, { type: 'post', ...data }].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        } else {
            const { data } = await supabase.from('record_shares').select(`id, created_at, record:records(*, user:user_id(email))`).eq('id', itemId).single();
            if (data && data.record) setTimelineItems(prev => [...prev, {
                type: 'record', id: data.id, created_at: data.created_at, user_id: data.record.user_id, user: data.record.user, content: data.record
            }].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        }
    };

    const groupItems = (items) => {
        // Group by parent_id (Threads)
        // Items without parent_id are "Topics" or "Standalone Posts"
        // Shared records are standalone
        const topics = {};

        items.forEach(item => {
            if (item.type === 'post' && item.parent_id) {
                // This is a reply
                if (!topics[item.parent_id]) {
                    // Parent might handle later or missing? 
                    // Ideally we find the parent. If parent not loaded, we might treat as orphan?
                    // For now assume we have all.
                    // If we haven't seen parent yet (sorted by time), we might need to wait.
                    // But assume flat list contains parent.
                }
                // We'll attach to parent in a second pass or check topics map
            } else {
                // Top level item
                topics[item.id] = { ...item, replies: [] };
            }
        });

        // Second pass for replies
        items.forEach(item => {
            if (item.type === 'post' && item.parent_id) {
                if (topics[item.parent_id]) {
                    topics[item.parent_id].replies.push(item);
                } else {
                    // Orphaned reply (User wants to see these!)
                    // Treat as standalone topic if parent is missing
                    if (!topics[item.id]) { // Avoid duplication if somehow already processed
                        topics[item.id] = {
                            ...item,
                            replies: [],
                            is_orphan: true,
                            content: `(返信先不明) ${item.content}` // Mark it visually
                        };
                    }
                }
            }
        });

        return Object.values(topics).sort((a, b) => {
            // Sort topics by: Alerts first, then newest activity (reply or created)
            const aLast = a.replies.length > 0 ? a.replies[a.replies.length - 1].created_at : a.created_at;
            const bLast = b.replies.length > 0 ? b.replies[b.replies.length - 1].created_at : b.created_at;

            if (a.is_alert && !b.is_alert) return -1;
            if (!a.is_alert && b.is_alert) return 1;

            return new Date(bLast) - new Date(aLast);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !newTitle.trim()) return;

        try {
            const payload = {
                community_id: id,
                user_id: user.id,
                content: newMessage,
                is_alert: isAlert,
                title: activeThread ? null : newTitle, // Only top level has title
                parent_id: activeThread ? activeThread.id : null
            };

            const { error } = await supabase.from('community_posts').insert([payload]);
            if (error) throw error;
            setNewMessage('');
            setNewTitle('');
            setIsAlert(false);
            // activeThread remains set if we are replying
        } catch (err) {
            alert('送信失敗: ' + err.message);
        }
    };

    const getUserInitial = (u) => u?.email ? u.email[0].toUpperCase() : '?';

    // UI Components
    const PostItem = ({ item, isReply = false }) => {
        const isMe = item.user_id === user?.id;
        const isAlertPost = item.is_alert;
        const hasMentions = item.content && item.content.includes('@channel');

        return (
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4 animate-in slide-in-from-bottom-2`}>
                <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-[90%]`}>
                    {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mx-2 shrink-0">
                            <span className="text-xs font-bold text-slate-500">{getUserInitial(item.user)}</span>
                        </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Title for Topics */}
                        {item.title && !isReply && (
                            <h4 className="font-bold text-slate-800 text-sm mb-1 ml-1">{item.title}</h4>
                        )}

                        <div className={`
                            p-3 rounded-2xl shadow-sm relative
                            ${isAlertPost ? 'bg-red-50 border-2 border-red-500' :
                                hasMentions ? 'bg-amber-50 border-2 border-amber-400' :
                                    isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}
                        `}>
                            {isAlertPost && (
                                <div className="absolute -top-3 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                    <AlertTriangle size={10} className="mr-1" /> 重要
                                </div>
                            )}

                            <p className="text-sm break-words whitespace-pre-wrap">
                                {item.content.split(' ').map((word, i) =>
                                    word === '@channel' ? <span key={i} className="font-bold bg-yellow-200 text-yellow-800 px-1 rounded mx-0.5">@channel</span> : word + ' '
                                )}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 mt-1 px-1">
                            <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            {!isReply && !activeThread && (
                                <button onClick={() => setActiveThread(item)} className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {item.replies?.length > 0 ? `${item.replies.length}件の返信` : '返信'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Show Replies Preview if Top Level (Limit 2) */}
                {!isReply && !activeThread && item.replies?.length > 0 && (
                    <div className="mt-2 ml-12 space-y-2 w-full max-w-[85%]">
                        {item.replies.slice(-2).map(reply => (
                            <PostItem key={reply.id} item={reply} isReply={true} />
                        ))}
                        {item.replies.length > 2 && (
                            <button onClick={() => setActiveThread(item)} className="text-xs text-slate-400 font-bold ml-2">
                                すべての返信を見る ({item.replies.length})
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const RecordItem = ({ item }) => {
        const isMe = item.user_id === user?.id;
        const record = item.content;
        return (
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2 shrink-0 border border-orange-200">
                        <span className="text-xs font-bold text-orange-600">{getUserInitial(item.user)}</span>
                    </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${isMe ? 'bg-white border-green-200' : 'bg-white border-orange-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{record.date}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${record.type === 'pesticide' ? 'bg-red-100 text-red-600' :
                            record.type === 'fertilizer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>{record.type === 'pesticide' ? '防除' : record.type === 'fertilizer' ? '施肥' : '作業'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{record.detail} {record.amount ? `(${record.amount})` : ''}</h3>
                    <p className="text-xs text-slate-500 mb-1">＠{record.field}</p>
                    {record.memo && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2">{record.memo}</p>}
                </div>
            </div>
        )
    };

    if (loading) return <div className="p-4 text-center">読み込み中...</div>;
    if (!community) return <div className="p-4 text-center">コミュニティが見つかりません</div>;

    // Filter threads for view
    const visibleThreads = activeThread ? [threads.find(t => t.id === activeThread.id) || activeThread] : threads;
    // If active thread is set but not found in threads (e.g. newly created?), fallback to activeThread object

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex items-center shrink-0 z-10">
                <button onClick={() => activeThread ? setActiveThread(null) : navigate(-1)} className="mr-3 p-2 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-800 text-lg truncate">
                        {activeThread ? (activeThread.title || 'スレッド詳細') : community.name}
                    </h1>
                    <div className="flex items-center text-xs text-slate-500">
                        <Users size={12} className="mr-1" />
                        <span>{activeThread ? '返信一覧' : 'トピック一覧'}</span>
                    </div>
                </div>
                {/* LINE Connect Button */}
                {!activeThread && ( // Only show on main community view, not inside a thread
                    <button onClick={() => alert("LINEグループ連携機能は準備中です。\n\nこの機能により、LINEグループの会話を自動要約してコミュニティ掲示板に反映できるようになります。")} className="bg-[#06C755] hover:bg-[#05b54c] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg transition-transform active:scale-95 ml-2">
                        <MessageCircle size={14} fill="white" />
                        <span>LINE連携</span>
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeThread ? (
                    // Thread View: Show Parent then Replies
                    <>
                        <PostItem item={activeThread} />
                        <div className="pl-4 border-l-2 border-slate-200 ml-4 space-y-4">
                            {activeThread.replies?.map(reply => (
                                <PostItem key={reply.id} item={reply} isReply={true} />
                            ))}
                        </div>
                    </>
                ) : (
                    // Default View: List of Topics/Records
                    visibleThreads.map(item => {
                        if (item.type === 'record') return <RecordItem key={item.id} item={item} />;
                        return <PostItem key={item.id} item={item} />;
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-slate-100 shrink-0 mb-safe">
                {!activeThread && (
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-50 border-0 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 mb-2 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="新しい話題のタイトル (任意)..."
                    />
                )}

                <div className="flex items-end space-x-2">
                    <div className="flex-1 bg-slate-100 rounded-2xl p-1 flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-transparent border-0 px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-0 outline-none"
                            placeholder={activeThread ? "返信を入力..." : "メッセージを入力 (@channel で通知)..."}
                        />
                        <div className="flex items-center pr-2 space-x-1">
                            {/* Alert Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsAlert(!isAlert)}
                                className={`p-1.5 rounded-full transition-colors ${isAlert ? 'bg-red-500 text-white' : 'hover:bg-slate-200 text-slate-400'}`}
                                title="アラートモード"
                            >
                                <AlertTriangle size={18} />
                            </button>
                            <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600">
                                <ImageIcon size={20} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && !newTitle.trim()}
                        className="bg-green-600 text-white p-3 rounded-full shadow-md shadow-green-100 disabled:opacity-50 hover:bg-green-500 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {isAlert && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">※ アラートモード: この投稿はフィード上部に固定/強調されます</p>}
            </div>
        </div>
    );
}
