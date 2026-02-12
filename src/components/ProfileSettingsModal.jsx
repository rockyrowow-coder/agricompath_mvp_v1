import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProfileSettingsModal = ({ user, onClose }) => {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user || !user.id) return; // Guard clause
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setDisplayName(data.display_name || '');
            setBio(data.bio || '');
            setIsPublic(data.is_public);
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates = {
                id: user.id,
                display_name: displayName,
                bio,
                is_public: isPublic,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;
            alert('プロフィールを更新しました');
            onClose();
        } catch (error) {
            alert('更新に失敗しました: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">プロフィール設定</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">表示名</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="例: 田中農園"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">自己紹介</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                            placeholder="栽培している作物や地域など"
                        />
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${isPublic ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setIsPublic(!isPublic)}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPublic ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-600">プロフィールを公開する</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-base hover:bg-green-500 transition-colors shadow-lg shadow-green-200 mt-4"
                    >
                        {loading ? '保存中...' : '保存する'}
                    </button>
                </form>
            </div>
        </div>
    );
};
