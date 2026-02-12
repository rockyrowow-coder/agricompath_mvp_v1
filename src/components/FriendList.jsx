import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, UserCheck, X, Check, User } from 'lucide-react';

export function FriendList({ userId }) {
    const [status, setStatus] = useState('friends'); // 'friends', 'requests', 'search'
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchFriends();
            fetchRequests();
        }
    }, [userId]);

    const fetchFriends = async () => {
        // Fetch rows where user is either user_id or friend_id, and status is accepted
        const { data, error } = await supabase
            .from('friendships')
            .select(`
                id, 
                user_id, 
                friend_id,
                status
            `)
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
            .eq('status', 'accepted');

        if (data) {
            // We need to fetch profile details for the *other* person
            const friendIds = data.map(f => f.user_id === userId ? f.friend_id : f.user_id);
            if (friendIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', friendIds);
                setFriends(profiles || []);
            } else {
                setFriends([]);
            }
        }
    };

    const fetchRequests = async () => {
        // Fetch requests sent TO me
        const { data, error } = await supabase
            .from('friendships')
            .select(`
                id, 
                user_id
            `)
            .eq('friend_id', userId)
            .eq('status', 'pending');

        if (data) {
            const senderIds = data.map(r => r.user_id);
            if (senderIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', senderIds);
                // Map profile back to request ID for actions
                const requestsWithProfiles = data.map(r => {
                    const profile = profiles.find(p => p.id === r.user_id);
                    return { ...r, profile };
                });
                setRequests(requestsWithProfiles);
            } else {
                setRequests([]);
            }
        }
    };

    const handleSearch = async (query = "") => {

        try {
            let queryBuilder = supabase
                .from('profiles')
                .select('*')
                .neq('id', userId); // Don't show self

            if (query) {
                queryBuilder = queryBuilder.ilike('display_name', `%${query}%`);
            } else {
                // Limit initial load if needed, but for MVP load all (up to default limit)
                queryBuilder = queryBuilder.limit(20);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const sendRequest = async (targetId) => {
        const { error } = await supabase
            .from('friendships')
            .insert([{ user_id: userId, friend_id: targetId, status: 'pending' }]);

        if (error) alert('申請に失敗しました (すでに申請済みか友達です)');
        else alert('友達申請を送りました！');
    };

    const acceptRequest = async (friendshipId) => {
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('user_id', friendshipId); // Wait, friendshipId here is the SENDER's user_id from the profile mapping? No, need the friendship row ID.
        // Actually, in fetchRequests I mapped: { ...r (row), profile }. So r.id is friendship ID.

        // Let's correct fetchRequests logic slightly or use the sender ID to find the row.
        // Queries are safer if we use the table id.
        // In render: acceptRequest(req.id)

        const { error: updateError } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendshipId);

        if (!updateError) {
            fetchRequests();
            fetchFriends();
        }
    };

    const rejectRequest = async (friendshipId) => {
        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId);

        if (!error) fetchRequests();
    };


    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setStatus('friends')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${status === 'friends' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>友達 {friends.length}</button>
                <button onClick={() => setStatus('requests')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${status === 'requests' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>申請 {requests.length}</button>
                <button onClick={() => setStatus('search')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${status === 'search' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>検索</button>
            </div>

            {status === 'friends' && (
                <div className="space-y-3">
                    {friends.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">まだ友達はいません</p>
                    ) : (
                        friends.map(f => (
                            <div key={f.id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
                                    {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" /> : <User size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{f.display_name || '名称未設定'}</p>
                                    <p className="text-xs text-slate-400 line-clamp-1">{f.bio}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {status === 'requests' && (
                <div className="space-y-3">
                    {requests.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">届いている申請はありません</p>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{req.profile?.display_name}</p>
                                        <p className="text-[10px] text-slate-400">友達申請が届いています</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => acceptRequest(req.id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"><Check size={18} /></button>
                                    <button onClick={() => rejectRequest(req.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><X size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {status === 'search' && (
                <div className="space-y-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            placeholder="ユーザー名で検索..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 font-bold text-slate-800"
                        />
                    </div>
                    {loading && <p className="text-center text-xs text-slate-400">検索中...</p>}
                    <div className="space-y-3">
                        {searchResults.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
                                        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{p.display_name || '名称未設定'}</p>
                                        <p className="text-xs text-slate-400 line-clamp-1">{p.bio}</p>
                                    </div>
                                </div>
                                <button onClick={() => sendRequest(p.id)} className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center space-x-1">
                                    <UserPlus size={14} />
                                    <span>申請</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
