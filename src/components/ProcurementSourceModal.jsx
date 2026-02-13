import React, { useState, useEffect } from 'react';
import { X, Plus, Store, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ProcurementSourceModal({ onClose }) {
    const { user } = useAuth();
    const [sources, setSources] = useState([]);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('shop');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const { data, error } = await supabase
                    .from('procurement_sources')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setSources(data || []);
            } catch (error) {
                console.error('Error fetching sources:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSources();
    }, [user]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        try {
            const { data, error } = await supabase
                .from('procurement_sources')
                .insert([{
                    user_id: user.id,
                    name: newName,
                    type: newType
                }])
                .select()
                .single();

            if (error) throw error;

            setSources([data, ...sources]);
            setNewName('');
        } catch (error) {
            alert('追加に失敗しました: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('削除してもよろしいですか？')) return;
        try {
            const { error } = await supabase
                .from('procurement_sources')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSources(sources.filter(s => s.id !== id));
        } catch (error) {
            alert('削除に失敗しました: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">購入・調達先の管理</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Add Form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500">新規追加</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="店舗名・JA名など"
                        />
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold focus:outline-none"
                        >
                            <option value="shop">店舗</option>
                            <option value="ja">JA</option>
                            <option value="online">ネット</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-500 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                        <Plus size={16} className="mr-1" /> 追加する
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {loading ? (
                        <p className="text-center text-xs text-slate-400">読み込み中...</p>
                    ) : sources.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-4">登録された調達先はありません</p>
                    ) : (
                        sources.map(source => (
                            <div key={source.id} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${source.type === 'ja' ? 'bg-green-100 text-green-600' :
                                        source.type === 'online' ? 'bg-blue-100 text-blue-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                        <Store size={16} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{source.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(source.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
