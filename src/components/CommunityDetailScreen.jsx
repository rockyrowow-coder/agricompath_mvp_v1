import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Image as ImageIcon, Users } from 'lucide-react';

export function CommunityDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [timelineItems, setTimelineItems] = useState([]);

    useEffect(() => {
        if (id && user) {
            fetchCommunityDetails();
            fetchTimelineItems();

            // Realtime subscription for new posts
            const postSubscription = supabase
                .channel(`community_posts:${id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'community_posts',
                    filter: `community_id=eq.${id}`
                }, (payload) => {
                    fetchNewItem('post', payload.new.id);
                })
                .subscribe();

            // Realtime subscription for new shared records
            const shareSubscription = supabase
                .channel(`record_shares:${id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'record_shares',
                    filter: `community_id=eq.${id}`
                }, (payload) => {
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
        scrollToBottom();
    }, [timelineItems]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchCommunityDetails = async () => {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) console.error('Error fetching community:', error);
        else setCommunity(data);
    };

    const fetchTimelineItems = async () => {
        setLoading(true);
        // 1. Fetch Posts
        const { data: postsData, error: postsError } = await supabase
            .from('community_posts')
            .select(`
                id,
                user_id,
                content,
                created_at,
                image_url,
                user:user_id ( email )
            `)
            .eq('community_id', id);

        // 2. Fetch Shared Records
        const { data: sharesData, error: sharesError } = await supabase
            .from('record_shares')
            .select(`
                id,
                created_at,
                record:records (
                    id,
                    user_id,
                    date,
                    type,
                    crop,
                    detail,
                    amount,
                    memo,
                    created_at,
                    user:user_id (email)
                )
            `)
            .eq('community_id', id);

        if (postsError) console.error('Error fetching posts:', postsError);
        if (sharesError) console.error('Error fetching shares:', sharesError);

        // 3. Merge and Sort
        const posts = postsData ? postsData.map(p => ({ type: 'post', ...p })) : [];
        const shares = sharesData ? sharesData.map(s => ({
            type: 'record',
            id: s.id, // Share ID
            created_at: s.created_at,
            user_id: s.record?.user_id,
            user: s.record?.user,
            content: s.record // Record details
        })).filter(s => s.content) : []; // Filter out null records

        const merged = [...posts, ...shares].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setTimelineItems(merged);
        setLoading(false);
    };

    const fetchNewItem = async (type, itemId) => {
        if (type === 'post') {
            const { data, error } = await supabase
                .from('community_posts')
                .select(`
                    id,
                    user_id,
                    content,
                    created_at,
                    image_url,
                    user:user_id ( email )
                `)
                .eq('id', itemId)
                .single();

            if (!error && data) {
                setTimelineItems(prev => {
                    if (prev.some(p => p.type === 'post' && p.id === data.id)) return prev;
                    return [...prev, { type: 'post', ...data }].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                });
            }
        } else if (type === 'share') {
            const { data, error } = await supabase
                .from('record_shares')
                .select(`
                    id,
                    created_at,
                    record:records (
                        id,
                        user_id,
                        date,
                        type,
                        crop,
                        detail,
                        amount,
                        memo,
                        created_at,
                        user:user_id (email)
                    )
                `)
                .eq('id', itemId)
                .single();

            if (!error && data && data.record) {
                setTimelineItems(prev => {
                    if (prev.some(p => p.type === 'record' && p.id === data.id)) return prev;
                    const newShare = {
                        type: 'record',
                        id: data.id,
                        created_at: data.created_at,
                        user_id: data.record.user_id,
                        user: data.record.user,
                        content: data.record
                    };
                    return [...prev, newShare].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                });
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .insert([{
                    community_id: id,
                    user_id: user.id,
                    content: newMessage
                }]);

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            alert('送信失敗: ' + error.message);
        }
    };

    if (loading) return <div className="p-4 text-center">読み込み中...</div>;
    if (!community) return <div className="p-4 text-center">コミュニティが見つかりません</div>;

    // Helper to get initials or placeholder
    const getUserInitial = (postUser) => {
        // user object might be array or object depending on join, usually object for single relation
        // specific to supabase js client: it returns object if it's many-to-one
        if (postUser?.email) return postUser.email[0].toUpperCase();
        return '?';
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex items-center shrink-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-800 text-lg truncate">{community.name}</h1>
                    <div className="flex items-center text-xs text-slate-500">
                        <Users size={12} className="mr-1" />
                        <span>メンバー（仮）</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {timelineItems.map((item) => {
                    const isMe = item.user_id === user?.id;

                    if (item.type === 'record') {
                        const record = item.content;
                        return (
                            <div key={item.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2 shrink-0 border border-orange-200">
                                        <span className="text-xs font-bold text-orange-600">
                                            {getUserInitial(item.user)}
                                        </span>
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${isMe
                                    ? 'bg-white border-green-200' // My Record shared
                                    : 'bg-white border-orange-200' // Others Record
                                    }`}>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{record.date}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${record.type === 'pesticide' ? 'bg-red-100 text-red-600' :
                                                record.type === 'fertilizer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>{record.type === 'pesticide' ? '防除' : record.type === 'fertilizer' ? '施肥' : '作業'}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1">{record.detail} {record.amount ? `(${record.amount})` : ''}</h3>
                                    <p className="text-xs text-slate-500 mb-1">＠{record.field}</p>
                                    {record.memo && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2">{record.memo}</p>}
                                    <p className="text-[10px] mt-2 text-right text-slate-400">
                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • レコード共有
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={item.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 shrink-0">
                                    <span className="text-xs font-bold text-slate-500">
                                        {getUserInitial(item.user)}
                                    </span>
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isMe
                                ? 'bg-green-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                }`}>
                                <p className="text-sm break-words whitespace-pre-wrap">{item.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-200' : 'text-slate-400'}`}>
                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-slate-100 shrink-0 mb-safe">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
                        <ImageIcon size={24} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="メッセージを入力..."
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-green-600 text-white p-2.5 rounded-full shadow-md shadow-green-100 disabled:opacity-50 disabled:shadow-none hover:bg-green-500 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
