import React, { useState } from 'react';
import { Download, Layout, CalendarDays, Map as MapIcon, BarChart3, Sprout, Package, Receipt, FileText, Search, Filter, Plus, X, CheckCircle2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RecordTypeBadge } from './Shared';
import { MOCK_AI_TAGS } from '../data/constants';

// MaterialRegisterModal component
// MaterialRegisterModal component
const MaterialRegisterModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [category, setCategory] = useState('その他');
    const [price, setPrice] = useState(''); // New Field
    const [location, setLocation] = useState(''); // New Field
    const [receiptUrl, setReceiptUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false); // AI Analysis State

    // Mock Suggestions for Search
    const SUGGESTIONS = [
        "ダコニール1000", "アファーム乳剤", "モスピラン", "コテツフロアブル",
        "オルトラン", "ラウンドアップ", "マグホス", "尿素", "液肥トップワン"
    ];

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `receipts/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            console.log("Uploaded Receipt URL:", data.publicUrl);
            setReceiptUrl(data.publicUrl);

            // Simulate AI OCR Analysis
            analyzeReceipt(file);

        } catch (error) {
            alert('レシート画像のアップロードに失敗しました: ' + error.message);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const analyzeReceipt = (file) => {
        setAnalyzing(true);
        setTimeout(() => {
            // Mock AI Result
            setName("ダコニール1000");
            setPrice("1280");
            setLocation("コメリパワー");
            setQuantity("1");
            setUnit("本");
            setCategory("農薬");
            setAnalyzing(false);
            alert("✨ AIがレシートか情報を読み取りました！");
        }, 1500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !quantity || !unit || !category) {
            alert('必須項目（資材名、数量、単位、カテゴリ）を入力してください。');
            return;
        }
        // Receipt is optional now if user manually inputs, but encouraged
        onSubmit({
            name,
            quantity,
            unit,
            category,
            price: price ? parseInt(price) : null,
            location,
            receiptUrl
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <Package className="mr-2 text-green-600" /> 資材を登録
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Receipt Upload Section */}
                    <div className="bg-slate-50 rounded-2xl h-48 flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors relative group">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {analyzing ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <span className="text-slate-500 font-bold">AI解析中...</span>
                            </div>
                        ) : uploading ? (
                            <span className="text-slate-400 font-bold animate-pulse">アップロード中...</span>
                        ) : receiptUrl ? (
                            <div className="relative w-full h-full p-2">
                                <img src={receiptUrl} alt="Receipt" className="w-full h-full object-contain rounded-xl" />
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">再撮影</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-2 text-slate-400 group-hover:text-green-600 transition-colors">
                                <Camera size={40} />
                                <span className="text-sm font-bold">レシート/現物を撮影</span>
                                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full">AI自動入力</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">資材名 (検索・入力)</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    list="material-suggestions"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800"
                                    placeholder="例: ダコニール"
                                />
                                <datalist id="material-suggestions">
                                    {SUGGESTIONS.map(s => <option key={s} value={s} />)}
                                </datalist>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">カテゴリ</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800 appearance-none"
                                >
                                    <option value="農薬">農薬</option>
                                    <option value="肥料">肥料</option>
                                    <option value="種子">種子</option>
                                    <option value="資材">資材</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">購入場所</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800"
                                    placeholder="例: コメリ"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">数量</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800"
                                    placeholder="10"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">単位</label>
                                <input
                                    type="text"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800"
                                    placeholder="袋/L"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">金額 (円)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-bold text-slate-800"
                                    placeholder="1280"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-slate-900 disabled:bg-slate-400 text-white py-4 rounded-xl font-bold text-base hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-slate-200"
                    >
                        <CheckCircle2 size={20} />
                        <span>在庫に登録する</span>
                    </button>
                </form>
            </div>
        </div>
    );
};


// Calendar Import Modal (Mock OCR)
const CalendarImportModal = ({ onClose, onImport }) => {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [detectedRecords, setDetectedRecords] = useState([]);
    const [step, setStep] = useState('upload'); // upload, confirm

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
            analyzeImage(file);
        }
    };

    const analyzeImage = (file) => {
        setAnalyzing(true);
        // Simulate OCR / AI Analysis
        setTimeout(() => {
            const today = new Date();
            const year = today.getFullYear();
            // Mock detected data based on "Pest Control Calendar"
            const mockData = [
                { id: 1, date: `${year}-06-01`, crop: 'メロン', type: 'pesticide', detail: 'ダコニール1000', amount: '1000倍', method: '散布', selected: true },
                { id: 2, date: `${year}-06-10`, crop: 'メロン', type: 'pesticide', detail: 'アファーム乳剤', amount: '2000倍', method: '散布', selected: true },
                { id: 3, date: `${year}-06-15`, crop: 'メロン', type: 'fertilizer', detail: '液肥トップワン', amount: '500倍', method: '潅水', selected: true },
                { id: 4, date: `${year}-06-25`, crop: 'メロン', type: 'pesticide', detail: 'モスピラン', amount: '2000倍', method: '散布', selected: true },
            ];
            setDetectedRecords(mockData);
            setAnalyzing(false);
            setStep('confirm');
        }, 2000);
    };

    const toggleRecord = (id) => {
        setDetectedRecords(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
    };

    const handleConfirm = () => {
        const toImport = detectedRecords.filter(r => r.selected);
        onImport(toImport);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                        <CalendarDays className="mr-2 text-green-600" /> 防除暦読み込み
                    </h3>
                    <button onClick={onClose}><X className="text-slate-400" /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {step === 'upload' && (
                        <div className="flex flex-col items-center justify-center space-y-6 h-full">
                            <div className="w-full aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative hover:bg-slate-50 transition-colors group">
                                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {analyzing ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="font-bold text-slate-500">AI解析中...</p>
                                        <p className="text-xs text-slate-400 mt-2">防除暦の日付と薬剤を読み取っています</p>
                                    </div>
                                ) : (
                                    <>
                                        <Camera size={48} className="text-slate-300 mb-2 group-hover:text-green-500 transition-colors" />
                                        <p className="font-bold text-slate-500">写真を撮影 / アップロード</p>
                                        <p className="text-xs text-slate-400 mt-1">JAの防除暦などを撮影してください</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'confirm' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded-xl flex items-start space-x-3">
                                <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-green-800">{detectedRecords.length}件のデータを検出しました</p>
                                    <p className="text-xs text-green-600 mt-1">取り込む項目を選択してください。</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {detectedRecords.map(record => (
                                    <div
                                        key={record.id}
                                        onClick={() => toggleRecord(record.id)}
                                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${record.selected ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${record.selected ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                                            {record.selected && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{record.date}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${record.type === 'pesticide' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {record.type === 'pesticide' ? '防除' : '施肥'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm">{record.detail}</h4>
                                            <p className="text-xs text-slate-500">{record.amount}・{record.method}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white">
                    {step === 'confirm' ? (
                        <div className="flex space-x-3">
                            <button onClick={() => setStep('upload')} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl">再撮影</button>
                            <button onClick={handleConfirm} className="flex-1 py-3 font-bold text-white bg-green-600 rounded-xl shadow-lg shadow-green-200 hover:bg-green-500">
                                インポート ({detectedRecords.filter(r => r.selected).length})
                            </button>
                        </div>
                    ) : (
                        <button onClick={onClose} className="w-full py-3 font-bold text-slate-500 bg-slate-100 rounded-xl">キャンセル</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export function MyCultivationScreen({ records, onExport, inventory }) {
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showCalendarImport, setShowCalendarImport] = useState(false); // New State
    const { user } = useAuth();

    const handleRegisterMaterial = async (newMaterial) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('inventory')
                .insert([{
                    user_id: user.id,
                    name: newMaterial.name,
                    quantity: parseInt(newMaterial.quantity),
                    unit: newMaterial.unit,
                    category: newMaterial.category,
                    price: newMaterial.price,
                    location: newMaterial.location,
                    receipt_url: newMaterial.receiptUrl
                }]);

            if (error) throw error;
            setShowRegisterModal(false);
            alert("資材を登録しました。反映するにはリロードしてください。");
        } catch (e) {
            console.error("Error adding material:", e);
            alert("登録に失敗しました");
        }
    };

    const handleCalendarImport = async (importedRecords) => {
        if (!user || importedRecords.length === 0) return;

        try {
            const payload = importedRecords.map(r => ({
                user_id: user.id,
                date: r.date,
                type: r.type,
                crop: r.crop,
                detail: r.detail, // Store main info here
                pesticide: r.type === 'pesticide' ? r.detail : null,
                amount: r.amount,
                method: r.method,
                range: '全面', // Default
                memo: '防除暦取込'
            }));

            const { error } = await supabase.from('records').insert(payload);
            if (error) throw error;

            alert(`${importedRecords.length}件のデータをインポートしました！`);
            setShowCalendarImport(false);
            window.location.reload(); // Simple reload to refresh timeline
        } catch (error) {
            console.error(error);
            alert('インポートに失敗しました: ' + error.message);
        }
    };

    const filteredRecords = records.filter(record => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (record.detail && record.detail.toLowerCase().includes(term)) ||
            (record.crop && record.crop.toLowerCase().includes(term)) ||
            (record.memo && record.memo.toLowerCase().includes(term)) ||
            (record.pesticide && record.pesticide.toLowerCase().includes(term)) ||
            (record.workType && record.workType.toLowerCase().includes(term)) ||
            (record.target && record.target.toLowerCase().includes(term));

        const matchesType = filterType === 'all' || record.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleTagClick = (tag) => {
        setSearchTerm(tag.replace('#', ''));
    };

    return (
        <div className="p-4 space-y-4 pb-32 bg-slate-50 min-h-screen">
            <div className="flex flex-col space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 transition-all">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">MY栽培記録</h2>
                        <p className="text-xs font-medium text-slate-400">自分の全データを管理</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setShowCalendarImport(true)} className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-500 px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-transform active:scale-95">
                            <CalendarDays size={16} /> <span>防除暦取込</span>
                        </button>
                        <button onClick={onExport} className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-500 px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-100 transition-transform active:scale-95">
                            <Download size={16} /> <span>CSV出力</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="作物・資材・作業名で検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 appearance-none"
                            >
                                <option value="all">全て</option>
                                <option value="pesticide">防除</option>
                                <option value="fertilizer">施肥</option>
                                <option value="work">作業</option>
                                <option value="harvest">収穫</option>
                                <option value="accounting">経理</option>
                            </select>
                        </div>
                    </div>
                    {/* AI Suggested Tags */}
                    <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded flex-shrink-0">
                            <span className="text-purple-500">✨ AI分析:</span>
                        </div>
                        {MOCK_AI_TAGS.map(tag => (
                            <button key={tag} onClick={() => handleTagClick(tag)} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded whitespace-nowrap hover:bg-slate-50 hover:border-green-300 transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <button onClick={() => setViewMode('list')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><Layout size={16} /> <span>リスト</span></button>
                <button onClick={() => setViewMode('gantt')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'gantt' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><BarChart3 size={16} /> <span>工程表</span></button>
                <button onClick={() => setViewMode('inventory')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'inventory' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><Package size={16} /> <span>資材在庫</span></button>
                <button onClick={() => setViewMode('accounting')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'accounting' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><Receipt size={16} /> <span>経理</span></button>
                <button onClick={() => setViewMode('calendar')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><CalendarDays size={16} /> <span>防除暦</span></button>
                <button onClick={() => setViewMode('map')} className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><MapIcon size={16} /> <span>マップ</span></button>
            </div>

            {viewMode === 'list' && (
                <div className="space-y-3 animate-in fade-in">
                    {filteredRecords.map(record => (
                        <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{record.date}</span>
                                <RecordTypeBadge type={record.type} />
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-base font-bold text-slate-800">{record.detail || record.workType || "名称未設定"}</span>
                                {record.type === 'accounting' && <span className="text-lg font-bold text-slate-800">{record.amount}</span>}
                                {record.type === 'harvest' && <span className="text-lg font-bold text-orange-600">{record.amount}</span>}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 font-bold space-x-2">
                                <span className="flex items-center"><Sprout size={12} className="mr-1" /> {record.crop}</span>
                                <div>•</div>
                                <span>{record.timeStart ? `${record.timeStart} ~` : ''} {record.range}</span>
                            </div>
                            {/* Specific details for new fields */}
                            {(record.pesticide || record.workType) && (
                                <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded relative">
                                    {record.pesticide && <div>資材: {record.pesticide}</div>}
                                    {record.workType && <div>作業: {record.workType} {record.amount ? `(${record.amount})` : ''}</div>}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-10 text-slate-400 font-bold text-sm">該当する記録がありません</div>
                    )}
                </div>
            )}

            {viewMode === 'gantt' && (
                <GanttView records={filteredRecords} />
            )}

            {viewMode === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                    {inventory && inventory.map(item => (
                        <div key={item.id} className={`bg-white p-5 rounded-2xl border ${item.quantity <= 1 ? 'border-red-200 bg-red-50' : 'border-slate-200'} shadow-sm flex flex-col justify-between h-full`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.category === '農薬' ? 'bg-red-100 text-red-600' : item.category === '肥料' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>{item.category}</span>
                                {item.quantity <= 1 && <span className="text-[10px] font-bold text-red-500 flex items-center bg-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">在庫僅少</span>}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{item.name}</h3>
                                <p className="text-sm font-medium text-slate-500">1単位: {item.unit}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                                <span className="text-xs font-bold text-slate-400">現在庫</span>
                                <span className={`text-2xl font-extrabold ${item.quantity <= 1 ? 'text-red-500' : 'text-slate-800'}`}>{item.quantity} <span className="text-sm font-bold text-slate-500">個</span></span>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setShowRegisterModal(true)} className="col-span-1 md:col-span-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center space-x-2">
                        <Plus size={20} />
                        <span>新しい資材を登録</span>
                    </button>
                </div>
            )}

            {showRegisterModal && (
                <MaterialRegisterModal onClose={() => setShowRegisterModal(false)} onSubmit={handleRegisterMaterial} />
            )}

            {/* Calendar Import Modal Integration */}
            {showCalendarImport && (
                <CalendarImportModal onClose={() => setShowCalendarImport(false)} onImport={handleCalendarImport} />
            )}

            {viewMode === 'accounting' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">今月の経費合計 (概算)</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">¥12,450</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                            <Receipt size={24} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredRecords.filter(r => r.type === 'accounting').length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm font-bold">まだ経理記録がありません</div>
                        ) : (
                            filteredRecords.filter(r => r.type === 'accounting').map(record => (
                                <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{record.detail}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{record.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-extrabold text-slate-800">{record.amount}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg h-32 flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <span className="text-xs font-bold text-slate-400">レシート画像</span>
                                    </div>
                                    {record.range !== "-" && <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block self-start">メモ: {record.range}</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'map' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in h-64 relative flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-slate-100 opacity-50 patterned-bg"></div>
                    <p className="relative z-10 text-xs font-bold text-slate-400 bg-white/80 px-4 py-2 rounded-full backdrop-blur">作業範囲データに基づくヒートマップを表示予定</p>
                </div>
            )}
        </div>
    );
}

function GanttView({ records }) {
    // Determine date range (past 14 days + future 7 days for demo)
    const today = new Date();
    const dates = [];
    for (let i = -14; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    // Group by crop
    const crops = [...new Set(records.map(r => r.crop))];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-700">栽培工程チャート</h3>
            </div>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] p-4">
                    {/* Header Dates */}
                    <div className="flex ml-24 mb-4">
                        {dates.map((date) => {
                            const d = new Date(date);
                            const isToday = d.toDateString() === new Date().toDateString();
                            return (
                                <div key={date} className={`flex-shrink-0 w-8 text-center text-[10px] font-bold ${isToday ? 'text-green-600' : 'text-slate-400'}`}>
                                    {d.getDate()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rows */}
                    <div className="space-y-6">
                        {crops.map(crop => (
                            <div key={crop} className="relative">
                                {/* Row Label */}
                                <div className="absolute left-0 top-0 w-20 flex items-center space-x-1.5 pt-1">
                                    <div className="bg-green-100 p-1.5 rounded-lg"><Sprout size={14} className="text-green-600" /></div>
                                    <span className="text-xs font-bold text-slate-700 truncate">{crop}</span>
                                </div>

                                {/* Timeline Lane */}
                                <div className="ml-24 flex relative h-8 items-center bg-slate-50 rounded-full">
                                    {/* Grid Lines */}
                                    {dates.map((date) => (
                                        <div key={date} className="flex-shrink-0 w-8 h-full border-r border-slate-200/50"></div>
                                    ))}

                                    {/* Record Bars */}
                                    {records.filter(r => r.crop === crop).map(record => {
                                        const recordDate = record.date;
                                        const dateIndex = dates.indexOf(recordDate);
                                        if (dateIndex === -1) return null;

                                        let colorClass = "bg-slate-400";
                                        if (record.type === 'pesticide') colorClass = "bg-red-400";
                                        if (record.type === 'fertilizer') colorClass = "bg-green-500";
                                        if (record.type === 'harvest') colorClass = "bg-orange-400";
                                        if (record.type === 'work') colorClass = "bg-blue-400"; // Added color for work

                                        return (
                                            <div
                                                key={record.id}
                                                className={`absolute h-6 rounded-md shadow-sm border border-white/20 ${colorClass} group cursor-pointer hover:z-10 hover:scale-110 transition-transform`}
                                                style={{ left: `${dateIndex * 32 + 2}px`, width: '28px' }}
                                            >
                                                {/* Tooltip */}
                                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded-lg font-bold z-20 shadow-xl pointer-events-none">
                                                    {record.detail || record.workType || "作業"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-100 p-3 flex justify-center space-x-4">
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-red-400"></span><span className="text-[10px] font-bold text-slate-500">防除</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-green-500"></span><span className="text-[10px] font-bold text-slate-500">施肥</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-orange-400"></span><span className="text-[10px] font-bold text-slate-500">収穫</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-blue-400"></span><span className="text-[10px] font-bold text-slate-500">作業</span></div>
            </div>
        </div>
    );
}
