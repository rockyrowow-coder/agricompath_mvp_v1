import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ChevronRight, CheckCircle2, Camera, Timer, Beaker, ClipboardList, Mic, Plus, MapPin, Search, AlertTriangle, MessageCircle, Calculator } from 'lucide-react';
import { MapSelector } from './MapSelector';
import { supabase } from '../lib/supabase';
import { MOCK_CROPS, MOCK_FIELDS, MOCK_WORKERS, MOCK_PESTICIDES, MOCK_METHODS, MOCK_TARGETS, WORK_TYPES, SPREADING_METHODS, MOCK_PESTICIDES_EXTENDED, INCOMPATIBLE_MIXES } from '../data/constants';

export function RecordModal({ type, onClose, onSubmit, inventory, settings }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        timeStart: "08:00",
        timeEnd: "09:00",
        field: MOCK_FIELDS[0],
        range: "全面",
        crop: MOCK_CROPS[0],
        worker: MOCK_WORKERS[0],
        target: "",
        pesticide: "",
        dilution: "1000",
        amount: "100",
        mixes: [],
        method: SPREADING_METHODS[0],
        memo: "",
        workType: "",
        isMixing: false,
        yieldAmount: "",
        yieldUnit: "kg",
        imageUrl: null
    });
    const [showMap, setShowMap] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerStartTime, setTimerStartTime] = useState(null);
    const [mixInput, setMixInput] = useState("");
    const [mixRatio, setMixRatio] = useState("");
    const [mixAmount, setMixAmount] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Merge defaults with User Settings
    const availableCrops = settings?.custom_crops ? [...MOCK_CROPS, ...settings.custom_crops] : MOCK_CROPS;
    const availableMethods = settings?.custom_methods ? [...SPREADING_METHODS, ...settings.custom_methods] : SPREADING_METHODS;

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Try uploading to 'images' bucket
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                console.error("Upload error details:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            if (!data || !data.publicUrl) throw new Error("Could not get public URL");

            setFormData({ ...formData, imageUrl: data.publicUrl });
        } catch (error) {
            alert('画像のアップロードに失敗しました: ' + (error.message || "Unknown Error"));
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("このブラウザは音声入力に対応していません。");
            return;
        }

        if (isListening) {
            setIsListening(false);
            // Stop logic handles automatically by not restarting
        } else {
            setIsListening(true);
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setFormData(prev => ({ ...prev, memo: (prev.memo ? prev.memo + '\n' : '') + transcript }));
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error(event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            }

            recognition.start();
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

            if (type === 'work' || type === 'tweet' || !type) {
                setFormData({ ...formData, timeEnd: end.toTimeString().slice(0, 5), amount: `${Math.round(diffCols)}分` });
            } else {
                setFormData({ ...formData, timeEnd: end.toTimeString().slice(0, 5) });
            }
        } else {
            // Start
            setTimerRunning(true);
            setTimerStartTime(new Date());
            setFormData({ ...formData, timeStart: new Date().toTimeString().slice(0, 5) });
        }
    };

    const handleSubmit = () => {
        if (type === 'pesticide' && !formData.pesticide) return alert("農薬/資材を選択してください");
        if (type === 'work' && !formData.workType) return alert("作業内容を選択してください");
        onSubmit(formData);
    };

    const handleMapSelect = (field, range) => {
        setFormData({ ...formData, field, range });
        setShowMap(false);
    };

    const availableWorkTypes = [...(WORK_TYPES[formData.crop] || []), ...(settings?.custom_work_types || ["その他"])];
    const availableInventory = inventory ? inventory.filter(i =>
        type === 'pesticide' ? (i.category === '農薬' || i.category === '除草剤' || i.category === '殺菌剤' || i.category === '殺虫剤') :
            type === 'fertilizer' ? (i.category === '肥料' || i.category === '液肥') : true
    ) : [];

    if (type === 'tweet') {
        // ... (Keep existing Tweet logic)
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end">
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
                        <textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-5 h-48 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-lg placeholder:text-slate-400 resize-none font-medium" placeholder="現場の様子や気づきを入力..."></textarea>

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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end">
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
                    {/* ... (Keep existing photo upload UI) ... */}
                    <div className="bg-slate-50 rounded-2xl h-32 flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors relative">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {uploading ? (
                            <span className="text-slate-400 font-bold animate-pulse">アップロード中...</span>
                        ) : formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Uploaded" className="h-full object-contain rounded-xl" />
                        ) : (
                            <div className="flex flex-col items-center space-y-2 text-slate-400">
                                <Camera size={24} />
                                <span className="text-xs font-bold">証拠写真を撮影 (必須)</span>
                            </div>
                        )}
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center space-x-2 text-green-600 font-extrabold text-xs uppercase tracking-wider bg-green-50 inline-block px-3 py-1 rounded-md mb-2"><Timer size={14} /> <span>日時・場所・作物</span></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">日付</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">対象作物</label><select value={formData.crop} onChange={(e) => setFormData({ ...formData, crop: e.target.value, workType: "" })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">{availableCrops.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
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
                                    fields={MOCK_FIELDS}
                                    selectedField={formData.field}
                                    selectedRange={formData.range}
                                    onSelect={handleMapSelect}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">{MOCK_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                                    <select value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"><option value="全面">全面</option><option value="東側">東側</option><option value="西側">西側</option><option value="外周のみ">外周のみ</option><option value="スポット">スポット</option></select>
                                </div>
                            )}
                        </div>

                        {/* Timer Logic - Common */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-slate-500">作業時間 (自動計測)</label>
                                {timerRunning && <span className="text-xs font-bold text-red-500 animate-pulse">● 計測中...</span>}
                            </div>
                            <div className="flex space-x-3 items-center">
                                <button onClick={toggleTimer} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${timerRunning ? 'bg-red-500 text-white shadow-red-200 shadow-lg' : 'bg-slate-800 text-white shadow-lg'}`}>
                                    {timerRunning ? <><span className="w-3 h-3 bg-white rounded-sm"></span><span>停止・完了</span></> : <><div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div><span>作業開始</span></>}
                                </button>
                                <div className="w-24 text-center">
                                    <div className="text-xs font-bold text-slate-400">{timerRunning ? "開始" : "結果"}</div>
                                    <div className="text-lg font-extrabold text-slate-800">
                                        {timerRunning ? formData.timeStart :
                                            (type === 'work' ? (formData.amount || "--") : (formData.timeEnd || "--:--"))}
                                    </div>
                                </div>
                            </div>
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
                                    {availableMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* Main Agent (Pesticide/Fertilizer) with Search & Safety Check */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-red-500 ml-1">
                                        {type === 'fertilizer' ? '使用肥料 (在庫連動)' : '主剤 (在庫連動・検索)'}
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <label className="text-xs font-bold text-slate-400">混用あり？</label>
                                        <div onClick={() => setFormData({ ...formData, isMixing: !formData.isMixing })} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${formData.isMixing ? 'bg-green-500' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isMixing ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        list="pesticide-options"
                                        value={type === 'fertilizer' ? formData.fertilizer : formData.pesticide}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const field = type === 'fertilizer' ? 'fertilizer' : 'pesticide';
                                            setFormData({ ...formData, [field]: val });

                                            // Safety Check for Mixing
                                            if (type === 'pesticide' && formData.mixes.length > 0) {
                                                const rules = INCOMPATIBLE_MIXES[val];
                                                if (rules) {
                                                    const risks = formData.mixes.filter(m => rules.includes(m.name));
                                                    if (risks.length > 0) {
                                                        alert(`【危険】選択した薬剤「${val}」は「${risks.map(r => r.name).join(', ')}」と混用できません！`);
                                                        setFormData(prev => ({ ...prev, [field]: "" }));
                                                    }
                                                }
                                            }
                                        }}
                                        className="w-full bg-red-50 border border-red-200 text-red-900 font-bold rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none placeholder:text-red-300"
                                        placeholder={type === 'fertilizer' ? "肥料名を検索..." : "薬剤名を検索..."}
                                    />
                                    <datalist id="pesticide-options">
                                        {availableInventory.map(i => <option key={i.id} value={i.name}>在庫: {i.quantity}{i.unit}</option>)}
                                        {type === 'pesticide' && MOCK_PESTICIDES_EXTENDED.map(p => <option key={`ext-${p.id}`} value={p.name}>{p.category} ({p.target})</option>)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Advanced Fields: Dilution Calculator (Pesticide) */}
                            {type === 'pesticide' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 flex items-center"><Calculator size={14} className="mr-1" /> 希釈計算</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">水量 (L)</label>
                                            <input
                                                type="number"
                                                value={formData.waterAmount || ''}
                                                onChange={(e) => {
                                                    const water = parseFloat(e.target.value);
                                                    const ratio = parseFloat(formData.dilutionRatio || formData.dilution);
                                                    let amount = formData.amount;
                                                    if (water && ratio) {
                                                        amount = (water * 1000 / ratio).toFixed(1);
                                                    }
                                                    setFormData({ ...formData, waterAmount: e.target.value, amount });
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                                placeholder="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">希釈倍率</label>
                                            <input
                                                type="number"
                                                value={formData.dilutionRatio || formData.dilution || ''}
                                                onChange={(e) => {
                                                    const ratio = parseFloat(e.target.value);
                                                    const water = parseFloat(formData.waterAmount);
                                                    let amount = formData.amount;
                                                    if (water && ratio) {
                                                        amount = (water * 1000 / ratio).toFixed(1);
                                                    }
                                                    setFormData({ ...formData, dilutionRatio: e.target.value, dilution: e.target.value, amount });
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                                placeholder="1000"
                                            />
                                        </div>
                                    </div>
                                    {formData.waterAmount && (formData.dilutionRatio || formData.dilution) && (
                                        <div className="text-right">
                                            <span className="text-xs text-slate-500 mr-2">必要薬量:</span>
                                            <span className="text-lg font-bold text-green-600">{formData.amount} ml</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Advanced Fields: Components (Fertilizer) */}
                            {type === 'fertilizer' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">成分量 (%)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">N</span>
                                                <input type="number" placeholder="8" className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                                                    value={formData.componentN || ''} onChange={(e) => setFormData({ ...formData, componentN: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">P</span>
                                                <input type="number" placeholder="8" className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                                                    value={formData.componentP || ''} onChange={(e) => setFormData({ ...formData, componentP: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">K</span>
                                                <input type="number" placeholder="8" className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                                                    value={formData.componentK || ''} onChange={(e) => setFormData({ ...formData, componentK: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">施肥基準</label>
                                        <input
                                            type="text"
                                            value={formData.applicationAmount || ''}
                                            onChange={(e) => setFormData({ ...formData, applicationAmount: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 font-bold text-slate-800"
                                            placeholder="例: 10kg/10a"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Dilution & Amount for Main Agent */}
                            <div className="grid grid-cols-2 gap-4">
                                {type === 'pesticide' && <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">希釈倍率</label><input type="number" value={formData.dilution} onChange={(e) => setFormData({ ...formData, dilution: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 text-right focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none text-lg" placeholder="1000" /></div>}
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">使用量</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 text-right focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none text-lg" placeholder="100" /></div>
                            </div>

                            {/* Mixing Section */}
                            {formData.isMixing && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-3 animate-in slide-in-from-top-1">
                                    <p className="text-xs font-bold text-slate-500">混用薬剤の追加 ({formData.mixes.length}剤)</p>

                                    {/* Mixing List */}
                                    {formData.mixes.map((mix, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                                            <span>{mix.name} ({mix.ratio ? mix.ratio + '倍' : ''} {mix.amount})</span>
                                            <button onClick={() => removeMix(idx)} className="text-red-400 hover:text-red-500 p-1"><X size={16} /></button>
                                        </div>
                                    ))}

                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="text"
                                            value={mixInput}
                                            onChange={(e) => setMixInput(e.target.value)}
                                            placeholder="混用する薬剤名"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-3 text-sm font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                        />
                                        <div className="flex space-x-2">
                                            <input type="number" value={mixRatio} onChange={(e) => setMixRatio(e.target.value)} placeholder="倍率" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-3 text-sm font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-right" />
                                            <input type="text" value={mixAmount} onChange={(e) => setMixAmount(e.target.value)} placeholder="量" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-3 text-sm font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-right" />
                                            <button
                                                onClick={() => {
                                                    // Safety Check before adding mix
                                                    const rules = INCOMPATIBLE_MIXES[formData.pesticide];
                                                    if (rules && rules.includes(mixInput)) {
                                                        alert(`【危険】「${formData.pesticide}」と「${mixInput}」は混用できません！`);
                                                        return;
                                                    }
                                                    addMix();
                                                }}
                                                className="bg-slate-800 text-white px-4 rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md transition-transform active:scale-95"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'pesticide' && (
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">対象 (虫・病気など)</label><select value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"><option value="" disabled>選択してください</option>{MOCK_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
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
                        <div className="space-y-1.5 align-middle">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-500 ml-1">メモ (任意)</label>
                                <button onClick={toggleVoiceInput} type="button" className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white' : 'bg-slate-600'}`}></div>
                                    <span>{isListening ? '聞いています...' : '音声入力'}</span>
                                </button>
                            </div>
                            <textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none resize-none"></textarea>
                        </div>
                    </section>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"><button onClick={handleSubmit} className="w-full py-4 rounded-2xl font-bold text-xl shadow-xl bg-green-600 hover:bg-green-500 text-white shadow-green-100 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"><CheckCircle2 size={24} /><span>記録して完了</span></button></div>
            </div>
        </div>
    );
}
