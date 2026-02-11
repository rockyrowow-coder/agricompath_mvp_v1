import React, { useState } from 'react';
import { X, FileText, Download, ChevronRight, CheckCircle2, Camera, Timer, Beaker, ClipboardList } from 'lucide-react';
import { MenuButton } from './Shared';
import { MapSelector } from './MapSelector';
import { MOCK_CROPS, MOCK_FIELDS, MOCK_WORKERS, MOCK_PESTICIDES, MOCK_METHODS, MOCK_TARGETS, WORK_TYPES, SPREADING_METHODS, USER_CROPS } from '../data/constants';

export function CSVExportModal({ onClose, records }) { // Added records prop
    const [selectedIds, setSelectedIds] = useState(records ? records.map(r => r.id) : []);

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleAll = () => {
        if (selectedIds.length === records.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(records.map(r => r.id));
        }
    };

    const handleExport = () => {
        // Filter for JA Report (Pesticide & Fertilizer only)
        const dataToExport = records
            .filter(r => selectedIds.includes(r.id))
            .filter(r => r.type === 'pesticide' || r.type === 'fertilizer');

        if (dataToExport.length === 0) {
            alert("防除・施肥記録が選択されていません。");
            return;
        }

        // Generate CSV content (JA Submission Format)
        // Headers: 日付, 圃場, 作物, 農薬・肥料名, 倍率, 使用量, 使用方法
        const headers = ["日付", "圃場", "作物", "農薬・肥料名", "倍率", "使用量", "使用方法"];

        const csvRows = dataToExport.map(r => {
            // Safe handling for CSV fields (quotes if needed)
            const safe = (val) => {
                if (val === null || val === undefined) return "";
                const str = String(val);
                return str.includes(",") ? `"${str}"` : str;
            };

            return [
                safe(r.date),
                safe(r.field),
                safe(r.crop),
                safe(r.pesticide || r.detail), // Pesticide name or Fertilizer name
                safe(r.dilution ? `${r.dilution}倍` : '-'),
                safe(r.amount),
                safe(r.method || '-')
            ].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");

        // Download with BOM for Excel compatibility
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `JA_cultivation_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-6">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">CSVデータ出力</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">出力するデータを選択してください</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10">
                    <button onClick={toggleAll} className="text-sm font-bold text-green-600 hover:text-green-700">
                        {selectedIds.length === records.length ? '全解除' : '全選択'}
                    </button>
                    <span className="text-sm font-bold text-slate-500">{selectedIds.length}件 選択中</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
                    {records && records.map(record => (
                        <div key={record.id} onClick={() => toggleSelect(record.id)} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedIds.includes(record.id) ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedIds.includes(record.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                    {selectedIds.includes(record.id) && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-mono font-bold text-slate-400">{record.date}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${record.type === 'pesticide' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{record.type === 'pesticide' ? '防除' : record.type === 'fertilizer' ? '施肥' : '作業'}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 mt-0.5">{record.detail}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{record.amount}</span>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                    <button onClick={handleExport} disabled={selectedIds.length === 0} className="w-full flex items-center justify-center space-x-2 bg-green-600 disabled:bg-slate-300 text-white hover:bg-green-500 py-3.5 rounded-xl font-bold shadow-lg shadow-green-100 transition-transform active:scale-95">
                        <Download size={20} />
                        <span>選択した{selectedIds.length}件を出力</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';

export function SettingsModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">設定</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">アカウント</h3>
                        <Link to="/login" onClick={onClose} className="block">
                            <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                                <span className="font-bold text-green-600">ログイン / 新規登録</span>
                                <ChevronRight size={20} className="text-green-600" />
                            </div>
                        </Link>
                        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                            <span className="font-bold text-slate-700">プロフィール編集</span>
                            <ChevronRight size={20} className="text-slate-400" />
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                            <span className="font-bold text-slate-700">所属部会設定</span>
                            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">東部会</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">記録設定</h3>
                        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                            <span className="font-bold text-slate-700">デフォルト圃場</span>
                            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">本田1号</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                            <span className="font-bold text-slate-700">作業時間の自動計測</span>
                            <div className="w-12 h-7 bg-green-500 rounded-full relative shadow-inner cursor-pointer"><div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RecordMenuOverlay({ onClose, onSelect }) {
    const [mode, setMode] = useState('initial');

    if (mode === 'initial') {
        return (
            <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200 px-6">
                <button onClick={onClose} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full"><X size={32} /></button>
                <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-md">何を作成しますか？</h2>
                <div className="grid gap-6 w-full max-w-sm">
                    <button onClick={() => onSelect('tweet')} className="group flex flex-col items-center justify-center bg-white hover:bg-green-50 p-8 rounded-3xl shadow-xl transition-all transform hover:scale-[1.02] border-4 border-transparent hover:border-green-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 border border-green-200 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Camera size={36} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">つぶやき (写真)</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 text-center">現場の写真を気軽にシェア。</p>
                    </button>

                    <button onClick={() => setMode('detail')} className="group flex flex-col items-center justify-center bg-white hover:bg-blue-50 p-8 rounded-3xl shadow-xl transition-all transform hover:scale-[1.02] border-4 border-transparent hover:border-blue-500">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 border border-blue-200 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ClipboardList size={36} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">営農記録 (通常)</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 text-center">詳細な作業内容を記録します。</p>
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-xs aspect-square">
                <button onClick={onClose} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl z-10 hover:text-slate-600 transition-colors"><X size={32} /></button>
                {/* Menu Buttons positioned around center */}
                {/* Using lighter colors for menu buttons to fit light theme but keeping them distinct */}
                <MenuButton icon={<Beaker size={28} />} label="農薬記録" color="bg-red-500" position="top-0 left-1/2 -translate-x-1/2 -translate-y-full" onClick={() => onSelect('pesticide')} />
                <MenuButton icon={<React.Fragment>🌱</React.Fragment>} label="肥料記録" color="bg-emerald-500" position="top-1/4 right-0 translate-x-1/4 -translate-y-1/2" onClick={() => onSelect('fertilizer')} />
                <MenuButton icon={<React.Fragment>🌾</React.Fragment>} label="収穫記録" color="bg-orange-500" position="bottom-1/4 right-0 translate-x-1/4 translate-y-1/2" onClick={() => onSelect('harvest')} />
                <MenuButton icon={<React.Fragment>📦</React.Fragment>} label="出荷記録" color="bg-blue-500" position="bottom-0 left-1/2 -translate-x-1/2 translate-y-full" onClick={() => onSelect('shipment')} />
                <MenuButton icon={<React.Fragment>🚜</React.Fragment>} label="作業記録" color="bg-slate-600" position="bottom-1/4 left-0 -translate-x-1/4 translate-y-1/2" onClick={() => onSelect('work')} />
                <MenuButton icon={<React.Fragment>💰</React.Fragment>} label="経理記録" color="bg-yellow-500" position="top-1/4 left-0 -translate-x-1/4 -translate-y-1/2" onClick={() => onSelect('accounting')} />

                <button onClick={() => setMode('initial')} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm font-bold underline hover:text-white">戻る</button>
            </div>
        </div>
    );
}



export function RecordModal({ type, onClose, onSubmit, inventory }) {
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
        yieldUnit: "kg"
    });
    const [showMap, setShowMap] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerStartTime, setTimerStartTime] = useState(null);
    const [mixInput, setMixInput] = useState("");
    const [mixRatio, setMixRatio] = useState("");
    const [mixAmount, setMixAmount] = useState("");

    const addMix = () => { if (mixInput) { setFormData({ ...formData, mixes: [...formData.mixes, { name: mixInput, ratio: mixRatio, amount: mixAmount }] }); setMixInput(""); setMixRatio(""); setMixAmount(""); } };
    const removeMix = (index) => { const newMixes = [...formData.mixes]; newMixes.splice(index, 1); setFormData({ ...formData, mixes: newMixes }); };

    const toggleTimer = () => {
        if (timerRunning) {
            // Stop
            setTimerRunning(false);
            const end = new Date();
            const start = timerStartTime;
            const diffCols = (end - start) / 1000 / 60; // minutes
            setFormData({ ...formData, timeEnd: end.toTimeString().slice(0, 5), amount: `${Math.round(diffCols)}分` });
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

    const availableWorkTypes = WORK_TYPES[formData.crop] || ["その他"];
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
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">対象作物</label><select value={formData.crop} onChange={(e) => setFormData({ ...formData, crop: e.target.value, workType: "" })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl p-3.5 appearance-none focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none">{USER_CROPS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
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
                                        <div className="text-lg font-extrabold text-slate-800">{formData.amount || "0分"}</div>
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
                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">メモ (任意)</label><textarea value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none resize-none"></textarea></div>
                    </section>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"><button onClick={handleSubmit} className="w-full py-4 rounded-2xl font-bold text-xl shadow-xl bg-green-600 hover:bg-green-500 text-white shadow-green-100 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"><CheckCircle2 size={24} /><span>記録して完了</span></button></div>
            </div>
        </div>
    );
}
