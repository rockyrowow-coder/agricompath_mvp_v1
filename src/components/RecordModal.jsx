import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash, Leaf, Droplets, FlaskConical, PenTool, Image, MapPin, ChevronDown, CheckCircle2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CROPS, WORK_TYPES, MOCK_TARGETS } from '../data/constants'; // Verified exports
import { MapSelector } from './MapSelector';

export function RecordModal({ isOpen, onClose, type = 'work', initialData = null, onSubmit }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        field: '',
        crop: '',
        workType: '',
        target: '', // pest or disease
        pesticide: '',
        fertilizer: '',
        amount: '',
        unit: 'L',
        dilution: '',
        method: '', // application method
        memo: '',
        images: []
    });

    // Phase 10: Dynamic Options
    const [fields, setFields] = useState([]);
    const [cropSettings, setCropSettings] = useState(null);
    const [sources, setSources] = useState([]); // For procurement, maybe unused here but kept for safety
    const [loading, setLoading] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    // Fetch Fields
    useEffect(() => {
        const fetchFields = async () => {
            if (!user) return;
            const { data } = await supabase.from('fields').select('id, name, type');
            if (data) setFields(data);
        };
        fetchFields();
    }, [user]);

    // Fetch Crop Settings
    useEffect(() => {
        const fetchCropSettings = async () => {
            if (!user || !formData.crop) {
                setCropSettings(null);
                return;
            }
            const { data } = await supabase.from('crop_settings')
                .select('*')
                .eq('user_id', user.id)
                .eq('crop_name', formData.crop)
                .single();
            setCropSettings(data || null);
        };
        fetchCropSettings();
    }, [user, formData.crop]);


    // Helper to get available work types
    const getWorkTypes = () => {
        // Default from constants
        let types = WORK_TYPES[formData.crop] || WORK_TYPES['others'] || [];

        // Append user custom settings if any
        if (cropSettings?.work_types && cropSettings.work_types.length > 0) {
            types = [...new Set([...types, ...cropSettings.work_types])];
        }
        return types;
    };

    // Helper to get available targets (pests/diseases)
    const getTargets = () => {
        let targets = [...MOCK_TARGETS]; // Global default
        if (cropSettings?.pests) {
            targets = [...new Set([...targets, ...cropSettings.pests])];
        }
        if (cropSettings?.diseases) {
            targets = [...new Set([...targets, ...cropSettings.diseases])];
        }
        return targets;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await onSubmit(formData);
            if (success !== false) { // If returns true or undefined(legacy), we close. If explicit false, keep open.
                onClose();
            }
        } catch (error) {
            alert('保存に失敗しました: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                    <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-xl ${type === 'pesticide' ? 'bg-red-100 text-red-600' : type === 'fertilizer' ? 'bg-yellow-100 text-yellow-600' : type === 'tweet' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {type === 'pesticide' ? <FlaskConical size={20} /> : type === 'fertilizer' ? <Leaf size={20} /> : type === 'tweet' ? <MessageCircle size={20} /> : <PenTool size={20} />}
                        </div>
                        <h2 className="font-bold text-lg text-slate-800">
                            {type === 'pesticide' ? '防除記録' : type === 'fertilizer' ? '施肥記録' : type === 'tweet' ? 'つぶやき' : '作業記録'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">日付</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        </div>
                    </div>

                    {/* Field Selection (Skip for Tweet) */}
                    {type !== 'tweet' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">場所 (圃場・ハウス)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    list="field-list"
                                    value={formData.field}
                                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 pl-10 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"
                                    placeholder="圃場を選択または入力"
                                />
                                <datalist id="field-list">
                                    {fields.map(f => <option key={f.id} value={f.name} />)}
                                </datalist>
                                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Crop (Skip for Tweet) */}
                    {type !== 'tweet' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">作物</label>
                            <div className="relative">
                                <select
                                    value={formData.crop}
                                    onChange={e => setFormData({ ...formData, crop: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-800 appearance-none focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="">選択してください</option>
                                    {MOCK_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <Leaf size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                <ChevronDown size={18} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Work Type (if type == work) */}
                    {type === 'work' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">作業内容</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    list="work-list"
                                    value={formData.workType}
                                    onChange={e => setFormData({ ...formData, workType: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="作業内容を選択または入力"
                                />
                                <datalist id="work-list">
                                    {getWorkTypes().map(w => <option key={w} value={w} />)}
                                </datalist>
                                <PenTool size={18} className="absolute left-3 top-3.5 text-slate-400" />
                            </div>
                        </div>
                    )}

                    {/* Pesticide/Fertilizer Inputs */}
                    {(type === 'pesticide' || type === 'fertilizer') && (
                        <>
                            {/* Target (Pest/Disease) for Pesticide */}
                            {type === 'pesticide' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">対象 (害虫・病気)</label>
                                    <input
                                        type="text"
                                        list="target-list"
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                    <datalist id="target-list">
                                        {getTargets().map(t => <option key={t} value={t} />)}
                                    </datalist>
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">資材名</label>
                                <input
                                    type="text"
                                    value={type === 'pesticide' ? formData.pesticide : formData.fertilizer}
                                    onChange={e => setFormData({ ...formData, [type === 'pesticide' ? 'pesticide' : 'fertilizer']: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder={type === 'pesticide' ? '薬剤名' : '肥料名'}
                                />
                            </div>

                            {/* Amount & Dilution */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">倍率</label>
                                    <input
                                        type="number"
                                        value={formData.dilution}
                                        onChange={e => setFormData({ ...formData, dilution: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="1000"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">使用量 (L)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Memo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">メモ</label>
                        <textarea
                            value={formData.memo}
                            onChange={e => setFormData({ ...formData, memo: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                            placeholder="気づきや詳細..."
                        />
                    </div>

                    {/* Map Selection (Reuse implementation) */}
                    <MapSelector fieldName={formData.field} />

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-3xl pb-8 md:pb-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:bg-slate-300"
                    >
                        {loading ? <span>保存中...</span> : (
                            <>
                                <CheckCircle2 size={20} />
                                <span>記録を保存</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
