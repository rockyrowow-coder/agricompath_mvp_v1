import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FieldRegistration } from './FieldRegistration';

export function SettingsModal({ onClose, settings, onUpdate }) {
    const [localSettings, setLocalSettings] = useState(settings || { ja_id: '', line_info: '', custom_crops: [], custom_methods: [], custom_work_types: [] });
    const [newCrop, setNewCrop] = useState('');
    const [newMethod, setNewMethod] = useState('');
    const [newWorkType, setNewWorkType] = useState('');
    const { user } = useAuth();

    // Helper to update Supabase
    const saveSettings = async (newSettings) => {
        setLocalSettings(newSettings);
        if (onUpdate) onUpdate(newSettings);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    ...newSettings,
                    updated_at: new Date()
                });
            if (error) throw error;
        } catch (e) {
            console.error("Error saving settings:", e);
        }
    };

    const handleAddCrop = () => {
        if (newCrop && !localSettings.custom_crops.includes(newCrop)) {
            const updated = { ...localSettings, custom_crops: [...(localSettings.custom_crops || []), newCrop] };
            saveSettings(updated);
            setNewCrop('');
        }
    };

    const handleRemoveCrop = (crop) => {
        const updated = { ...localSettings, custom_crops: localSettings.custom_crops.filter(c => c !== crop) };
        saveSettings(updated);
    };

    const handleAddMethod = () => {
        if (newMethod && !localSettings.custom_methods.includes(newMethod)) {
            const updated = { ...localSettings, custom_methods: [...(localSettings.custom_methods || []), newMethod] };
            saveSettings(updated);
            setNewMethod('');
        }
    };

    const handleRemoveMethod = (method) => {
        const updated = { ...localSettings, custom_methods: localSettings.custom_methods.filter(m => m !== method) };
        saveSettings(updated);
    };

    const handleAddWorkType = () => {
        if (newWorkType && !localSettings.custom_work_types?.includes(newWorkType)) {
            const current = localSettings.custom_work_types || [];
            const updated = { ...localSettings, custom_work_types: [...current, newWorkType] };
            saveSettings(updated);
            setNewWorkType('');
        }
    };

    const handleRemoveWorkType = (type) => {
        const current = localSettings.custom_work_types || [];
        const updated = { ...localSettings, custom_work_types: current.filter(t => t !== type) };
        saveSettings(updated);
    };


    return (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">設定</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto pb-safe">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">アカウント連携</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 block">JA組合員番号</label>
                            <input
                                type="text"
                                value={localSettings.ja_id || ''}
                                onChange={(e) => saveSettings({ ...localSettings, ja_id: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="例: 12345678"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 block">LINE ID / 連携情報</label>
                            <input
                                type="text"
                                value={localSettings.line_info || ''}
                                onChange={(e) => saveSettings({ ...localSettings, line_info: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="LINE ID設定"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">カスタマイズ</h3>

                        {/* Custom Crops */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">栽培作物 (追加登録)</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {localSettings.custom_crops && localSettings.custom_crops.map(c => (
                                    <span key={c} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-1">
                                        <span>{c}</span>
                                        <button onClick={() => handleRemoveCrop(c)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newCrop}
                                    onChange={(e) => setNewCrop(e.target.value)}
                                    placeholder="新しい作物を入力"
                                    className="flex-1 text-sm p-2 rounded-lg border border-slate-200 outline-none"
                                />
                                <button onClick={handleAddCrop} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold"><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* Custom Methods */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">散布方法 (追加登録)</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {localSettings.custom_methods && localSettings.custom_methods.map(m => (
                                    <span key={m} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-1">
                                        <span>{m}</span>
                                        <button onClick={() => handleRemoveMethod(m)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMethod}
                                    onChange={(e) => setNewMethod(e.target.value)}
                                    placeholder="新しい方法を入力"
                                    className="flex-1 text-sm p-2 rounded-lg border border-slate-200 outline-none"
                                />
                                <button onClick={handleAddMethod} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold"><Plus size={16} /></button>
                            </div>
                        </div>
                        {/* Custom Work Types */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">作業項目 (追加登録)</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {localSettings.custom_work_types && localSettings.custom_work_types.map(t => (
                                    <span key={t} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-1">
                                        <span>{t}</span>
                                        <button onClick={() => handleRemoveWorkType(t)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newWorkType}
                                    onChange={(e) => setNewWorkType(e.target.value)}
                                    placeholder="新しい作業を入力"
                                    className="flex-1 text-sm p-2 rounded-lg border border-slate-200 outline-none"
                                />
                                <button onClick={handleAddWorkType} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold"><Plus size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">圃場管理 (Phase 5)</h3>
                        <FieldRegistration />
                    </div>
                </div>
            </div>
        </div>
    );
}
