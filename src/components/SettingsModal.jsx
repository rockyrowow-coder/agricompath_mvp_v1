import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Sprout, ChevronRight, Settings, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CROPS } from '../data/constants';
import { FieldRegistration } from './FieldRegistration';
import { useNavigate } from 'react-router-dom';

export function SettingsModal({ onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('crops'); // crops, fields, account
    const [myCrops, setMyCrops] = useState(MOCK_CROPS); // Initialize with mock data to prevent empty state
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [editingCrop, setEditingCrop] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User Profile for crops (mocking structure, assuming profile has crops array or we use settings table)
                // For MVP, we might fetch from 'profiles' or just local state if not fully persistent
                // Let's assume we fetch fields
                const { data: fieldsData, error } = await supabase.from('fields').select('*');
                if (error) throw error;
                if (fieldsData) setFields(fieldsData);

                // Fetch Crop Settings to see which crops are "active" or configured
                // Or just use MOCK_CROPS as selectable
                // setMyCrops(MOCK_CROPS); // Already initialized
            } catch (error) {
                console.error("Error fetching settings data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleFieldRegistered = (newField) => {
        setFields([...fields, newField]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl pointer-events-auto h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center space-x-2">
                            <Settings className="text-slate-400" />
                            <span>設定</span>
                        </h2>

                        <nav className="space-y-2 flex-1">
                            <button onClick={() => setActiveTab('crops')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'crops' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
                                作物・品種設定
                            </button>
                            <button onClick={() => setActiveTab('fields')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'fields' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
                                圃場登録・マップ
                            </button>
                            <button onClick={() => setActiveTab('account')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'account' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
                                アカウント情報
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-slate-800">
                                {activeTab === 'crops' ? '作物の詳細設定' : activeTab === 'fields' ? '圃場管理' : 'アカウント設定'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {activeTab === 'crops' && (
                                editingCrop ? (
                                    <CropSettingsEditor crop={editingCrop} onClose={() => setEditingCrop(null)} />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myCrops.map(crop => (
                                            <div key={crop} className="p-5 rounded-2xl border border-slate-200 hover:border-green-200 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                            <Sprout size={20} />
                                                        </div>
                                                        <span className="font-bold text-lg text-slate-800">{crop}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                                    <button
                                                        onClick={() => setEditingCrop(crop)}
                                                        className="text-sm font-bold text-slate-400 hover:text-green-600 flex items-center space-x-1"
                                                    >
                                                        <span>詳細設定 (作業・病害虫)</span>
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {activeTab === 'fields' && (
                                <div className="space-y-8">
                                    {/* Register Box */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <FieldRegistration onRegister={handleFieldRegistered} />
                                    </div>

                                    {/* Field Map Link */}
                                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-lg">圃場マップ機能</h4>
                                            <p className="text-sm text-blue-700 font-bold mt-1">
                                                Google Maps / 衛星写真を使って圃場を登録・確認できます。
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => navigate('/fields'), 100);
                                            }}
                                            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-500 transition-colors"
                                        >
                                            マップを開く
                                        </button>
                                    </div>

                                    {/* List */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-4">登録済み圃場リスト</h4>
                                        <div className="space-y-3">
                                            {fields.length === 0 && <p className="text-slate-400 font-bold text-center py-8">登録された圃場はありません</p>}
                                            {fields.map(field => (
                                                <div key={field.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{field.name}</p>
                                                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                                                            {field.type === 'field' ? '畑' : '果樹/ハウス'}  • {field.area}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="text-center py-20 text-slate-400 font-bold">
                                    アカウント設定機能 (実装予定)
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for editing specific crop settings
function CropSettingsEditor({ crop, onClose }) {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ work_types: [], pests: [], diseases: [] });
    const [newWork, setNewWork] = useState('');
    const [newPest, setNewPest] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('crop_settings').select('*').eq('user_id', user.id).eq('crop_name', crop).single();
            if (data) setSettings({
                work_types: data.work_types || [],
                pests: data.pests || [],
                diseases: data.diseases || []
            });
        };
        fetch();
    }, [crop, user.id]);

    const save = async (newSet) => {
        setSettings(newSet);
        await supabase.from('crop_settings').upsert({
            user_id: user.id,
            crop_name: crop,
            ...newSet,
            updated_at: new Date()
        });
    };

    const addWork = () => {
        if (!newWork) return;
        save({ ...settings, work_types: [...settings.work_types, newWork] });
        setNewWork('');
    };

    const removeWork = (w) => {
        save({ ...settings, work_types: settings.work_types.filter(i => i !== w) });
    };

    // Simplified for Pest/Disease (just one list for now called 'pests' in UI logic)
    const addPest = () => {
        if (!newPest) return;
        save({ ...settings, pests: [...settings.pests, newPest] });
        setNewPest('');
    };

    const removePest = (p) => {
        save({ ...settings, pests: settings.pests.filter(i => i !== p) });
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-10">
            <button onClick={onClose} className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 font-bold mb-4">
                <ChevronRight size={20} className="rotate-180" />
                <span>戻る</span>
            </button>

            <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Sprout size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{crop}</h2>
                    <p className="text-slate-400 font-bold text-sm">カスタム設定エディタ</p>
                </div>
            </div>

            {/* Work Content */}
            <div className="space-y-4">
                <h4 className="font-bold text-slate-700 flex items-center space-x-2">
                    <Settings size={18} />
                    <span>作業内容のカスタマイズ</span>
                </h4>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newWork}
                        onChange={e => setNewWork(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="新しい作業名 (例: 葉面散布)"
                    />
                    <button onClick={addWork} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-500">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {settings.work_types.length === 0 && <span className="text-slate-300 text-sm font-bold">追加されたカスタム作業はありません</span>}
                    {settings.work_types.map(w => (
                        <span key={w} className="bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2">
                            <span>{w}</span>
                            <button onClick={() => removeWork(w)} className="text-green-400 hover:text-green-600"><X size={14} /></button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-slate-100 my-6"></div>

            {/* Hests/Diseases */}
            <div className="space-y-4">
                <h4 className="font-bold text-slate-700 flex items-center space-x-2">
                    <Leaf size={18} />
                    <span>発生予察・対象病害虫</span>
                </h4>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newPest}
                        onChange={e => setNewPest(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="病害虫名 (例: コナジラミ)"
                    />
                    <button onClick={addPest} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-500">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {settings.pests.length === 0 && <span className="text-slate-300 text-sm font-bold">追加された項目はありません</span>}
                    {settings.pests.map(p => (
                        <span key={p} className="bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2">
                            <span>{p}</span>
                            <button onClick={() => removePest(p)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
