import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash, Leaf, Droplets, FlaskConical, PenTool, Image, MapPin, ChevronDown, CheckCircle2, MessageCircle, Camera, Timer, ClipboardList, Beaker, Globe, Users, Plus, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CROPS, WORK_TYPES, MOCK_TARGETS, SPREADING_METHODS, USER_CROPS, MOCK_FIELDS as FALLBACK_FIELDS, MOCK_WORKERS } from '../data/constants';
import { MapSelector } from './MapSelector';
import { useVoiceInput } from '../hooks/useVoiceInput';

export function RecordModal({ isOpen, onClose, type = 'work', initialData = null, onSubmit, inventory, communities }) {
    const { user } = useAuth();
    const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
    const [activeVoiceField, setActiveVoiceField] = useState(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        timeStart: "08:00",
        timeEnd: "09:00",
        field: '',
        range: "全面",
        crop: USER_CROPS[0] || '',
        worker: user?.user_metadata?.name || MOCK_WORKERS[0],
        target: "",
        pesticide: "",
        dilution: "1000",
        amount: "100",
        unit: 'L',
        mixes: [],
        method: SPREADING_METHODS[0],
        memo: "",
        workType: "",
        isMixing: false,
        yieldAmount: "",
        yieldUnit: "kg",
        images: [],
        sendToLine: false
    });

    const [showMap, setShowMap] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerStartTime, setTimerStartTime] = useState(null);
    const [mixInput, setMixInput] = useState("");
    const [mixRatio, setMixRatio] = useState("");
    const [mixAmount, setMixAmount] = useState("");

    // Data States
    const [fields, setFields] = useState([]);
    const [cropSettings, setCropSettings] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sharing Settings
    const [sharingSettings, setSharingSettings] = useState({
        isPublic: true,
        sharedCommunities: communities ? communities.map(c => c.id) : []
    });

    // Voice Input Effect
    useEffect(() => {
        if (transcript && activeVoiceField) {
            if (activeVoiceField === 'memo') {
                setFormData(prev => ({ ...prev, memo: prev.memo + (prev.memo ? ' ' : '') + transcript }));
            } else if (activeVoiceField === 'mixInput') {
                setMixInput(transcript);
            }
            // Clear transcript after consuming
            setTranscript('');
        }
    }, [transcript, activeVoiceField]);

    const handleVoiceStart = (field) => {
        setActiveVoiceField(field);
        startListening();
    };

    // Initial Data & Fields Fetch
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    useEffect(() => {
        const fetchFields = async () => {
            if (!user) {
                setFields(FALLBACK_FIELDS);
                return;
            }
            const { data } = await supabase.from('fields').select('id, name, type');
            if (data && data.length > 0) {
                setFields(data.map(f => f.name));
                if (!formData.field) setFormData(prev => ({ ...prev, field: data[0].name }));
            } else {
                setFields(FALLBACK_FIELDS);
                if (!formData.field) setFormData(prev => ({ ...prev, field: FALLBACK_FIELDS[0] }));
            }
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
        if (!WORK_TYPES) return [];
        let types = WORK_TYPES[formData.crop] || WORK_TYPES['others'] || [];
        if (cropSettings?.work_types && cropSettings.work_types.length > 0) {
            types = [...new Set([...types, ...cropSettings.work_types])];
        }
        return types;
    };

    // Helper to get available targets
    const getTargets = () => {
        let targets = MOCK_TARGETS ? [...MOCK_TARGETS] : [];
        if (cropSettings?.pests) {
            targets = [...new Set([...targets, ...cropSettings.pests])];
        }
        if (cropSettings?.diseases) {
            targets = [...new Set([...targets, ...cropSettings.diseases])];
        }
        return targets;
    };

    const toggleCommunity = (id) => {
        if (sharingSettings.sharedCommunities.includes(id)) {
            setSharingSettings({ ...sharingSettings, sharedCommunities: sharingSettings.sharedCommunities.filter(cid => cid !== id) });
        } else {
            setSharingSettings({ ...sharingSettings, sharedCommunities: [...sharingSettings.sharedCommunities, id] });
        }
    };

    const addMix = () => { if (mixInput) { setFormData({ ...formData, mixes: [...formData.mixes, { name: mixInput, ratio: mixRatio, amount: mixAmount }] }); setMixInput(""); setMixRatio(""); setMixAmount(""); } };
    const removeMix = (index) => { const newMixes = [...formData.mixes]; newMixes.splice(index, 1); setFormData({ ...formData, mixes: newMixes }); };

    const toggleTimer = () => {
        if (timerRunning) {
            // Stop
            setTimerRunning(false);
            const end = new Date();
            const start = timerStartTime;
            const diffCols = (end - start) / 1000 / 60; // minutes
            setFormData({ ...formData, timeEnd: end.toTimeString().slice(0, 5), amount: `${Math.round(diffCols)}` }); // Storing as number string for amount
        } else {
            // Start
            setTimerRunning(true);
            setTimerStartTime(new Date());
            setFormData({ ...formData, timeStart: new Date().toTimeString().slice(0, 5) });
        }
    };

    const handleSubmit = async () => {
        if (type === 'tweet' && formData.images.length === 0) return alert("写真を追加してください (必須)");
        if (type === 'pesticide' && !formData.pesticide) return alert("農薬/資材を選択してください");
        if (type === 'work' && !formData.workType) return alert("作業内容を選択してください");

        setLoading(true);
        try {
            const success = await onSubmit({ ...formData, sharing: sharingSettings });
            if (success !== false) {
                onClose();
            }
        } catch (error) {
            alert('保存に失敗しました: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMapSelect = (field, range) => {
        setFormData({ ...formData, field, range });
        setShowMap(false);
    };

    const availableWorkTypes = getWorkTypes();
    const availableInventory = inventory ? inventory.filter(i =>
        type === 'pesticide' ? (i.category === '農薬' || i.category === '除草剤' || i.category === '殺菌剤' || i.category === '殺虫剤') :
            type === 'fertilizer' ? (i.category === '肥料' || i.category === '液肥') : true
    ) : [];

    if (!isOpen) return null;

    if (type === 'tweet') {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end">
                <div className="bg-white rounded-t-3xl shadow-2xl h-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400"><X size={24} /></button>
                        <h2 className="text-xl font-bold text-slate-800">つぶやき投稿</h2>
                        <button onClick={handleSubmit} className="text-white bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold text-sm shadow-md transition-transform active:scale-95">投稿</button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="bg-slate-50 rounded-2xl h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 mb-6 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors group">
                            <Camera size={48} className="text-slate-400 mb-3 group-hover:text-green-500 transition-colors" />
                            <span className="text-slate-500 font-bold group-hover:text-green-600">写真を撮影・追加 (必須)</span>
                        </div>
                        <div className="relative">
                            <textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-5 h-48 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-lg placeholder:text-slate-400 resize-none font-medium" placeholder="現場の様子や気づきを入力..."></textarea>
                            <button onClick={() => handleVoiceStart('memo')} className={`absolute right-4 bottom-4 p-2 rounded-full ${isListening && activeVoiceField === 'memo' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-green-100 hover:text-green-600'}`}>
                                <Mic size={20} />
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-2">
                                <span className="bg-[#06C755] text-white p-1 rounded-full"><MessageCircle size={14} fill="white" /></span>
                                <span className="text-sm font-bold text-slate-700">LINEグループにも送信</span>
                            </div>
                            <div onClick={() => setFormData({ ...formData, sendToLine: !formData.sendToLine })} className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${formData.sendToLine ? 'bg-[#06C755]' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.sendToLine ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl shadow-2xl h-full max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400"><X size={24} /></button>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                        {type === 'pesticide' ? <span className="bg-red-100 text-red-600 p-1.5 rounded-lg mr-2"><Beaker size={18} /></span> :
                            type === 'accounting' ? <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg mr-2"><ClipboardList size={18} /></span> :
                                <span className="bg-slate-100 text-slate-600 p-1.5 rounded-lg mr-2"><ClipboardList size={18} /></span>}
                        <span>{type === 'pesticide' ? '農薬使用記録' : type === 'fertilizer' ? '施肥記録' : type === 'accounting' ? '経理記録' : '作業記録'}</span>
                    </h2>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                    {/* Photo Upload */}
                    <div className="bg-slate-50 rounded-2xl h-32 flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center space-y-2 text-slate-400">
                            <Camera size={24} />
                            <span className="text-xs font-bold">証拠写真を撮影 (必須)</span>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center space-x-2 text-green-600 font-extrabold text-xs uppercase tracking-wider bg-green-50 inline-block px-3 py-1 rounded-md mb-2"><Timer size={14} /> <span>日時・場所・作物</span></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">日付</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">対象作物</label><select value={formData.crop} onChange={(e) => setFormData({ ...formData, crop: e.target.value, workType: "" })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">{MOCK_CROPS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        </div>

                        {/* Map Selection Toggle */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-500">圃場と範囲</label>
                                <button onClick={() => setShowMap(!showMap)} className="text-green-600 text-xs font-bold hover:underline">
                                    {showMap ? '入力を閉じる' : '地図で選択'}
                                </button>
                            </div>

                            {showMap ? (
                                <MapSelector
                                    fields={fields}
                                    selectedField={formData.field}
                                    selectedRange={formData.range}
                                    onSelect={handleMapSelect}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">
                                        {fields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"><option value="全面">全面</option><option value="東側">東側</option><option value="西側">西側</option><option value="外周のみ">外周のみ</option><option value="スポット">スポット</option></select>
                                </div>
                            )}
                        </div>
                    </section>

                    {type === 'work' && (
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 text-green-600 font-extrabold text-xs uppercase tracking-wider bg-green-50 inline-block px-3 py-1 rounded-md mb-2"><ClipboardList size={14} /> <span>作業詳細</span></div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">作業内容 (必須)</label>
                                <select value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">
                                    <option value="" disabled>選択してください</option>
                                    {availableWorkTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Timer Logic */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-slate-500">作業時間 (自動計測)</label>
                                    {timerRunning && <span className="text-xs font-bold text-red-500 animate-pulse">● 計測中...</span>}
                                </div>
                                <div className="flex space-x-3 items-center">
                                    <button onClick={toggleTimer} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${timerRunning ? 'bg-red-500 text-white shadow-red-200 shadow-lg' : 'bg-slate-800 text-white shadow-lg'}`}>
                                        {timerRunning ? <><span className="w-3 h-3 bg-white rounded-sm"></span><span>停止・完了</span></> : <><div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div><span>作業開始</span></>}
                                    </button>
                                    <div className="w-24 text-center">
                                        <div className="text-xs font-bold text-slate-400">実績</div>
                                        <div className="text-lg font-extrabold text-slate-800">{formData.amount ? formData.amount + '分' : "0分"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">開始</label><input type="time" value={formData.timeStart} onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">終了</label><input type="time" value={formData.timeEnd} onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" /></div>
                            </div>
                        </section>
                    )}

                    {(type === 'pesticide' || type === 'fertilizer') && (
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 text-green-600 font-extrabold text-xs uppercase tracking-wider bg-green-50 inline-block px-3 py-1 rounded-md mb-2"><Beaker size={14} /> <span>使用資材・方法</span></div>

                            {/* Spreading Method */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">散布方法</label>
                                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">
                                    {SPREADING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* Main Agent */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-red-500 ml-1">主剤 (在庫連動)</label>
                                    <div className="flex items-center space-x-2">
                                        <label className="text-xs font-bold text-slate-400">混用あり？</label>
                                        <div onClick={() => setFormData({ ...formData, isMixing: !formData.isMixing })} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${formData.isMixing ? 'bg-green-500' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isMixing ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <select value={formData.pesticide} onChange={(e) => setFormData({ ...formData, pesticide: e.target.value })} className="w-full bg-red-50 border border-red-200 text-red-900 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none">
                                    <option value="" disabled>在庫から選択してください</option>
                                    {availableInventory.map(item => (
                                        <option key={item.id} value={item.name} disabled={item.quantity <= 0}>
                                            {item.name} (残: {item.quantity}{item.unit}) {item.quantity <= 0 ? '(在庫切れ)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dilution & Amount for Main Agent */}
                            <div className="grid grid-cols-2 gap-4">
                                {type === 'pesticide' && <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">希釈倍率</label><input type="number" value={formData.dilution} onChange={(e) => setFormData({ ...formData, dilution: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 text-right focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" placeholder="1000" /></div>}
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">使用量</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 text-right focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" placeholder="100" /></div>
                            </div>

                            {/* Mixing Section */}
                            {formData.isMixing && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-3 animate-in slide-in-from-top-1">
                                    <p className="text-xs font-bold text-slate-500">混用薬剤の追加</p>
                                    {formData.mixes.map((mix, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                                            <span>{mix.name} ({mix.ratio ? mix.ratio + '倍' : ''} {mix.amount})</span>
                                            <button onClick={() => removeMix(idx)} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <div className="flex space-x-2">
                                        <input type="text" value={mixInput} onChange={(e) => setMixInput(e.target.value)} placeholder="薬剤名" className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-green-500" />
                                        <input type="number" value={mixRatio} onChange={(e) => setMixRatio(e.target.value)} placeholder="倍率" className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-green-500" />
                                        <input type="text" value={mixAmount} onChange={(e) => setMixAmount(e.target.value)} placeholder="量" className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-green-500" />
                                        <button onClick={addMix} className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold hover:bg-slate-700"><Plus size={16} /></button>
                                        <button onClick={() => handleVoiceStart('mixInput')} className={`bg-slate-200 text-slate-600 px-3 rounded-lg text-xs font-bold hover:bg-green-100 ${isListening && activeVoiceField === 'mixInput' ? 'bg-red-500 text-white animate-pulse' : ''}`}><Mic size={16} /></button>
                                    </div>
                                </div>
                            )}

                            {type === 'pesticide' && (
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">対象 (虫・病気など)</label><select value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"><option value="" disabled>選択してください</option>{getTargets().map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                            )}
                        </section>
                    )}

                    {type === 'accounting' && (
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 text-yellow-600 font-extrabold text-xs uppercase tracking-wider bg-yellow-50 inline-block px-3 py-1 rounded-md mb-2"><ClipboardList size={14} /> <span>経理詳細</span></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">金額 (円)</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 text-right focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" placeholder="0" /></div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">勘定科目</label>
                                <select value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">
                                    <option value="" disabled>選択してください</option>
                                    <option value="種苗費">種苗費</option>
                                    <option value="肥料費">肥料費</option>
                                    <option value="農薬衛生費">農薬衛生費</option>
                                    <option value="農具費">農具費</option>
                                    <option value="修繕費">修繕費</option>
                                    <option value="動力光熱費">動力光熱費</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>
                        </section>
                    )}

                    {type !== 'pesticide' && type !== 'fertilizer' && type !== 'work' && type !== 'accounting' && (
                        <section className="space-y-4"><div className="flex items-center space-x-2 text-green-600 font-extrabold text-xs uppercase tracking-wider bg-green-50 inline-block px-3 py-1 rounded-md mb-2"><ClipboardList size={14} /> <span>{type === 'harvest' ? '収穫詳細' : '詳細'}</span></div><textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl p-4 h-40 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none resize-none" placeholder="詳細を入力..."></textarea></section>
                    )}

                    <section className="space-y-4">
                        <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold text-slate-500 ml-1">メモ (任意)</label>
                            <div className="relative">
                                <textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none resize-none"></textarea>
                                <button onClick={() => handleVoiceStart('memo')} className={`absolute right-2 bottom-2 p-2 rounded-full ${isListening && activeVoiceField === 'memo' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-green-600'}`}>
                                    <Mic size={18} />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center space-x-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider bg-blue-50 inline-block px-3 py-1 rounded-md mb-2"><Globe size={14} /> <span>公開設定</span></div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <p className="text-xs font-bold text-slate-400">記録の共有先を選択 (デフォルト: 全て)</p>

                            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 cursor-pointer" onClick={() => setSharingSettings({ ...sharingSettings, isPublic: !sharingSettings.isPublic })}>
                                <div className="flex items-center space-x-3">
                                    <Globe size={20} className="text-slate-500" />
                                    <span className="font-bold text-slate-700">全体に公開</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${sharingSettings.isPublic ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                    {sharingSettings.isPublic && <CheckCircle2 size={16} className="text-white" />}
                                </div>
                            </div>

                            {communities && communities.map(community => (
                                <div key={community.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 cursor-pointer" onClick={() => toggleCommunity(community.id)}>
                                    <div className="flex items-center space-x-3">
                                        <Users size={20} className="text-slate-500" />
                                        <span className="font-bold text-slate-700">{community.name}</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${sharingSettings.sharedCommunities.includes(community.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                        {sharingSettings.sharedCommunities.includes(community.id) && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"><button onClick={handleSubmit} className="w-full py-4 rounded-2xl font-bold text-xl shadow-xl bg-green-600 hover:bg-green-500 text-white shadow-green-100 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"><CheckCircle2 size={24} /><span>記録して完了</span></button></div>
            </div>
        </div>
    );
}
