import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommunityScreen() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my_communities'); // 'my_communities' or 'find'
    const [myCommunities, setMyCommunities] = useState([]);
    const [allCommunities, setAllCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');
    const [repEmail, setRepEmail] = useState('');
    const [repPhone, setRepPhone] = useState('');
    const [repJaNumber, setRepJaNumber] = useState('');

    useEffect(() => {
        if (user) {
            fetchMyCommunities();
            fetchAllCommunities();
        }
    }, [user]);

    const fetchMyCommunities = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('community_members')
                .select(`
                    id,
                    role,
                    communities (
                        id,
                        name,
                        description,
                        image_url,
                        created_by
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;
            setMyCommunities(data.map(item => ({ ...item.communities, role: item.role })));
        } catch (error) {
            console.error('Error fetching my communities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCommunities = async () => {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Sort: Default Community First
            const sorted = data.sort((a, b) => {
                const isADefault = a.name.includes('守山メロン');
                const isBDefault = b.name.includes('守山メロン');
                if (isADefault && !isBDefault) return -1;
                if (!isADefault && isBDefault) return 1;
                return 0; // Keep original order (created_at desc)
            });

            setAllCommunities(sorted);
        } catch (error) {
            console.error('Error fetching all communities:', error);
        }
    };

    const handleCreateCommunity = async () => {
        if (!newCommunityName.trim()) return;

        try {
            // 1. Create Community
            const { data: communityData, error: communityError } = await supabase
                .from('communities')
                .insert([{
                    name: newCommunityName,
                    description: newCommunityDesc,
                    created_by: user.id,
                    rep_email: repEmail,
                    rep_phone: repPhone,
                    rep_ja_number: repJaNumber
                }])
                .select()
                .single();

            if (communityError) throw communityError;

            // 2. Add creator as admin member
            const { error: memberError } = await supabase
                .from('community_members')
                .insert([{
                    community_id: communityData.id,
                    user_id: user.id,
                    role: 'admin'
                }]);

            if (memberError) throw memberError;

            alert('コミュニティを作成しました！');
            setNewCommunityName('');

            setNewCommunityDesc('');
            setRepEmail('');
            setRepPhone('');
            setRepJaNumber('');
            setShowCreateModal(false);
            fetchMyCommunities();
            fetchAllCommunities();
        } catch (error) {
            alert('作成に失敗しました: ' + error.message);
        }
    };

    const handleJoinCommunity = async (communityId) => {
        try {
            const { error } = await supabase
                .from('community_members')
                .insert([{
                    community_id: communityId,
                    user_id: user.id,
                    role: 'member'
                }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert('すでに参加しています');
                } else {
                    throw error;
                }
            } else {
                alert('参加しました！');
                fetchMyCommunities();
            }
        } catch (error) {
            alert('参加に失敗しました: ' + error.message);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 pb-24">
            {/* Tab Header */}
            <div className="bg-white px-4 pt-4 pb-0 shadow-sm sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Users className="mr-2 text-green-600" /> コミュニティ
                </h2>
                <div className="flex space-x-6 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('my_communities')}
                        className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'my_communities' ? 'text-green-600' : 'text-slate-400'}`}
                    >
                        参加中
                        {activeTab === 'my_communities' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'find' ? 'text-green-600' : 'text-slate-400'}`}
                    >
                        さがす
                        {activeTab === 'find' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {activeTab === 'my_communities' && (
                    <>
                        {myCommunities.length === 0 && !loading ? (
                            <div className="text-center py-10">
                                <p className="text-slate-400 font-bold mb-4">まだ参加しているコミュニティはありません</p>
                                <button
                                    onClick={() => setActiveTab('find')}
                                    className="text-green-600 font-bold underline"
                                >
                                    コミュニティを探す
                                </button>
                            </div>
                        ) : (
                            myCommunities.map(comm => (
                                <div key={comm.id} onClick={() => navigate(`/community/${comm.id}`)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{comm.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{comm.description || '説明なし'}</p>
                                            {comm.role === 'admin' && (
                                                <span className="inline-block bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold mt-2">管理者</span>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-full">
                                            <ArrowRight size={20} className="text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="fixed bottom-24 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-200 hover:bg-green-500 transition-transform active:scale-90"
                        >
                            <Plus size={24} />
                        </button>
                    </>
                )}

                {activeTab === 'find' && (
                    <div className="space-y-3">
                        {allCommunities.filter(c => !myCommunities.some(mc => mc.id === c.id)).map(comm => (
                            <div key={comm.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-bold text-slate-800">{comm.name}</h3>
                                            {comm.name.includes('守山メロン') && (
                                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">公式</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{comm.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleJoinCommunity(comm.id)}
                                        className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors ml-3"
                                    >
                                        参加する
                                    </button>
                                </div>
                            </div>
                        ))}
                        {allCommunities.filter(c => !myCommunities.some(mc => mc.id === c.id)).length === 0 && (
                            <p className="text-center text-slate-400 font-bold py-8">新しいコミュニティはありません</p>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in zoom-in-95">
                        <h3 className="font-bold text-xl text-slate-800 mb-4">コミュニティを作成</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1">コミュニティ名</label>
                                <input
                                    type="text"
                                    value={newCommunityName}
                                    onChange={e => setNewCommunityName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="例: トマト研究会"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1">説明 (任意)</label>
                                <textarea
                                    value={newCommunityDesc}
                                    onChange={e => setNewCommunityDesc(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                                    placeholder="コミュニティの目的など"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1">代表者メール</label>
                                    <input type="email" value={repEmail} onChange={e => setRepEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1">電話番号</label>
                                    <input type="tel" value={repPhone} onChange={e => setRepPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="090-0000-0000" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1">JA組合員番号</label>
                                <input type="text" value={repJaNumber} onChange={e => setRepJaNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="12345678" />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleCreateCommunity}
                                    disabled={!newCommunityName.trim()}
                                    className="flex-1 py-3 text-white font-bold bg-green-600 rounded-xl hover:bg-green-500 disabled:opacity-50"
                                >
                                    作成
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
